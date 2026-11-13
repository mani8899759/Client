"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, str, uuid, withAdmin, type ActionState } from "@/lib/admin/actions";
import { friendlyDbError } from "@/lib/auth/errors";
import {
  fieldErrorsOf,
  normalizeEmail,
  normalizeIndianMobile,
  participantCorrectionSchema,
} from "@/lib/validation/participant";

function refresh(id?: string | null) {
  revalidatePath("/admin/participants");
  revalidatePath("/admin/verification");
  revalidatePath("/admin/lucky-draw");
  if (id) revalidatePath(`/admin/participants/${id}`);
}

/** Admin correction of participant details. Side changes require the owner role (enforced in the database). */
export async function correctParticipant(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const parsed = participantCorrectionSchema.safeParse({
      participantId: str(fd, "participantId"),
      fullName: str(fd, "fullName") ?? "",
      mobile: str(fd, "mobile") ?? "",
      email: str(fd, "email") ?? "",
      gender: str(fd, "gender") ?? undefined,
      address: str(fd, "address") ?? "",
      side: str(fd, "side") ?? undefined,
      reason: str(fd, "reason") ?? "",
    });
    if (!parsed.success) return fail("Please correct the highlighted fields.", fieldErrorsOf(parsed.error));
    const d = parsed.data;
    const { error } = await supabase.rpc("admin_update_participant", {
      p_participant_id: d.participantId,
      p_full_name: d.fullName,
      p_mobile_number: d.mobile,
      p_normalized_mobile: normalizeIndianMobile(d.mobile),
      p_email: d.email,
      p_normalized_email: normalizeEmail(d.email),
      p_gender: d.gender,
      p_address: d.address,
      p_side: d.side,
      p_reason: d.reason,
    });
    if (error) return fail(friendlyDbError(error));
    refresh(d.participantId);
    return ok("Participant updated and recorded in the audit log.");
  });
}

export async function manualVerify(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid participant.");
    const { error } = await supabase.rpc("admin_manual_verify", { p_participant_id: id, p_reason: str(fd, "reason") ?? "" });
    if (error) return fail(friendlyDbError(error));
    refresh(id);
    return ok("Participant verified manually.");
  });
}

export async function revertVerification(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid participant.");
    const { error } = await supabase.rpc("admin_revert_verification", { p_participant_id: id, p_reason: str(fd, "reason") ?? "" });
    if (error) return fail(friendlyDbError(error));
    refresh(id);
    return ok("Verification reverted to pending.");
  });
}

export async function setRegistrationStatus(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    const status = str(fd, "status");
    if (!id || (status !== "registered" && status !== "cancelled")) return fail("Invalid request.");
    const { error } = await supabase.rpc("admin_set_registration_status", {
      p_participant_id: id,
      p_status: status,
      p_reason: str(fd, "reason") ?? "",
    });
    if (error) return fail(friendlyDbError(error));
    refresh(id);
    return ok(status === "cancelled" ? "Registration cancelled." : "Registration reinstated.");
  });
}
