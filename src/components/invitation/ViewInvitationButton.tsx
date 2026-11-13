"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, X, ExternalLink, Gift, FileText } from "lucide-react";
import { Button } from "@/components/buttons/Button";
import { cn } from "@/lib/utils/cn";

export function ViewInvitationButton({
  invitationUrl,
  invitationType,
  label = "View Invitation",
  variant = "ghost",
  size = "md",
  className,
}: {
  invitationUrl?: string | null;
  invitationType?: "pdf" | "image" | null;
  label?: string;
  variant?: "filled" | "primary" | "ghost" | "gold" | "light" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  function handleClick() {
    if (!invitationUrl) {
      setModalOpen(true);
      return;
    }

    const isPdf = invitationType === "pdf" || invitationUrl.toLowerCase().endsWith(".pdf") || invitationUrl.includes(".pdf?");
    if (isPdf) {
      window.open(invitationUrl, "_blank", "noopener,noreferrer");
    } else {
      setImagePreviewOpen(true);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        className={cn("inline-flex items-center justify-center gap-2", className)}
      >
        <Mail className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
        <span>{label}</span>
      </Button>

      {/* Graceful modal when invitation has not yet been uploaded */}
      {modalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invitation-dialog-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-walnut/70 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-7 text-center shadow-[var(--shadow-lift)] sm:p-9">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-secondary-text hover:bg-soft-cream hover:text-dark-walnut"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>

            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-soft-cream border border-champagne-gold/40 text-muted-gold">
              <Mail className="size-6" strokeWidth={1.5} />
            </div>

            <p className="mt-5 text-meta uppercase tracking-[0.15em] text-muted-gold">Wedding Invitation</p>
            <h3 id="invitation-dialog-title" className="mt-2 font-serif text-[28px] leading-tight text-dark-walnut">
              Priya &amp; Arjun
            </h3>

            <p className="mt-4 text-body text-secondary-text text-pretty">
              The official wedding invitation is currently being finalized and will be available to view here shortly.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/register"
                onClick={() => setModalOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-champagne-gold px-4 text-[14px] font-medium text-soft-cream transition hover:bg-muted-gold"
              >
                <Gift className="size-4" />
                Win a Special Gift
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 text-[13px] text-secondary-text hover:text-dark-walnut underline underline-offset-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Image invitation modal viewer */}
      {imagePreviewOpen && invitationUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invitation-image-title"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-walnut/90 p-4 backdrop-blur-md"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-surface)] border border-champagne-gold/30 bg-card-surface shadow-[var(--shadow-lift)]">
            <div className="flex items-center justify-between border-b border-soft-border px-5 py-3.5">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-gold" />
                <h3 id="invitation-image-title" className="font-serif text-[18px] text-dark-walnut">
                  Official Wedding Invitation
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={invitationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-[12px] text-secondary-text hover:bg-soft-cream hover:text-dark-walnut"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Open original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setImagePreviewOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full text-secondary-text hover:bg-soft-cream hover:text-dark-walnut"
                  aria-label="Close invitation"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="relative min-h-[400px] max-h-[75vh] w-full overflow-auto bg-soft-cream p-4 flex items-center justify-center">
              <Image
                src={invitationUrl}
                alt="Priya & Arjun Wedding Invitation"
                width={1200}
                height={1600}
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
