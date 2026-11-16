"use client";

import type { WeddingSettings } from "@/types/database";
import { InvitationHeroAnimation } from "./animations/InvitationHeroAnimation";

export function InvitationHero({
  wedding,
  isOpened = true,
}: {
  wedding: WeddingSettings;
  isOpened?: boolean;
}) {
  return <InvitationHeroAnimation wedding={wedding} isOpened={isOpened} />;
}
