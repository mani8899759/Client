"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, ExternalLink, FileText, Maximize2, Minimize2, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import type { WeddingSettings } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";

export function InvitationDocumentViewer({ wedding }: { wedding: WeddingSettings }) {
  const pdfUrl = wedding.invitation_pdf_path ? mediaUrl(wedding.invitation_pdf_path) : null;
  const imgUrl = wedding.invitation_image_path ? mediaUrl(wedding.invitation_image_path) : null;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const hasDocument = Boolean(pdfUrl || imgUrl);

  return (
    <section aria-labelledby="invitation-doc-heading" className="py-14 sm:py-20 bg-[#fdf5e6]">
      <div className="mx-auto max-w-[920px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a]">
            Royal Wedding Card
          </p>
          <h2 id="invitation-doc-heading" className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]">
            Official Wedding Invitation
          </h2>
          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d4a843]" />
            <Sparkles className="size-4 text-[#d4a843]" />
            <span className="h-px w-12 bg-[#d4a843]" />
          </div>
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033]">
            {hasDocument
              ? "View our ceremonial wedding invitation card. You can zoom, view fullscreen or download a copy."
              : "Our printed wedding invitation card details will be published here shortly."}
          </p>
        </div>

        {/* Viewer Card */}
        <div className="mt-10 overflow-hidden rounded-[16px] border-2 border-[#d4a843]/60 bg-[#fffcf7] shadow-[0_10px_35px_rgba(139,26,26,0.08)]">
          {/* Top Bar with Controls */}
          {hasDocument ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5d5bd] bg-[#f5ebd5]/50 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[#8b1a1a]" />
                <span className="text-[13px] font-medium text-[#3d1c00]">
                  {pdfUrl ? "Official Invitation PDF" : "Digital Invitation Card"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom buttons (for image) */}
                {imgUrl && !pdfUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                      className="rounded p-1.5 text-[#5c4033] hover:bg-[#fffcf7] hover:text-[#8b1a1a]"
                      title="Zoom Out"
                    >
                      <ZoomOut className="size-4" />
                    </button>
                    <span className="text-[12px] text-[#5c4033]">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                      className="rounded p-1.5 text-[#5c4033] hover:bg-[#fffcf7] hover:text-[#8b1a1a]"
                      title="Zoom In"
                    >
                      <ZoomIn className="size-4" />
                    </button>
                  </>
                ) : null}

                {/* Open in new tab */}
                <a
                  href={pdfUrl ?? imgUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-[6px] border border-[#d4a843] bg-transparent px-3 py-1.5 text-[12px] font-medium text-[#3d1c00] hover:bg-[#d4a843]/15"
                >
                  <span>Open</span>
                  <ExternalLink className="size-3" />
                </a>

                {/* Download */}
                <a
                  href={pdfUrl ?? imgUrl ?? "#"}
                  download={pdfUrl ? "Priya-Arjun-Wedding-Invitation.pdf" : "Priya-Arjun-Wedding-Invitation.jpg"}
                  className="inline-flex items-center gap-1 rounded-[6px] bg-[#8b1a1a] px-3.5 py-1.5 text-[12px] font-medium text-[#fdf5e6] shadow-xs hover:bg-[#721515]"
                >
                  <Download className="size-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ) : null}

          {/* Document Content View */}
          <div className="relative min-h-[460px] w-full p-4 sm:p-8 flex items-center justify-center bg-[#faf4eb]">
            {pdfUrl ? (
              <div className="w-full h-[600px] sm:h-[720px] rounded-[8px] overflow-hidden border border-[#e5d5bd] shadow-inner bg-white">
                <iframe
                  src={`${pdfUrl}#toolbar=1&view=FitH`}
                  className="w-full h-full border-0"
                  title="Official Wedding Invitation PDF"
                />
              </div>
            ) : imgUrl ? (
              <div className="relative max-h-[700px] overflow-auto rounded-[8px] border border-[#d4a843]/40 bg-white p-2 shadow-sm">
                <div
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
                  className="transition-transform duration-200"
                >
                  <Image
                    src={imgUrl}
                    alt="Official Wedding Invitation"
                    width={800}
                    height={1100}
                    className="max-h-[680px] w-auto object-contain mx-auto"
                  />
                </div>
              </div>
            ) : (
              /* Graceful state when invitation is not yet uploaded */
              <div className="max-w-[460px] text-center p-8 rounded-[12px] border border-dashed border-[#d4a843] bg-[#fffcf7]">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#f5ebd5] text-[#8b1a1a]">
                  <FileText className="size-7" strokeWidth={1.5} />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-[22px] font-bold text-[#3d1c00]">
                  Official Card Being Prepared
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#7b6a58]">
                  The formal ceremonial wedding invitation card will be published here. You can still explore the schedule, venues, and wedding story above.
                </p>
                <div className="mt-5 text-[12px] font-medium text-[#8b1a1a]">
                  December 1, 2026 · Jaipur, Rajasthan
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
