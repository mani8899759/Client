/**
 * Animation Presets and Motion Configurations
 * Designed for the Manikanta & Sravika wedding website and digital invitation.
 */

export type AnimationPreset =
  | "fade-up"
  | "fade-down"
  | "slide-left"
  | "slide-right"
  | "zoom-reveal"
  | "clip-reveal"
  | "scale-rotate"
  | "fade";

export const EDITORIAL_EASE = [0.22, 0.61, 0.36, 1] as const;

export function getPresetVariants(preset: AnimationPreset, distance = 35) {
  switch (preset) {
    case "fade-up":
      return {
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0 },
      };
    case "fade-down":
      return {
        hidden: { opacity: 0, y: -distance },
        visible: { opacity: 1, y: 0 },
      };
    case "slide-left":
      return {
        hidden: { opacity: 0, y: Math.min(distance, 20) },
        visible: { opacity: 1, y: 0 },
      };
    case "slide-right":
      return {
        hidden: { opacity: 0, y: Math.min(distance, 20) },
        visible: { opacity: 1, y: 0 },
      };
    case "zoom-reveal":
      return {
        hidden: { opacity: 0, scale: 0.92 },
        visible: { opacity: 1, scale: 1 },
      };
    case "clip-reveal":
      return {
        hidden: { opacity: 0, clipPath: "inset(12% 0% 0% 0%)" },
        visible: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
      };
    case "scale-rotate":
      return {
        hidden: { opacity: 0, scale: 0.9, rotate: -2 },
        visible: { opacity: 1, scale: 1, rotate: 0 },
      };
    case "fade":
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
  }
}
