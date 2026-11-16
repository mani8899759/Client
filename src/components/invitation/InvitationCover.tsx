"use client";

import type { WeddingSettings } from "@/types/database";
import { InvitationOpeningAnimation } from "./animations/InvitationOpeningAnimation";

export function InvitationCover({
  wedding,
  onStartOpen,
  onComplete,
  isOpened,
}: {
  wedding: WeddingSettings;
  onStartOpen: () => void;
  onComplete: () => void;
  isOpened: boolean;
}) {
  if (isOpened) return null;
  return (
    <InvitationOpeningAnimation
      wedding={wedding}
      onStartOpen={onStartOpen}
      onComplete={onComplete}
    />
  );
}
