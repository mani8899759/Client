/** Friendly messages for error codes raised by the database functions. */
const MESSAGES: Record<string, string> = {
  forbidden: "You are not allowed to perform this action.",
  owner_required: "Only an owner account can perform this action.",
  reason_required: "Please give a reason of at least 5 characters.",
  not_found: "The record could not be found.",
  duplicate: "Another participant already uses this mobile number or email address.",
  invalid: "Some values are invalid. Please check the form.",
  already_verified: "This participant is already verified.",
  not_verified: "This participant is not verified.",
  inactive: "This registration is cancelled.",
  draw_already_completed: "The lucky draw has already been completed. Results are locked.",
  draw_not_completed: "Only a completed draw can be voided.",
  registration_open: "Close registration before executing the draw.",
  config_changed: "The draw configuration changed. Review the details and confirm again.",
  no_eligible_participants: "There are no eligible participants.",
  insufficient_eligible_participants: "There are fewer eligible participants than the configured number of winners.",
  invalid_winner_count: "Winner count must be between 1 and 500.",
};

export function friendlyDbError(error: { message?: string; code?: string } | null | undefined): string {
  if (!error) return "Something went wrong.";
  const code = error.message?.trim() ?? "";
  if (MESSAGES[code]) return MESSAGES[code];
  if (error.code === "23505") return MESSAGES.duplicate!;
  if (error.code === "23503") return "This record is still in use elsewhere and cannot be removed.";
  if (error.code === "23514") return MESSAGES.invalid!;
  if (error.code === "42501") return MESSAGES.forbidden!;
  return "Something went wrong. Please try again.";
}
