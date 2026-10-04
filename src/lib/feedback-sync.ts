/** Pure rules for offline feedback sync and Noor's SMS drafts (no paid SMS provider). */
export type FeedbackSync = "saved" | "waiting" | "synced" | "failed";
export type SmsDraftStatus = "ready" | "opened" | "sent";
export type SmsFrequency = "immediate" | "daily" | "weekly";

export const SYNC_LABEL: Record<FeedbackSync, string> = {
  saved: "Saved on this device",
  waiting: "Waiting to sync",
  synced: "Synced",
  failed: "Sync failed",
};
/** We cannot confirm SMS delivery without a paid provider, so "Delivered" is never shown. */
export const SMS_LABEL: Record<SmsDraftStatus, string> = {
  ready: "Ready to send",
  opened: "Opened in messages app",
  sent: "Marked sent",
};

type Item = { id: string; consent?: boolean | undefined; sync?: FeedbackSync | undefined };

/** Items that still need syncing. Items without a sync field are old/sample data and count as synced. Never removes anything. */
export function pendingSync<T extends Item>(list: T[], inFlight: ReadonlySet<string>): T[] {
  return list.filter((f) => f.consent && f.sync && f.sync !== "synced" && !inFlight.has(f.id));
}

const DAY = 86400000;
export function digestDue(freq: SmsFrequency, lastAt: number | undefined, now: number, newCount: number): boolean {
  if (newCount === 0) return false;
  if (freq === "immediate" || !lastAt) return true;
  return now - lastAt >= (freq === "daily" ? DAY : 7 * DAY);
}

/** Translations below this confidence are held for review instead of shown. */
export const REVIEW_THRESHOLD = 0.7;
export const needsReview = (confidence: number | undefined) => confidence !== undefined && confidence < REVIEW_THRESHOLD;

export function smsLink(phone: string, body: string) {
  return `sms:${phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
}
