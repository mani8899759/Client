# Design System

Defined once in `src/styles/globals.css` (Tailwind v4 `@theme`). The official tokens are emitted as `:root` custom properties with their original names and as utilities (`bg-warm-ivory`, `text-dark-walnut`, `border-soft-border`, …).

## Colour
| Token | Hex | Role |
|---|---|---|
| warm-ivory | #F7F0E4 | Main canvas |
| soft-cream | #FFF9F0 | Alternate section band, inputs' hover surfaces |
| card-surface | #FFFCF7 | Cards, forms, panels |
| champagne-gold | #C5A36B | Hairlines, numerals, decorative rules |
| muted-gold | #A28A62 | Eyebrows / metadata accents |
| muted-sage | #899078 | Success states |
| dark-walnut | #493628 | Primary text, filled buttons, footer surface |
| secondary-text | #7B6A58 | Supporting text |
| soft-border | #E5D5BD | Borders |
| primary | #B8860B | Primary accent: CTA outline, active nav, focus ring |
| secondary | #A34836 | Errors, destructive actions, “Live Now” |

Gold is used for borders and accents, never as a background behind small text — gold-on-white fails WCAG AA. Filled buttons use dark walnut with cream text.

## Typography
Cormorant Garamond (headings, numerals) and Inter (everything operational), self-hosted via `next/font`. All weights 400.

| Utility | Spec |
|---|---|
| `text-display` | Serif 48px (40px below 640px), reserved for hero / page mastheads |
| `text-h1` | Serif 30px |
| `text-h2` | Serif 24px |
| `text-h3` | Inter 16px |
| `text-body` | Inter 16px / 1.7 |
| `text-support` | Inter 14px |
| `text-meta` | Inter 11px uppercase, 0.16em tracking |
| `text-numeral` | Serif tabular lining numerals |

## Spacing, radius, shadow
16px base; sections 64 → 80 → 112px; container gutters 16/24/40px; content widths 720 / 1200 / 1440. Radius `--radius-control` 6px (buttons, cards, inputs) and `--radius-surface` 12px (large interactive surfaces). Shadows `--shadow-soft`, `--shadow-lift` (warm-tinted, restrained).

## Components
`Container`, `Section`, `PageHeader`, `SectionHeading`, `DisplayHeading`, `Eyebrow`, `Button` (`primary` gold outline, `filled` walnut, `gold` champagne fill with walnut text — 4.7:1, used for admin auth CTAs, `ghost` underline, `danger`, `light`) + `PrimaryButton`/`FilledButton`/`GhostButton`/`ButtonLink`, `TextInput`, `SelectInput`, `TextArea`, `Checkbox`, `FormMessage`, `Card`, `ImageFrame` (with labelled placeholder), `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmationDialog` (native `<dialog>`), `ToastProvider/useToast`, `SiteHeader` + `ResponsiveNavigation`, `SiteFooter`, `Countdown`, `Reveal`/`ImageReveal`. Admin: `AdminShell`, `Panel`, `StatCard`, `Badge`, `TableWrap`, `Pagination`, `ActionForm`, `ConfirmActionButton`, `MediaField`, `ToggleSetting`.

## Motion
Framer Motion only: hero entrance, scroll reveals, image unmasking, countdown digit roll, menu and lightbox fades. `MotionConfig reducedMotion="user"` plus a CSS `prefers-reduced-motion` override remove movement for those who ask.

## Placeholders
No invented names, dates, venues, photographs or links. Missing content renders labelled placeholders (“Hero photograph — Upload in Admin › Content”) or neutral copy (“Date to be announced”).
