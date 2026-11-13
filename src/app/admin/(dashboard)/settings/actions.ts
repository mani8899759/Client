"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, revalidatePublic, str, withAdmin, type ActionState } from "@/lib/admin/actions";
import { friendlyDbError } from "@/lib/auth/errors";

const TOGGLES = {
  registration_open: ["Registration opened.", "Registration closed."],
  verification_enabled: ["QR verification activated.", "QR verification deactivated."],
  winners_public: ["Winners are now public.", "Winners are hidden from the public."],
  live_section_visible: ["Live streams are visible.", "Live streams are hidden."],
} as const;

type ToggleKey = keyof typeof TOGGLES;

/** Flip an operational switch. Each change is audited by a database trigger. */
export async function setAppToggle(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const key = str(fd, "key") as ToggleKey | null;
    if (!key || !(key in TOGGLES)) return fail("Unknown setting.");
    const value = str(fd, "value") === "true";

    if (key === "winners_public" && value) {
      const { data } = await supabase.from("lucky_draws").select("id").eq("status", "completed").maybeSingle();
      if (!data) return fail("There is no completed draw to publish yet.");
    }

    const { error } = await supabase.from("app_settings").update({ [key]: value }).eq("id", true);
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    revalidatePath("/admin", "layout");
    return ok(TOGGLES[key][value ? 0 : 1]);
  });
}

export async function saveConsent(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const text = str(fd, "consent_text");
    const version = str(fd, "consent_policy_version");
    if (!text || text.length < 10 || text.length > 1000) return fail("Consent text must be 10–1000 characters.", { consent_text: ["10–1000 characters."] });
    if (!version || version.length > 40) return fail("Enter a policy version (40 characters max).", { consent_policy_version: ["Required."] });
    const { error } = await supabase.from("app_settings").update({ consent_text: text, consent_policy_version: version }).eq("id", true);
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    return ok("Consent statement saved. New registrations record this version.");
  });
}
