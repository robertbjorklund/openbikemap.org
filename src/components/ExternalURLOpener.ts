export function openCookiePolicy() {
  openURL("https://openbikemap.org/pages/cookiepolicy");
}

function openURL(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.click();
}
