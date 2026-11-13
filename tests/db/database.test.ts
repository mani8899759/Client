import { beforeAll, describe, expect, it } from "vitest";
import {
  asRole,
  createAdmin,
  createTestDatabase,
  participantArgs,
  register,
  setAppSettings,
  verify,
  type Db,
} from "./harness";

async function freshDb() {
  const db = await createTestDatabase();
  return db;
}

async function rpcAs<T>(db: Db, userId: string, sql: string, params: unknown[] = []): Promise<T> {
  return asRole(db, "authenticated", userId, async (tx) => {
    const res = await tx.query<{ r: T }>(sql, params);
    return res.rows[0]!.r;
  });
}

async function errorOf(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return "no error";
  } catch (e) {
    return (e as Error).message;
  }
}

describe("migrations", () => {
  it("apply cleanly and create singleton configuration rows", async () => {
    const db = await freshDb();
    const s = await db.query<{ registration_open: boolean; verification_enabled: boolean }>(
      "select registration_open, verification_enabled from app_settings",
    );
    expect(s.rows).toEqual([{ registration_open: true, verification_enabled: true }]);
    const w = await db.query<{ bride_name: string; groom_name: string; wedding_date: Date; timezone: string; wedding_time_confirmed: boolean }>(
      "select bride_name, groom_name, wedding_date, timezone, wedding_time_confirmed from wedding_settings",
    );
    expect(w.rows[0]).toMatchObject({ bride_name: "Priya", groom_name: "Arjun", timezone: "Asia/Kolkata", wedding_time_confirmed: false });
    // Midnight 1 December 2026 in India = 18:30 UTC on 30 November.
    expect(new Date(w.rows[0]!.wedding_date).toISOString()).toBe("2026-11-30T18:30:00.000Z");
    const cfg = await db.query<{ winner_count: number; eligibility_rule: string }>(
      "select winner_count, eligibility_rule from lucky_draw_config",
    );
    expect(cfg.rows).toEqual([{ winner_count: 11, eligibility_rule: "verified_only" }]);
    const p = await db.query<{ n: number }>("select count(*)::int n from participants");
    expect(p.rows[0]!.n).toBe(0);
  });
});

describe("registration", () => {
  let db: Db;
  beforeAll(async () => {
    db = await freshDb();
  });

  it("registers a valid participant", async () => {
    const r = await register(db, participantArgs());
    expect(r.status).toBe("created");
    expect(r.participant_id).toBeTruthy();
  });

  it("rejects duplicate mobile numbers", async () => {
    const a = participantArgs();
    expect((await register(db, a)).status).toBe("created");
    const b = participantArgs({ mobile: a.mobile, normalized_mobile: a.normalized_mobile });
    expect((await register(db, b)).status).toBe("duplicate");
  });

  it("rejects duplicate emails, including registering on the other side", async () => {
    const a = participantArgs({ side: "bride" });
    expect((await register(db, a)).status).toBe("created");
    const b = participantArgs({ email: a.email, normalized_email: a.normalized_email, side: "groom" });
    expect((await register(db, b)).status).toBe("duplicate");
  });

  it("treats a retried request (same request id) as the same registration", async () => {
    const a = participantArgs();
    const first = await register(db, a);
    const retry = await register(db, a);
    expect(first.status).toBe("created");
    expect(retry.status).toBe("created");
    expect(retry.participant_id).toBe(first.participant_id);
  });

  it("handles concurrent duplicate submissions safely", async () => {
    const a = participantArgs();
    const results = await Promise.all([
      register(db, { ...a, request_id: crypto.randomUUID() }),
      register(db, { ...a, request_id: crypto.randomUUID() }),
      register(db, { ...a, request_id: crypto.randomUUID() }),
    ]);
    expect(results.filter((r) => r.status === "created")).toHaveLength(1);
    const n = await db.query<{ n: number }>("select count(*)::int n from participants where normalized_mobile = $1", [
      a.normalized_mobile,
    ]);
    expect(n.rows[0]!.n).toBe(1);
  });

  it("rejects invalid data at the database level", async () => {
    expect((await register(db, participantArgs({ normalized_mobile: "+915123456789" }))).status).toBe("invalid");
    expect((await register(db, participantArgs({ consent: false }))).status).toBe("invalid");
    expect((await register(db, participantArgs({ address: "x" }))).status).toBe("invalid");
  });

  it("returns closed when registration is closed", async () => {
    await setAppSettings(db, { registration_open: false });
    expect((await register(db, participantArgs())).status).toBe("closed");
    await setAppSettings(db, { registration_open: true });
  });

  it("does not let the public read or write participants", async () => {
    const read = await errorOf(asRole(db, "anon", null, (tx) => tx.query("select * from participants")));
    expect(read).toMatch(/permission denied/);
    const rpc = await errorOf(
      asRole(db, "anon", null, (tx) => tx.query("select verify_participant('+919876543210')")),
    );
    expect(rpc).toMatch(/permission denied/);
    const reg = await errorOf(
      asRole(db, "authenticated", null, (tx) =>
        tx.query(
          "select register_participant('A B','9876543210','+919876543210','a@b.co','a@b.co','male','Some address','bride',true,'v',null)",
        ),
      ),
    );
    expect(reg).toMatch(/permission denied/);
  });

  it("does not let a signed-in non-admin read participants", async () => {
    const rows = await asRole(db, "authenticated", crypto.randomUUID(), (tx) => tx.query("select * from participants"));
    expect(rows.rows).toHaveLength(0);
  });
});

describe("common QR verification", () => {
  let db: Db;
  beforeAll(async () => {
    db = await freshDb();
  });

  it("is unavailable while verification is disabled", async () => {
    await setAppSettings(db, { verification_enabled: false });
    const a = participantArgs();
    await register(db, a);
    expect((await verify(db, a.normalized_mobile)).status).toBe("disabled");
  });

  it("verifies a pending participant exactly once and records a check-in", async () => {
    await setAppSettings(db, { verification_enabled: true });
    const a = participantArgs({ full_name: "Meera Iyer" });
    await register(db, a);
    const first = await verify(db, a.normalized_mobile);
    expect(first).toMatchObject({ status: "verified", display_name: "Meera" });
    const again = await verify(db, a.normalized_mobile);
    expect(again.status).toBe("already_verified");

    const row = await db.query<{ verification_status: string; verified_at: string | null; n: number }>(
      `select p.verification_status, p.verified_at, (select count(*)::int from checkins c where c.participant_id = p.id) n
         from participants p where normalized_mobile = $1`,
      [a.normalized_mobile],
    );
    expect(row.rows[0]!.verification_status).toBe("verified");
    expect(row.rows[0]!.verified_at).not.toBeNull();
    expect(row.rows[0]!.n).toBe(1);
  });

  it("produces one success under concurrent requests", async () => {
    const a = participantArgs();
    await register(db, a);
    const results = await Promise.all([1, 2, 3, 4].map(() => verify(db, a.normalized_mobile)));
    expect(results.filter((r) => r.status === "verified")).toHaveLength(1);
  });

  it("reports unknown numbers as not found", async () => {
    expect((await verify(db, "+919999999990")).status).toBe("not_found");
  });

  it("rejects cancelled registrations", async () => {
    const a = participantArgs();
    const r = await register(db, a);
    await db.query("update participants set registration_status = 'cancelled' where id = $1", [r.participant_id]);
    expect((await verify(db, a.normalized_mobile)).status).toBe("inactive");
  });

  it("supports audited manual verification by an admin", async () => {
    const admin = await createAdmin(db, "admin");
    const a = participantArgs();
    const r = await register(db, a);
    await rpcAs(db, admin, "select admin_manual_verify($1, $2) as r", [r.participant_id, "Guest phone battery died"]);
    const c = await db.query<{ verification_method: string; verified_by: string }>(
      "select verification_method, verified_by from checkins where participant_id = $1",
      [r.participant_id],
    );
    expect(c.rows[0]).toEqual({ verification_method: "admin_manual", verified_by: admin });
    const log = await db.query<{ admin_id: string; reason: string }>(
      "select admin_id, reason from audit_logs where action = 'participant.manual_verify' and entity_id = $1",
      [r.participant_id],
    );
    expect(log.rows[0]).toEqual({ admin_id: admin, reason: "Guest phone battery died" });
    expect(
      await errorOf(rpcAs(db, admin, "select admin_manual_verify($1, $2) as r", [r.participant_id, "again please"])),
    ).toMatch(/already_verified/);
  });

  it("does not let non-admins manually verify", async () => {
    const a = participantArgs();
    const r = await register(db, a);
    const err = await errorOf(
      rpcAs(db, crypto.randomUUID(), "select admin_manual_verify($1, $2) as r", [r.participant_id, "sneaky reason"]),
    );
    expect(err).toMatch(/forbidden/);
  });
});

describe("participant corrections", () => {
  it("allows admin corrections, restricts side changes to owners and audits both", async () => {
    const db = await freshDb();
    const owner = await createAdmin(db, "owner");
    const admin = await createAdmin(db, "admin");
    const a = participantArgs({ side: "bride" });
    const r = await register(db, a);
    const call = (uid: string, side: string, name: string) =>
      rpcAs(
        db,
        uid,
        "select admin_update_participant($1,$2,$3,$4,$5,$6,$7::participant_gender,$8,$9::participant_side,$10) as r",
        [r.participant_id, name, a.mobile, a.normalized_mobile, a.email, a.normalized_email, "female", a.address, side, "Spelling fix requested"],
      );

    await call(admin, "bride", "Corrected Name");
    expect(await errorOf(call(admin, "groom", "Corrected Name"))).toMatch(/owner_required/);
    await call(owner, "groom", "Corrected Name");

    const p = await db.query<{ full_name: string; side: string }>("select full_name, side from participants where id = $1", [
      r.participant_id,
    ]);
    expect(p.rows[0]).toEqual({ full_name: "Corrected Name", side: "groom" });
    const actions = await db.query<{ action: string }>(
      "select action from audit_logs where entity_id = $1 order by created_at",
      [r.participant_id],
    );
    expect(actions.rows.map((x) => x.action).sort()).toEqual(["participant.correction", "participant.side_correction"]);
  });

  it("keeps the audit log append-only", async () => {
    const db = await freshDb();
    await setAppSettings(db, { registration_open: false });
    expect(await errorOf(db.query("delete from audit_logs"))).toMatch(/audit_log_immutable/);
    expect(await errorOf(db.query("update audit_logs set reason = 'x'"))).toMatch(/audit_log_immutable/);
  });
});

describe("lucky draw", () => {
  async function setup(verifiedCount: number, pendingCount = 0) {
    const db = await freshDb();
    const owner = await createAdmin(db, "owner");
    const admin = await createAdmin(db, "admin");
    await setAppSettings(db, { verification_enabled: true });
    for (let i = 0; i < verifiedCount; i += 1) {
      const a = participantArgs();
      await register(db, a);
      await verify(db, a.normalized_mobile);
    }
    for (let i = 0; i < pendingCount; i += 1) {
      await register(db, participantArgs());
    }
    await setAppSettings(db, { registration_open: false });
    return { db, owner, admin };
  }
  const execute = (db: Db, uid: string, count = 11, rule = "verified_only") =>
    rpcAs<string>(db, uid, "select execute_lucky_draw($1, $2::eligibility_rule) as r", [count, rule]);

  it("refuses to run with zero eligible participants", async () => {
    const { db, owner } = await setup(0, 3);
    expect(await errorOf(execute(db, owner))).toMatch(/no_eligible_participants/);
  });

  it("refuses to run with insufficient eligible participants", async () => {
    const { db, owner } = await setup(1);
    expect(await errorOf(execute(db, owner))).toMatch(/insufficient_eligible_participants/);
    const draws = await db.query<{ n: number }>("select count(*)::int n from lucky_draws");
    expect(draws.rows[0]!.n).toBe(0);
  });

  it("selects one winner from one eligible participant when configured for one", async () => {
    const { db, owner } = await setup(1);
    await rpcAs(db, owner, "select admin_update_draw_config(1, 'verified_only', null) as r");
    await execute(db, owner, 1);
    const w = await db.query<{ n: number }>("select count(*)::int n from lucky_draw_winners");
    expect(w.rows[0]!.n).toBe(1);
  });

  it("selects exactly 11 unique verified winners from a larger combined pool", async () => {
    const { db, owner } = await setup(30, 10);
    const drawId = await execute(db, owner);
    const w = await db.query<{ participant_id: string; winner_position: number; verification_status: string; side: string }>(
      `select w.participant_id, w.winner_position, p.verification_status, p.side
         from lucky_draw_winners w join participants p on p.id = w.participant_id
        where w.draw_id = $1 order by w.winner_position`,
      [drawId],
    );
    expect(w.rows).toHaveLength(11);
    expect(new Set(w.rows.map((r) => r.participant_id)).size).toBe(11);
    expect(w.rows.map((r) => r.winner_position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(w.rows.every((r) => r.verification_status === "verified")).toBe(true);

    const d = await db.query<{ eligible_count: number; snapshot_len: number }>(
      "select eligible_count, jsonb_array_length(eligible_participant_snapshot) snapshot_len from lucky_draws where id = $1",
      [drawId],
    );
    expect(d.rows[0]).toEqual({ eligible_count: 30, snapshot_len: 30 });
  });

  it("works with exactly 11 eligible participants", async () => {
    const { db, owner } = await setup(11);
    const drawId = await execute(db, owner);
    const w = await db.query<{ n: number }>("select count(distinct participant_id)::int n from lucky_draw_winners where draw_id = $1", [
      drawId,
    ]);
    expect(w.rows[0]!.n).toBe(11);
  });

  it("prevents reruns, rejects non-owners, open registration and stale confirmation", async () => {
    const { db, owner, admin } = await setup(12);
    expect(await errorOf(execute(db, admin))).toMatch(/owner_required/);
    expect(await errorOf(execute(db, owner, 5))).toMatch(/config_changed/);
    await setAppSettings(db, { registration_open: true });
    expect(await errorOf(execute(db, owner))).toMatch(/registration_open/);
    await setAppSettings(db, { registration_open: false });

    const results = await Promise.allSettled([execute(db, owner), execute(db, owner)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await errorOf(execute(db, owner))).toMatch(/draw_already_completed/);
    const draws = await db.query<{ n: number }>("select count(*)::int n from lucky_draws");
    expect(draws.rows[0]!.n).toBe(1);
  });

  it("keeps results immutable and closes verification after the draw", async () => {
    const { db, owner } = await setup(11);
    const drawId = await execute(db, owner);
    expect(await errorOf(db.query("delete from lucky_draw_winners"))).toMatch(/lucky_draw_immutable/);
    expect(await errorOf(db.query("update lucky_draw_winners set winner_position = winner_position + 100"))).toMatch(
      /lucky_draw_immutable/,
    );
    expect(await errorOf(db.query("update lucky_draws set winner_count = 3 where id = $1", [drawId]))).toMatch(
      /lucky_draw_immutable/,
    );
    const late = participantArgs();
    expect((await verify(db, late.normalized_mobile)).status).toBe("closed");
  });

  it("only widens eligibility to all registered participants when an owner decides so", async () => {
    const { db, owner, admin } = await setup(2, 12);
    expect(
      await errorOf(rpcAs(db, admin, "select admin_update_draw_config(11, 'all_registered', null) as r")),
    ).toMatch(/owner_required/);
    await rpcAs(db, owner, "select admin_update_draw_config(11, 'all_registered', null) as r");
    const drawId = await execute(db, owner, 11, "all_registered");
    const d = await db.query<{ eligible_count: number }>("select eligible_count from lucky_draws where id = $1", [drawId]);
    expect(d.rows[0]!.eligible_count).toBe(14);
  });

  it("publishes only safe fields, only when made public, and supports an audited void + redraw", async () => {
    const { db, owner, admin } = await setup(15);
    const pending = await asRole(db, "anon", null, (tx) => tx.query<{ r: { status: string } }>("select get_public_winners() r"));
    expect(pending.rows[0]!.r.status).toBe("pending");

    const drawId = await execute(db, owner);
    await setAppSettings(db, { winners_public: true });
    const pub = await asRole(db, "anon", null, (tx) =>
      tx.query<{ r: { status: string; winners: Array<Record<string, unknown>> } }>("select get_public_winners() r"),
    );
    expect(pub.rows[0]!.r.status).toBe("announced");
    expect(pub.rows[0]!.r.winners).toHaveLength(11);
    expect(Object.keys(pub.rows[0]!.r.winners[0]!).sort()).toEqual(["display_name", "position", "side"]);

    const winner = await db.query<{ id: string }>("select id from lucky_draw_winners where draw_id = $1 limit 1", [drawId]);
    await rpcAs(db, admin, "select admin_update_winner($1, 'contacted', null, 'Called on Sunday') as r", [winner.rows[0]!.id]);
    const gs = await db.query<{ gift_status: string }>("select gift_status from lucky_draw_winners where id = $1", [
      winner.rows[0]!.id,
    ]);
    expect(gs.rows[0]!.gift_status).toBe("contacted");

    expect(await errorOf(rpcAs(db, admin, "select admin_void_draw($1, 'Mistake in pool') as r", [drawId]))).toMatch(
      /owner_required/,
    );
    await rpcAs(db, owner, "select admin_void_draw($1, 'Mistake in pool') as r", [drawId]);
    const afterVoid = await asRole(db, "anon", null, (tx) => tx.query<{ r: { status: string } }>("select get_public_winners() r"));
    expect(afterVoid.rows[0]!.r.status).toBe("pending");
    await execute(db, owner);
    const audit = await db.query<{ action: string }>(
      "select action from audit_logs where action like 'lucky_draw.%' order by created_at",
    );
    expect(audit.rows.map((r) => r.action)).toEqual(["lucky_draw.execute", "lucky_draw.void", "lucky_draw.execute"]);
  });

  it("distributes winners without obvious bias", async () => {
    const db = await freshDb();
    const res = await db.query<{ v: number }>(
      "select public.secure_random_int(5) v from generate_series(1, 5000)",
    );
    const counts = [0, 0, 0, 0, 0];
    for (const r of res.rows) counts[r.v]! += 1;
    for (const c of counts) {
      expect(c).toBeGreaterThan(850);
      expect(c).toBeLessThan(1150);
    }
  });
});

describe("content RLS", () => {
  it("hides unpublished content from the public and lets admins manage it", async () => {
    const db = await freshDb();
    const admin = await createAdmin(db, "admin");
    await asRole(db, "authenticated", admin, (tx) =>
      tx.query(
        `insert into events (slug, name, event_type, is_published) values ('haldi', 'Haldi', 'haldi', true), ('draft', 'Draft', 'other', false)`,
      ),
    );
    const pub = await asRole(db, "anon", null, (tx) => tx.query<{ slug: string }>("select slug from events"));
    expect(pub.rows.map((r) => r.slug)).toEqual(["haldi"]);

    const denied = await errorOf(
      asRole(db, "anon", null, (tx) => tx.query("insert into events (slug, name) values ('x', 'X')")),
    );
    expect(denied).toMatch(/row-level security/);

    await asRole(db, "authenticated", admin, (tx) => tx.query("delete from events where slug = 'draft'"));
    const log = await db.query<{ admin_id: string }>("select admin_id from audit_logs where action = 'events.delete'");
    expect(log.rows[0]!.admin_id).toBe(admin);
  });

  it("audits admin sign-in events and rejects non-admins", async () => {
    const db = await freshDb();
    const admin = await createAdmin(db, "admin");
    await rpcAs(db, admin, "select admin_log_auth_event('auth.sign_in') as r");
    expect(await errorOf(rpcAs(db, crypto.randomUUID(), "select admin_log_auth_event('auth.sign_in') as r"))).toMatch(/forbidden/);
    expect(await errorOf(rpcAs(db, admin, "select admin_log_auth_event('anything') as r"))).toMatch(/invalid/);
    const log = await db.query<{ action: string; admin_id: string }>("select action, admin_id from audit_logs where action like 'auth.%'");
    expect(log.rows).toEqual([{ action: "auth.sign_in", admin_id: admin }]);
  });

  it("flags AI-generated gallery media", async () => {
    const db = await freshDb();
    await db.query(
      "insert into gallery_media (media_type, storage_path, is_published, is_ai_generated, is_placeholder) values ('photo', 'static/ai/gallery-01.webp', true, true, true)",
    );
    const r = await asRole(db, "anon", null, (tx) => tx.query<{ is_ai_generated: boolean }>("select is_ai_generated from gallery_media"));
    expect(r.rows).toEqual([{ is_ai_generated: true }]);
  });

  it("applies the generated AI gallery seed idempotently, with every row flagged", async () => {
    const { existsSync, readFileSync } = await import("node:fs");
    const path = "supabase/ai_gallery_seed.sql";
    if (!existsSync(path)) return;
    const db = await freshDb();
    const sql = readFileSync(path, "utf8");
    await db.exec(sql);
    await db.exec(sql);
    const rows = await db.query<{ n: number; flagged: number }>(
      "select count(*)::int n, count(*) filter (where is_ai_generated and is_placeholder)::int flagged from gallery_media",
    );
    expect(rows.rows[0]!.n).toBe(rows.rows[0]!.flagged);
    const dupes = await db.query<{ n: number }>("select count(*)::int n from (select storage_path from gallery_media group by 1 having count(*) > 1) d");
    expect(dupes.rows[0]!.n).toBe(0);
  });

  it("audits operational switches", async () => {
    const db = await freshDb();
    const admin = await createAdmin(db, "admin");
    await asRole(db, "authenticated", admin, (tx) =>
      tx.query("update app_settings set verification_enabled = false, registration_open = false where id"),
    );
    const log = await db.query<{ action: string }>("select action from audit_logs where admin_id = $1 order by action", [admin]);
    expect(log.rows.map((r) => r.action)).toEqual(["registration.closed", "verification.deactivated"]);
  });
});
