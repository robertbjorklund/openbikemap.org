import { AppConfig } from "../AppConfig";

export type FeedbackCategory = "bug" | "map-data" | "improvement" | "other";

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "Bug",
  "map-data": "Map data",
  improvement: "Improvement",
  other: "Other",
};

const MAX_MESSAGE_LENGTH = 4000;

export function buildFeedbackGitHubIssueUrl(
  category: FeedbackCategory,
  message: string,
): string {
  const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  const label = FEEDBACK_CATEGORY_LABELS[category];
  const title = `[${label}] Feedback`;
  const body = `${trimmed}

---
**Category:** ${label}
**Page:** ${window.location.href}
**Browser:** ${navigator.userAgent}
**Time:** ${new Date().toISOString()}
`;

  const params = new URLSearchParams({ title, body });
  return `${AppConfig.feedbackGithubRepo}/issues/new?${params.toString()}`;
}
