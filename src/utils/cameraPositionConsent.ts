const CAMERA_POSITION_CONSENT_KEY = "slippy.consent";

export type CameraPositionConsent = "granted" | "denied";

export function getCameraPositionConsent(): CameraPositionConsent | null {
  const value = localStorage.getItem(CAMERA_POSITION_CONSENT_KEY);
  if (value === "granted" || value === "denied") {
    return value;
  }
  return null;
}

export function setCameraPositionConsent(consent: CameraPositionConsent): void {
  localStorage.setItem(CAMERA_POSITION_CONSENT_KEY, consent);
}

export function hasCameraPositionStorageConsent(): boolean {
  const consent = getCameraPositionConsent();
  if (consent === "granted") {
    return true;
  }
  if (consent === "denied") {
    return false;
  }
  // Legacy visits before the consent prompt existed.
  return localStorage.getItem("slippy.lat") !== null;
}

export function isCameraPositionConsentPending(): boolean {
  if (getCameraPositionConsent() !== null) {
    return false;
  }
  return localStorage.getItem("slippy.lat") === null;
}
