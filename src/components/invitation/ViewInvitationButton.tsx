"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, X, ExternalLink, FileText } from "lucide-react";
import { Button, buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/buttons/Button";
import { cn } from "@/lib/utils/cn";

export function ViewInvitationButton({
  invitationUrl,
  invitationType,
  label = "View Invitation",
  variant = "ghost",
  size = "md",
  className,
  eventSpecific = false,
}: {
  invitationUrl?: string | null;
  invitationType?: "pdf" | "image" | null;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  eventSpecific?: boolean;
}) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  // If this is an event-specific invitation image/pdf on an individual event card
  const isEvent = Boolean(eventSpecific || (invitationUrl && invitationUrl.includes("/events/")));

  if (isEvent && invitationUrl) {
    const isPdf = invitationType === "pdf" || invitationUrl.toLowerCase().endsWith(".pdf") || invitationUrl.includes(".pdf?");

    return (
      <>
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={() => {
            if (isPdf) {
              window.open(invitationUrl, "_blank", "noopener,noreferrer");
            } else {
              setImagePreviewOpen(true);
            }
          }}
          className={cn("inline-flex items-center justify-center gap-2", className)}
        >
          <Mail className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{label}</span>
        </Button>

        {imagePreviewOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-walnut/80 p-4 backdrop-blur-sm"
            onClick={() => setImagePreviewOpen(false)}
          >
            <div
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-[var(--radius-surface)] bg-card-surface p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setImagePreviewOpen(false)}
                className="absolute top-3 right-3 z-10 rounded-full bg-dark-walnut/70 p-1.5 text-soft-cream hover:bg-dark-walnut"
                aria-label="Close invitation preview"
              >
                <X className="size-4" />
              </button>
              <div className="relative h-[70vh] w-[75vw] max-w-[600px]">
                <Image
                  src={invitationUrl}
                  alt="Wedding Invitation Preview"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  // General "View Invitation" buttons across header, hero, etc. open the digital invitation experience
  return (
    <Link
      href="/invitation"
      className={buttonClasses(variant, size, cn("inline-flex items-center justify-center gap-2", className))}
    >
      <Mail className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
