# AI Image Manifest

Illustrative images of a **fictional** couple, used until real photographs are uploaded. They are not photographs of Priya and Arjun.
They are flagged as AI-generated in the admin (Media page and Gallery) and any real upload in the same slot takes precedence.

Generated with `scripts/import-ai-assets.mjs`. Workflow:

1. Generate each image below with your preferred image model, using the shared style plus the slot prompt.
2. Save files named after the slot (e.g. `hero.png`) or the target file in one folder.
3. Run `npm run ai-assets:import -- <folder>` — converts to WebP into `public/images/ai/` and updates the manifest.
4. Run `supabase/ai_gallery_seed.sql` in Supabase to add the flagged gallery items.

**Shared style:** Premium editorial Indian wedding photography, fictional South Asian couple, natural skin texture, realistic soft natural light, warm ivory, champagne gold, muted gold, dark walnut, soft cream and muted sage palette, shallow depth of field, medium-format film look, culturally authentic attire and decor, no text, no lettering, no watermark, no logos, no frames

| Slot | File | Ratio | Used for | Status | Prompt |
|---|---|---|---|---|---|
| `hero` | `priya-arjun-hero.webp` | 16:9 | Homepage hero | ✅ present | Wide landscape: bride in an ivory and gold silk lehenga with fine zari work and groom in a champagne sherwani with a soft turban, standing close beneath a mandap draped in ivory fabric and marigold strands, golden-hour light from the left, the couple placed in the right third, generous calm negative space on the left and upper area for a heading |
| `couple-editorial-portrait` | `couple-editorial-portrait.webp` | 4:5 | Welcome section | ✅ present | Vertical editorial portrait, couple facing each other, foreheads nearly touching, bride's dupatta catching light, haveli courtyard with carved sandstone arches softly out of focus |
| `bride-detail` | `bride-detail.webp` | 4:5 | Couple introduction — bride | ✅ present | Vertical close-up: bride's hands with intricate mehendi, layered gold and ivory bangles, holding the edge of an embroidered ivory dupatta, face not shown |
| `groom-detail` | `groom-detail.webp` | 4:5 | Couple introduction — groom | ✅ present | Vertical close-up: groom adjusting the cuff of a champagne silk sherwani with antique gold buttons, a pearl mala visible, face cropped out |
| `wedding-environment` | `wedding-environment.webp` | 3:2 | Venue preview | ✅ present | Landscape: heritage palace courtyard prepared for a wedding at dusk, ivory drapes, rows of brass diyas, marigold and rose garlands, no people |
| `wedding-details` | `wedding-details.webp` | 4:5 | Story preview secondary image | ✅ present | Vertical still life: brass puja thali with rose petals, a kundan necklace and a folded ivory silk dupatta on a linen table, soft window light |
| `story-first-meeting` | `story-first-meeting.webp` | 4:5 | Story chapter illustration | ✅ present | Vertical: young couple in elegant everyday Indian clothing laughing over chai at a sunlit café table, candid, warm muted tones |
| `couple-prewedding` | `couple-prewedding.webp` | 3:2 | Story preview and story chapter illustration | ✅ present | Landscape pre-wedding scene: couple walking hand in hand through a Mughal garden at golden hour, bride in a pastel sage anarkali, groom in an ivory kurta, seen from a distance |
| `engagement-editorial` | `engagement-editorial.webp` | 4:5 | Engagement chapter / event illustration | ✅ present | Vertical close-up of a ring exchange, hands only, soft champagne silk sleeves, blurred fairy lights and white flowers behind |
| `story-portrait` | `story-portrait.webp` | 3:2 | Story closing illustration | ✅ present | Landscape: couple seated on the steps of a stepwell at dusk, soft backlight, quiet and intimate, faces in gentle shadow |
| `event-engagement` | `engagement-celebration.webp` | 5:4 | Engagement event | ✅ present | Engagement ceremony setting with white florals, low brass lanterns and an ivory sofa, guests softly out of focus |
| `event-haldi` | `haldi-celebration.webp` | 5:4 | Haldi event | ✅ present | Haldi ceremony: brass bowls of turmeric paste, marigold petals mid-air, yellow and ivory drapes, joyful candid hands, natural daylight |
| `event-mehendi` | `mehendi-celebration.webp` | 5:4 | Mehendi event | ✅ present | Mehendi afternoon: henna being applied to a bride's palms, sage and blush floor cushions, jasmine strands, soft shade light |
| `event-wedding` | `wedding-ceremony.webp` | 5:4 | Wedding ceremony | ✅ present | Wedding pheras around a small sacred fire beneath a floral mandap, bride and groom seen from behind, warm firelight, ivory and gold decor |
| `event-reception` | `reception-celebration.webp` | 5:4 | Reception event | ✅ present | Evening reception: long candlelit tables with ivory linen, gold cutlery and low white florals, warm bokeh, no people in focus |
| `gallery-01` | `gallery-01.webp` | 4:5 | Gallery | ✅ present | Vertical detail of a maang tikka and kundan earrings against an ivory dupatta |
| `gallery-02` | `gallery-02.webp` | 3:2 | Gallery | ✅ present | Landscape couple portrait in a sandstone courtyard, couple small in frame, symmetrical arches |
| `gallery-03` | `gallery-03.webp` | 4:5 | Gallery | ✅ present | Vertical close-up of marigold and rose garlands hanging against ivory fabric |
| `gallery-04` | `gallery-04.webp` | 1:1 | Gallery | ✅ present | Square detail of a champagne safa with a pearl sehra, shallow focus |
| `gallery-05` | `gallery-05.webp` | 3:2 | Gallery | ✅ present | Landscape candid celebration, family dancing in motion blur under string lights, faces not distinct |
| `gallery-06` | `gallery-06.webp` | 4:5 | Gallery | ✅ present | Vertical: couple's joined hands, mehendi and bangles, ivory and gold fabrics |
| `gallery-07` | `gallery-07.webp` | 3:2 | Gallery | ✅ present | Landscape: rows of lit brass diyas along stone steps at dusk |
| `gallery-08` | `gallery-08.webp` | 4:5 | Gallery | ✅ present | Vertical: bride seen from behind walking down a corridor, long embroidered dupatta trailing |
| `location-venue` | `venue-courtyard.webp` | 16:9 | Locations page header visual | ✅ present | Wide: heritage haveli courtyard lit with lanterns for an evening celebration, no people, no signage |
