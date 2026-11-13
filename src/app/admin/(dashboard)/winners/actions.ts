"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, revalidatePublic, str, uuid, withAdmin, type ActionState } from "@/lib/admin/actions";
import { friendlyDbError } from "@/lib/auth/errors";

export async function updateWinner(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    const gift = str(fd, "gift_status");
    if (!id) return fail("Invalid winner.");
    if (gift !== "pending" && gift !== "contacted" && gift !== "delivered") return fail("Choose a gift status.");
    const name = str(fd, "public_display_name");
    if (name && name.length > 80) return fail("Display name must be 80 characters or fewer.", { public_display_name: ["Too long."] });
    const notes = str(fd, "gift_notes");
    if (notes && notes.length > 500) return fail("Notes must be 500 characters or fewer.", { gift_notes: ["Too long."] });
    const { error } = await supabase.rpc("admin_update_winner", {
      p_winner_id: id,
      p_gift_status: gift,
      p_public_display_name: name,
      p_gift_notes: notes,
    });
    if (error) return fail(friendlyDbError(error));
    revalidatePath("/admin/winners");
    revalidatePublic();
    return ok("Winner updated.");
  });
}
