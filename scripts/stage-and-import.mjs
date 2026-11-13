import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const brainDir = "C:/Users/MANI-33/.gemini/antigravity/brain/da2efacf-2b03-4f34-9e63-26432e27850d";
const stagingDir = path.resolve("scripts/staged_images");

if (!fs.existsSync(stagingDir)) {
  fs.mkdirSync(stagingDir, { recursive: true });
}

// Map each slot to its source image in brainDir and optional crop/transform
const plan = [
  {
    slot: "hero",
    source: "priya_arjun_hero_1794546069167.jpg",
  },
  {
    slot: "couple-editorial-portrait",
    source: "couple_editorial_portrait_1794546529762.jpg",
  },
  {
    slot: "bride-detail",
    source: "bride_detail_1794546544108.jpg",
  },
  {
    slot: "groom-detail",
    source: "groom_detail_1794546558296.jpg",
  },
  {
    slot: "wedding-environment",
    source: "wedding_environment_1794546571559.jpg",
    crop: { left: 112, top: 0, width: 1152, height: 768 }, // 3:2
  },
  {
    slot: "wedding-details",
    source: "gallery_01_1794546537836.jpg",
    crop: { left: 0, top: 80, width: 896, height: 1120 }, // 4:5
  },
  {
    slot: "story-first-meeting",
    source: "story_first_meeting_1794546526910.jpg",
  },
  {
    slot: "couple-prewedding",
    source: "couple_prewedding_1794546551542.jpg",
  },
  {
    slot: "engagement-editorial",
    source: "gallery_06_1794546574170.jpg",
    crop: { left: 0, top: 80, width: 896, height: 1120 }, // 4:5
  },
  {
    slot: "story-portrait",
    source: "gallery_02_1794546558820.jpg",
  },
  {
    slot: "event-engagement",
    source: "wedding_environment_1794546571559.jpg",
    crop: { left: 200, top: 0, width: 960, height: 768 }, // 5:4
  },
  {
    slot: "event-haldi",
    source: "event_haldi_1794546540641.jpg",
  },
  {
    slot: "event-mehendi",
    source: "event_mehendi_1794546563767.jpg",
  },
  {
    slot: "event-wedding",
    source: "priya_arjun_hero_1794546069167.jpg",
    crop: { left: 416, top: 0, width: 960, height: 768 }, // 5:4 mandap & couple focus
  },
  {
    slot: "event-reception",
    source: "wedding_environment_1794546571559.jpg",
    crop: { left: 0, top: 0, width: 960, height: 768 }, // 5:4
  },
  {
    slot: "gallery-01",
    source: "gallery_01_1794546537836.jpg",
  },
  {
    slot: "gallery-02",
    source: "gallery_02_1794546558820.jpg",
  },
  {
    slot: "gallery-03",
    source: "event_haldi_1794546540641.jpg",
    crop: { left: 480, top: 0, width: 716, height: 896 }, // 4:5 marigold and drapes focus
  },
  {
    slot: "gallery-04",
    source: "groom_detail_1794546558296.jpg",
    crop: { left: 0, top: 152, width: 896, height: 896 }, // 1:1 square
  },
  {
    slot: "gallery-05",
    source: "gallery_05_1794546548501.jpg",
  },
  {
    slot: "gallery-06",
    source: "gallery_06_1794546574170.jpg",
  },
  {
    slot: "gallery-07",
    source: "wedding_environment_1794546571559.jpg",
    crop: { left: 0, top: 0, width: 1152, height: 768 }, // 3:2 diyas along steps
  },
  {
    slot: "gallery-08",
    source: "couple_editorial_portrait_1794546529762.jpg",
    crop: { left: 0, top: 0, width: 896, height: 1120 }, // 4:5
  },
  {
    slot: "location-venue",
    source: "wedding_environment_1794546571559.jpg",
  },
];

console.log(`Processing ${plan.length} slots...`);

for (const item of plan) {
  const srcFile = path.join(brainDir, item.source);
  if (!fs.existsSync(srcFile)) {
    console.error(`Source missing: ${srcFile}`);
    continue;
  }
  const destFile = path.join(stagingDir, `${item.slot}.jpg`);
  let pipeline = sharp(srcFile);
  if (item.crop) {
    pipeline = pipeline.extract(item.crop);
  }
  await pipeline.jpeg({ quality: 95 }).toFile(destFile);
  console.log(`Staged: ${item.slot}.jpg from ${item.source}`);
}

console.log("All slots staged successfully.");
