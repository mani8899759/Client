"use client";

import type { WeddingSettings } from "@/types/database";
import { InvitationOpeningAnimation } from "./animations/InvitationOpeningAnimation";

export function InvitationCover({
  wedding,
  onOpen,
  isOpened,
}: {
  wedding: WeddingSettings;
  onOpen: () => void;
  isOpened: boolean;
}) {
  if (isOpened) return null;
  return <InvitationOpeningAnimation wedding={wedding} onOpen={onOpen} />;
}
