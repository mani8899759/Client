const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function parseEnv(path) {
  const env = {};
  const lines = fs.readFileSync(path, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const env = parseEnv(".env.local");
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Checking connection to Supabase...");

  // 1. wedding_settings
  const { data: settings, error: sErr } = await supabase.from("wedding_settings").select("*");
  if (sErr) throw sErr;
  console.log("Current wedding_settings count:", settings.length);

  for (const s of settings) {
    let newWelcome = s.welcome_message;
    if (newWelcome) {
      newWelcome = newWelcome
        .replace(/late Bhrahma Chari of Aminpur, Hyderabad/g, "late BrahmaChary")
        .replace(/Bhrahma Chari of Aminpur, Hyderabad/g, "BrahmaChary")
        .replace(/Bhrahma Chari/g, "BrahmaChary")
        .replace(/Brahma Chari/g, "BrahmaChary");
    }

    const updatePayload = {
      invitation_cover_heading: "Our Wedding Invitation",
      invitation_closing_message: null,
      welcome_message: newWelcome,
    };

    const { error: upErr } = await supabase
      .from("wedding_settings")
      .update(updatePayload)
      .eq("id", s.id);
    if (upErr) console.error("Error updating settings:", upErr);
    else console.log("Updated wedding_settings:", s.id);
  }

  // 2. events
  // Unpublish mehndi
  const { error: mErr } = await supabase
    .from("events")
    .update({ is_published: false })
    .ilike("slug", "%mehndi%");
  if (mErr) console.error("Error unpublishing mehndi:", mErr);
  else console.log("Mehndi unpublished successfully.");

  // Haldi: Around 10:00 AM
  const { error: hErr } = await supabase
    .from("events")
    .update({
      time_label: "Around 10:00 AM",
      start_time: "10:00:00",
    })
    .eq("slug", "haldi");
  if (hErr) console.error("Error updating Haldi:", hErr);
  else console.log("Haldi updated with Around 10:00 AM.");

  // Sangeet: Around 6:00 PM, description: "Takes place following the Haldi celebrations."
  const { error: sgErr } = await supabase
    .from("events")
    .update({
      time_label: "Around 6:00 PM",
      start_time: "18:00:00",
      description: "Takes place following the Haldi celebrations.",
    })
    .eq("slug", "sangeet");
  if (sgErr) console.error("Error updating Sangeet:", sgErr);
  else console.log("Sangeet updated with Around 6:00 PM.");

  // Wedding Ceremony: 08:08 AM
  const { error: wErr } = await supabase
    .from("events")
    .update({
      time_label: "08:08 AM",
      start_time: "08:08:00",
    })
    .eq("slug", "wedding-ceremony");
  if (wErr) console.error("Error updating Wedding:", wErr);
  else console.log("Wedding updated with 08:08 AM.");

  // 3. venues
  // Update Eco Villagio Resorts
  const { error: vErr } = await supabase
    .from("venues")
    .update({
      name: "Eco Villagio Resorts, Hyderabad",
      address: "S.No. 132, Eco Villagio, Gummadavelly",
      city: "Kandukur",
      state: "Telangana",
      notes: "Hosting Haldi Ceremony, Sangeeth Ceremony, Wedding Ceremony.",
      google_maps_url:
        "https://maps.google.com?q=S.NO,%20132,%20Eco%20Villagio,%20Gummadavelly,%20Kandukur,%20Telangana,%20India&ftid=0x3bcba99ad6db6b69:0x88e11679354fa45a",
    })
    .eq("id", "e1000000-0000-0000-0000-000000000001");
  if (vErr) console.error("Error updating Eco Villagio:", vErr);
  else console.log("Eco Villagio Resorts venue updated.");

  console.log("ALL DATABASE UPDATES COMPLETED SUCCESSFULLY!");
}

run().catch(console.error);
