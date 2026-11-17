"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Grid3X3,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { WeddingSettings } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { weddingSchedule } from "@/lib/utils/wedding";
import { cn } from "@/lib/utils/cn";

export interface InvitationCardPage {
  pageNumber: number;
  label: string;
  sublabel: string;
  badge: string;
  description: string;
  imageSrc: string;
  fallbackJpg: string;
}

export const INVITATION_CARD_PAGES: InvitationCardPage[] = [
  {
    pageNumber: 1,
    label: "Telugu Patrika",
    sublabel: "వివాహ ఆహ్వాన శుభపత్రిక",
    badge: "Telugu Muhurtham",
    description: "Vedic ceremony invitation with slokas, muhurtham, and families' blessings in traditional Telugu.",
    imageSrc: "/images/invitation-pages/page-1.webp",
    fallbackJpg: "/images/invitation-pages/page-1.jpg",
  },
  {
    pageNumber: 2,
    label: "English Invitation",
    sublabel: "Formal Wedding Card",
    badge: "Ceremonial Card",
    description: "Formal English ceremonial invitation with muhurtham timings, Eco Villagio Resorts venue, and Reception details.",
    imageSrc: "/images/invitation-pages/page-2.webp",
    fallbackJpg: "/images/invitation-pages/page-2.jpg",
  },
  {
    pageNumber: 3,
    label: "Auspicious Blessings",
    sublabel: "మంగళ వాయిద్యాలు",
    badge: "Traditional Art",
    description: "Sacred decorative card artwork embodying joyous celebration, eternal prosperity, and union.",
    imageSrc: "/images/invitation-pages/page-3.webp",
    fallbackJpg: "/images/invitation-pages/page-3.jpg",
  },
  {
    pageNumber: 4,
    label: "Card Cover",
    sublabel: "Wedding Card Cover",
    badge: "Royal Monogram",
    description: "Ceremonial invitation card cover and couple identity presentation.",
    imageSrc: "/images/invitation-pages/page-4.webp",
    fallbackJpg: "/images/invitation-pages/page-4.jpg",
  },
];

type ViewMode = "single" | "grid" | "pdf";

export function InvitationDocumentViewer({ wedding }: { wedding: WeddingSettings }) {
  const schedule = weddingSchedule(wedding);
  const dateLabel = schedule?.dateOnlyLabel ?? "December 13, 2026";
  const rawPdfUrl = wedding.invitation_pdf_path
    ? mediaUrl(wedding.invitation_pdf_path)
    : "/documents/gudlas-wedding-invitation.pdf";
  const pdfUrl = rawPdfUrl ?? "/documents/gudlas-wedding-invitation.pdf";
  const imgUrl = wedding.invitation_image_path ? mediaUrl(wedding.invitation_image_path) : null;

  const [activePage, setActivePage] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  // Keyboard navigation for fullscreen modal
  useEffect(() => {
    if (!isFullscreenModalOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsFullscreenModalOpen(false);
      } else if (e.key === "ArrowLeft") {
        setActivePage((prev) => (prev > 0 ? prev - 1 : INVITATION_CARD_PAGES.length - 1));
      } else if (e.key === "ArrowRight") {
        setActivePage((prev) => (prev < INVITATION_CARD_PAGES.length - 1 ? prev + 1 : 0));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenModalOpen]);

  const currentPage = INVITATION_CARD_PAGES[activePage] ?? INVITATION_CARD_PAGES[0]!;

  return (
    <section
      id="invitation-card"
      aria-labelledby="invitation-doc-heading"
      className="scroll-mt-16 py-14 sm:py-20 bg-[#fdf5e6]"
    >
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        {/* Section Masthead */}
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a]">
            Royal Wedding Card
          </p>
          <h2
            id="invitation-doc-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]"
          >
            Official Wedding Invitation
          </h2>
          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d4a843]" />
            <Sparkles className="size-4 text-[#d4a843]" />
            <span className="h-px w-12 bg-[#d4a843]" />
          </div>
          <p className="mx-auto max-w-[62ch] font-[family-name:var(--font-serif)] text-[17px] text-[#5c4033] sm:text-[19px]">
            Experience our ceremonial 4-page wedding invitation card. Read the Telugu Patrika,
            formal English invitation, sacred muhurtham details, or view and download the official PDF.
          </p>
        </div>

        {/* Outer Invitation Container */}
        <div className="mt-10 overflow-hidden rounded-[18px] border-2 border-[#d4a843]/60 bg-[#fffcf7] shadow-[0_12px_40px_rgba(139,26,26,0.09)]">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5d5bd] bg-[#f5ebd5]/60 px-4 py-3 sm:px-6">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-[#d4a843]/40 bg-[#fffcf7] p-1 text-[12px] font-medium text-[#3d1c00]">
              <button
                type="button"
                onClick={() => setViewMode("single")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
                  viewMode === "single"
                    ? "bg-[#8b1a1a] text-[#fdf5e6] shadow-xs"
                    : "text-[#5c4033] hover:text-[#8b1a1a]"
                )}
                aria-pressed={viewMode === "single"}
              >
                <BookOpen className="size-3.5" />
                <span>Card Reader</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-[#8b1a1a] text-[#fdf5e6] shadow-xs"
                    : "text-[#5c4033] hover:text-[#8b1a1a]"
                )}
                aria-pressed={viewMode === "grid"}
              >
                <Grid3X3 className="size-3.5" />
                <span>All 4 Pages</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("pdf")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
                  viewMode === "pdf"
                    ? "bg-[#8b1a1a] text-[#fdf5e6] shadow-xs"
                    : "text-[#5c4033] hover:text-[#8b1a1a]"
                )}
                aria-pressed={viewMode === "pdf"}
              >
                <FileText className="size-3.5" />
                <span className="hidden xs:inline">Original</span> PDF
              </button>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2">
              {viewMode === "single" ? (
                <>
                  {/* Zoom Controls */}
                  <div className="hidden items-center gap-1 sm:flex">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                      className="rounded p-1.5 text-[#5c4033] hover:bg-[#fffcf7] hover:text-[#8b1a1a]"
                      title="Zoom Out"
                    >
                      <ZoomOut className="size-4" />
                    </button>
                    <span className="w-12 text-center text-[12px] font-mono text-[#5c4033]">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                      className="rounded p-1.5 text-[#5c4033] hover:bg-[#fffcf7] hover:text-[#8b1a1a]"
                      title="Zoom In"
                    >
                      <ZoomIn className="size-4" />
                    </button>
                    {zoomLevel !== 1 ? (
                      <button
                        type="button"
                        onClick={() => setZoomLevel(1)}
                        className="rounded p-1.5 text-[#8b1a1a] hover:bg-[#fffcf7]"
                        title="Reset Zoom"
                      >
                        <RotateCcw className="size-3.5" />
                      </button>
                    ) : null}
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreenModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-[6px] border border-[#d4a843] bg-transparent px-2.5 py-1.5 text-[12px] font-medium text-[#3d1c00] hover:bg-[#d4a843]/15"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="size-3.5" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </button>
                </>
              ) : null}

              {/* Open in New Tab */}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-[6px] border border-[#d4a843] bg-transparent px-3 py-1.5 text-[12px] font-medium text-[#3d1c00] hover:bg-[#d4a843]/15"
              >
                <span>Open PDF</span>
                <ExternalLink className="size-3" />
              </a>

              {/* Download PDF */}
              <a
                href={pdfUrl}
                download="Gudlas-Wedding-Invitation.pdf"
                className="inline-flex items-center gap-1 rounded-[6px] bg-[#8b1a1a] px-3.5 py-1.5 text-[12px] font-medium text-[#fdf5e6] shadow-xs hover:bg-[#721515]"
              >
                <Download className="size-3" />
                <span className="hidden xs:inline">Download</span>
              </a>
            </div>
          </div>

          {/* Page Tabs (when in single card reader mode) */}
          {viewMode === "single" ? (
            <div className="flex border-b border-[#e5d5bd] bg-[#fbf5ea] overflow-x-auto scrollbar-thin">
              {INVITATION_CARD_PAGES.map((page, index) => (
                <button
                  key={page.pageNumber}
                  type="button"
                  onClick={() => {
                    setActivePage(index);
                    setZoomLevel(1);
                  }}
                  className={cn(
                    "flex flex-1 min-w-[140px] flex-col items-center border-b-2 px-3 py-2.5 text-center transition-colors",
                    activePage === index
                      ? "border-[#8b1a1a] bg-[#fffcf7] text-[#8b1a1a]"
                      : "border-transparent text-[#7b6a58] hover:bg-[#f5ebd5]/50 hover:text-[#3d1c00]"
                  )}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#996515]">
                    Page {page.pageNumber}
                  </span>
                  <span className="font-[family-name:var(--font-playfair)] text-[14px] font-bold text-inherit leading-tight">
                    {page.label}
                  </span>
                  <span className="text-[11px] text-[#8c7462] truncate max-w-full">
                    {page.sublabel}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* Mode 1: Single Card Reader Mode */}
          {viewMode === "single" ? (
            <div className="relative flex flex-col items-center bg-[#faf4eb] p-4 sm:p-8">
              {/* Card Title & Description Banner */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 w-full max-w-[880px] rounded-lg border border-[#e5d5bd] bg-[#fffcf7] px-4 py-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-full bg-[#8b1a1a]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#8b1a1a]">
                      {currentPage.badge}
                    </span>
                    <h3 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#3d1c00]">
                      {currentPage.label} · {currentPage.sublabel}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#6d5b4a]">
                    {currentPage.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#8b1a1a]">
                  <span>Page {activePage + 1} of 4</span>
                </div>
              </div>

              {/* Main Card Viewport */}
              <div className="relative w-full max-w-[940px] overflow-auto rounded-xl border border-[#d4a843]/50 bg-[#fffcf7] p-2 sm:p-4 shadow-inner">
                <div
                  className="flex items-center justify-center transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "top center",
                  }}
                >
                  <div
                    className="relative cursor-zoom-in"
                    onClick={() => setIsFullscreenModalOpen(true)}
                    title="Click to view fullscreen in high resolution"
                  >
                    <Image
                      src={currentPage.imageSrc}
                      alt={currentPage.label}
                      width={1650}
                      height={1275}
                      className="mx-auto h-auto w-full max-w-[900px] rounded-lg border border-[#e5d5bd] object-contain shadow-md"
                      priority={activePage === 0}
                    />
                  </div>
                </div>

                {/* Left/Right Floating Navigation Arrows */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePage((prev) => (prev > 0 ? prev - 1 : INVITATION_CARD_PAGES.length - 1));
                    setZoomLevel(1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border border-[#d4a843]/60 bg-[#fffcf7]/95 text-[#8b1a1a] shadow-lg backdrop-blur-xs transition hover:bg-[#8b1a1a] hover:text-[#fdf5e6]"
                  aria-label="Previous invitation page"
                >
                  <ChevronLeft className="size-6" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePage((prev) => (prev < INVITATION_CARD_PAGES.length - 1 ? prev + 1 : 0));
                    setZoomLevel(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border border-[#d4a843]/60 bg-[#fffcf7]/95 text-[#8b1a1a] shadow-lg backdrop-blur-xs transition hover:bg-[#8b1a1a] hover:text-[#fdf5e6]"
                  aria-label="Next invitation page"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>

              {/* Bottom Thumbnail Strip */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {INVITATION_CARD_PAGES.map((page, index) => (
                  <button
                    key={page.pageNumber}
                    type="button"
                    onClick={() => {
                      setActivePage(index);
                      setZoomLevel(1);
                    }}
                    className={cn(
                      "group relative h-16 w-24 overflow-hidden rounded-md border-2 transition-all sm:h-20 sm:w-28",
                      activePage === index
                        ? "border-[#8b1a1a] ring-2 ring-[#8b1a1a]/30 shadow-md scale-105"
                        : "border-[#d4a843]/40 opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={page.imageSrc}
                      alt={page.label}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[#3d1c00]/80 py-0.5 text-center text-[10px] font-semibold text-[#fdf5e6]">
                      P. {page.pageNumber}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Mode 2: Grid Gallery View (All 4 Pages) */}
          {viewMode === "grid" ? (
            <div className="bg-[#faf4eb] p-4 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {INVITATION_CARD_PAGES.map((page, index) => (
                  <div
                    key={page.pageNumber}
                    className="overflow-hidden rounded-xl border border-[#d4a843]/60 bg-[#fffcf7] p-3 shadow-md transition hover:shadow-lg"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-[#8b1a1a]/10 px-2 py-0.5 text-[11px] font-semibold text-[#8b1a1a]">
                        Page {page.pageNumber}: {page.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePage(index);
                          setViewMode("single");
                        }}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[#8b1a1a] hover:underline"
                      >
                        <Eye className="size-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>

                    <div
                      className="relative aspect-[1650/1275] w-full overflow-hidden rounded-lg border border-[#e5d5bd] cursor-pointer"
                      onClick={() => {
                        setActivePage(index);
                        setIsFullscreenModalOpen(true);
                      }}
                    >
                      <Image
                        src={page.imageSrc}
                        alt={page.label}
                        fill
                        className="object-contain"
                        sizes="(min-width: 640px) 45vw, 90vw"
                      />
                    </div>

                    <div className="mt-3">
                      <h4 className="font-[family-name:var(--font-playfair)] text-[16px] font-bold text-[#3d1c00]">
                        {page.label} · <span className="font-serif text-[14px] text-[#8b1a1a]">{page.sublabel}</span>
                      </h4>
                      <p className="mt-1 text-[12px] text-[#6d5b4a]">
                        {page.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Mode 3: Native PDF Document Mode (iframe) */}
          {viewMode === "pdf" ? (
            <div className="bg-[#faf4eb] p-4 sm:p-6">
              <div className="h-[650px] sm:h-[800px] w-full overflow-hidden rounded-xl border border-[#e5d5bd] bg-white shadow-inner">
                <iframe
                  src={`${pdfUrl}#toolbar=1&view=FitH`}
                  className="h-full w-full border-0"
                  title="Official Wedding Invitation PDF"
                />
              </div>
              <p className="mt-3 text-center text-[12px] text-[#7b6a58]">
                If your browser does not render embedded PDFs, use the &quot;Open PDF&quot; or &quot;Download&quot; button above, or switch to the Card Reader tab.
              </p>
            </div>
          ) : null}

          {/* Bottom Card Footer Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5d5bd] bg-[#f5ebd5]/40 px-4 py-3 sm:px-6 text-[13px] text-[#6d5b4a]">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#8b1a1a]" />
              <span>
                <strong>Auspicious Muhurtham:</strong> Sunday, Dec 13, 2026 at 08:08 AM · Eco Villagio Resorts, Hyderabad
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#d4a843]" />
              <span>
                <strong>Reception:</strong> Tuesday, Dec 15, 2026 at 12:00 PM · &apos;P&apos; Conventions, Visakhapatnam
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreenModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Invitation card fullscreen viewer"
          className="fixed inset-0 z-50 flex flex-col bg-[#1f1610]/95 backdrop-blur-md"
          onClick={() => setIsFullscreenModalOpen(false)}
        >
          {/* Modal Header */}
          <div
            className="flex items-center justify-between border-b border-[#d4a843]/30 bg-[#2d1e15]/80 px-4 py-3 text-white sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#d4a843]">
                Page {currentPage.pageNumber} of {INVITATION_CARD_PAGES.length}: {currentPage.badge}
              </p>
              <h3 className="font-[family-name:var(--font-playfair)] text-[18px] font-bold text-[#fdf5e6]">
                {currentPage.label} · {currentPage.sublabel}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                download="Gudlas-Wedding-Invitation.pdf"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#8b1a1a] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#721515]"
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
              </a>

              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(false)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Close fullscreen modal"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Modal Image Viewport */}
          <div
            className="relative flex flex-1 items-center justify-center p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-full max-w-full">
              <Image
                src={currentPage.imageSrc}
                alt={currentPage.label}
                width={1650}
                height={1275}
                className="max-h-[82vh] w-auto max-w-[94vw] rounded-lg border border-[#d4a843]/40 object-contain shadow-2xl"
                priority
              />
            </div>

            {/* Left/Right Floating Navigation */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePage((prev) => (prev > 0 ? prev - 1 : INVITATION_CARD_PAGES.length - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-black/60 text-white shadow-xl hover:bg-black/90"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-7" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePage((prev) => (prev < INVITATION_CARD_PAGES.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-black/60 text-white shadow-xl hover:bg-black/90"
              aria-label="Next page"
            >
              <ChevronRight className="size-7" />
            </button>
          </div>

          {/* Modal Bottom Thumbnail Bar */}
          <div
            className="flex items-center justify-center gap-3 border-t border-[#d4a843]/30 bg-[#2d1e15]/80 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            {INVITATION_CARD_PAGES.map((page, index) => (
              <button
                key={page.pageNumber}
                type="button"
                onClick={() => setActivePage(index)}
                className={cn(
                  "relative h-12 w-16 overflow-hidden rounded border transition-all sm:h-14 sm:w-20",
                  activePage === index
                    ? "border-[#d4a843] ring-2 ring-[#d4a843] scale-105"
                    : "border-white/20 opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={page.imageSrc}
                  alt={page.label}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
