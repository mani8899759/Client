"use server";

import { revalidatePath } from "next/cache";
import { fail, int, ok, revalidatePublic, str, uuid, withAdmin, type ActionState } from "@/lib/admin/actions";
import { friendlyDbError } from "@/lib/auth/errors";

function refresh() {
  revalidatePath("/admin/lucky-draw");
  revalidatePath("/admin/winners");
  revalidatePath("/admin");
  revalidatePublic();
}

export async function saveDrawConfig(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const winnerCount = int(fd, "winner_count", 0);
    const rule = str(fd, "eligibility_rule");
    if (winnerCount < 1 || winnerCount > 500) return fail("Winner count must be between 1 and 500.", { winner_count: ["1–500."] });
    if (rule !== "verified_only" && rule !== "all_registered") return fail("Choose an eligibility rule.");
    const { error } = await supabase.rpc("admin_update_draw_config", {
      p_winner_count: winnerCount,
      p_eligibility_rule: rule,
      p_event_id: uuid(fd, "event_id"),
    });
    if (error) return fail(friendlyDbError(error));
    refresh();
    return ok("Draw configuration saved.");
  });
}

/**
 * Executes the draw on the server: execute_lucky_draw() selects winners with
 * pgcrypto's CSPRNG inside a single transaction and refuses to run twice.
 */
export async function executeDraw(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const expectedCount = int(fd, "expected_winner_count", 0);
    const expectedRule = str(fd, "expected_rule");
    if (expectedCount < 1 || (expectedRule !== "verified_only" && expectedRule !== "all_registered")) return fail("Invalid confirmation.");
    const { data, error } = await supabase.rpc("execute_lucky_draw", {
      p_expected_winner_count: expectedCount,
      p_expected_rule: expectedRule,
    });
    if (error) return fail(friendlyDbError(error));
    refresh();
    return ok("The lucky draw is complete. Results are saved and locked.", { drawId: data as string });
  });
}

export async function voidDraw(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid draw.");
    const { error } = await supabase.rpc("admin_void_draw", { p_draw_id: id, p_reason: str(fd, "reason") ?? "" });
    if (error) return fail(friendlyDbError(error));
    refresh();
    return ok("The draw was voided and hidden from the public. You may run a new draw.");
  });
}
