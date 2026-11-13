/**
 * In-process PostgreSQL (PGlite) harness that emulates the parts of Supabase
 * the migrations depend on — auth.uid(), the anon/authenticated/service_role
 * roles, default API grants and the storage schema — then applies every
 * migration in order. Used only for automated tests; never production data.
 */
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SUPABASE_STUB = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (id uuid primary key, email text unique);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

create schema storage;
create table storage.buckets (
  id text primary key, name text not null, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id),
  name text, owner uuid
);
alter table storage.objects enable row level security;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`;

export type Db = PGlite;

export async function createTestDatabase(): Promise<Db> {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_STUB);

  const dir = path.resolve(__dirname, "../../supabase/migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    try {
      await db.exec(readFileSync(path.join(dir, file), "utf8"));
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
    }
  }
  await db.exec(readFileSync(path.resolve(__dirname, "../../supabase/seed.sql"), "utf8"));
  return db;
}

type Role = "anon" | "authenticated" | "service_role";

/** Run statements as an API role (optionally as a specific auth user) inside a transaction. */
export async function asRole<T>(
  db: Db,
  role: Role,
  userId: string | null,
  fn: (tx: Pick<Db, "query" | "exec">) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId ?? ""]);
    return fn(tx);
  });
}

export async function createAdmin(db: Db, role: "owner" | "admin"): Promise<string> {
  const id = crypto.randomUUID();
  await db.query(`insert into auth.users (id, email) values ($1, $2)`, [id, `${id}@example.test`]);
  await db.query(`insert into public.admin_profiles (user_id, full_name, role) values ($1, $2, $3)`, [
    id,
    `Test ${role}`,
    role,
  ]);
  return id;
}

let counter = 0;
export function participantArgs(overrides: Partial<Record<string, unknown>> = {}) {
  counter += 1;
  const n = String(9000000000 + counter * 7919).slice(0, 10);
  const base = {
    full_name: `Guest Number ${counter}`,
    mobile: n,
    normalized_mobile: `+91${n}`,
    email: `guest${counter}@example.test`,
    normalized_email: `guest${counter}@example.test`,
    gender: "female",
    address: "12 Test Street, Test City",
    side: counter % 2 === 0 ? "bride" : "groom",
    consent: true,
    policy: "test-v1",
    request_id: crypto.randomUUID() as string | null,
  };
  return { ...base, ...overrides };
}

export async function register(db: Db, args: ReturnType<typeof participantArgs>) {
  return asRole(db, "service_role", null, async (tx) => {
    const res = await tx.query<{ r: { status: string; participant_id?: string } }>(
      `select public.register_participant($1,$2,$3,$4,$5,$6::participant_gender,$7,$8::participant_side,$9,$10,$11) as r`,
      [
        args.full_name,
        args.mobile,
        args.normalized_mobile,
        args.email,
        args.normalized_email,
        args.gender,
        args.address,
        args.side,
        args.consent,
        args.policy,
        args.request_id,
      ],
    );
    return res.rows[0]!.r;
  });
}

export async function verify(db: Db, normalizedMobile: string) {
  return asRole(db, "service_role", null, async (tx) => {
    const res = await tx.query<{ r: { status: string; display_name?: string; side?: string } }>(
      `select public.verify_participant($1) as r`,
      [normalizedMobile],
    );
    return res.rows[0]!.r;
  });
}

export async function setAppSettings(db: Db, values: Record<string, boolean>) {
  const sets = Object.keys(values)
    .map((k, i) => `${k} = $${i + 1}`)
    .join(", ");
  await db.query(`update public.app_settings set ${sets} where id`, Object.values(values));
}
