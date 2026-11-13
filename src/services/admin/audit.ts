const LABELS: Record<string, string> = {
  "participant.correction": "Participant corrected",
  "participant.side_correction": "Participant side corrected",
  "participant.manual_verify": "Manual verification",
  "participant.verification_reverted": "Verification reverted",
  "participant.registration_status": "Registration status changed",
  "participants.export": "Participants exported",
  "auth.sign_in": "Administrator signed in",
  "auth.sign_out": "Administrator signed out",
  "auth.password_changed": "Administrator password changed",
  "registration.opened": "Registration opened",
  "registration.closed": "Registration closed",
  "verification.activated": "QR verification activated",
  "verification.deactivated": "QR verification deactivated",
  "winners.published": "Winners made public",
  "winners.hidden": "Winners hidden",
  "settings.update": "Settings updated",
  "lucky_draw.config_update": "Draw configuration updated",
  "lucky_draw.execute": "Lucky draw executed",
  "lucky_draw.void": "Lucky draw voided",
  "winner.gift_status": "Gift status updated",
  "winner.update": "Winner details updated",
  "wedding_settings.update": "Website content updated",
  "live_streams.create": "Live stream added",
  "live_streams.update": "Live stream updated",
  "live_streams.delete": "Live stream deleted",
  "events.delete": "Event deleted",
  "venues.delete": "Venue deleted",
  "story_entries.delete": "Story entry deleted",
  "gallery_media.delete": "Gallery item deleted",
  "gallery_categories.delete": "Gallery category deleted",
};

export function auditActionLabel(action: string): string {
  return LABELS[action] ?? action.replace(/[._]/g, " ");
}

export const AUDIT_ACTIONS = Object.keys(LABELS);
