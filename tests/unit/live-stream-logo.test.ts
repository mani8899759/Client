import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getYouTubeId } from "@/lib/utils/youtube";
import { OFFICIAL_LOGO } from "@/config/logo";

describe("YouTube Live and Official Logo Placeholder", () => {
  it("verifies that the official S&D wedding logo exists in public assets", () => {
    const webpPath = path.join(process.cwd(), "public", OFFICIAL_LOGO.src);
    const pngPath = path.join(process.cwd(), "public", OFFICIAL_LOGO.fallbackSrc);

    expect(fs.existsSync(webpPath), "Official logo webp must exist").toBe(true);
    expect(fs.existsSync(pngPath), "Official logo png fallback must exist").toBe(true);

    const stats = fs.statSync(webpPath);
    expect(stats.size).toBeGreaterThan(1000);
  });

  it("returns null YouTube ID for empty, null, undefined, or invalid URLs", () => {
    expect(getYouTubeId(null)).toBeNull();
    expect(getYouTubeId(undefined)).toBeNull();
    expect(getYouTubeId("")).toBeNull();
    expect(getYouTubeId("   ")).toBeNull();
    expect(getYouTubeId("invalid-url")).toBeNull();
    expect(getYouTubeId("https://vimeo.com/123456789")).toBeNull();
    expect(getYouTubeId("https://random-site.com/video")).toBeNull();
  });

  it("extracts valid YouTube IDs from live, watch, and share URLs", () => {
    expect(getYouTubeId("https://www.youtube.com/live/AbCdEfGhIjK")).toBe("AbCdEfGhIjK");
    expect(getYouTubeId("https://youtube.com/live/AbCdEfGhIjK?si=xyz")).toBe("AbCdEfGhIjK");
    expect(getYouTubeId("https://www.youtube.com/watch?v=AbCdEfGhIjK")).toBe("AbCdEfGhIjK");
    expect(getYouTubeId("https://youtu.be/AbCdEfGhIjK")).toBe("AbCdEfGhIjK");
    expect(getYouTubeId("https://www.youtube-nocookie.com/embed/AbCdEfGhIjK")).toBe("AbCdEfGhIjK");
  });

  it("rejects non-https or spoofed domains", () => {
    expect(getYouTubeId("http://www.youtube.com/watch?v=AbCdEfGhIjK")).toBeNull();
    expect(getYouTubeId("https://evil-youtube.com/watch?v=AbCdEfGhIjK")).toBeNull();
    expect(getYouTubeId("javascript:alert(1)")).toBeNull();
  });
});
