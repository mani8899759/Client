import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";
import { listParticipants, parseParticipantFilters } from "@/services/admin/participants";
import { GENDER_LABEL, SIDE_LABEL } from "@/config/site";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { spreadsheetSafe, toCsv } from "@/lib/utils/csv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEADERS = [
  "Full name",
  "Mobile",
  "Email",
  "Gender",
  "Address",
  "Side",
  "Registration status",
  "Verification status",
  "Registered at",
  "Verified at",
  "Consent at",
  "Consent policy",
];

/** Authorised export of participant records (CSV or Excel), honouring current filters. */
export async function GET(request: Request) {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const filters = parseParticipantFilters(Object.fromEntries(url.searchParams));
  const { rows, error } = await listParticipants(ctx.supabase, filters, { all: true });
  if (error) return NextResponse.json({ error: "Export failed" }, { status: 500 });

  const { data: tzRow } = await ctx.supabase.from("wedding_settings").select("timezone").single();
  const tz = (tzRow as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";

  const records = rows.map((p) => [
    p.full_name,
    p.normalized_mobile,
    p.email,
    GENDER_LABEL[p.gender],
    p.address,
    SIDE_LABEL[p.side],
    p.registration_status,
    p.verification_status,
    formatDateTimeInZone(p.registered_at, tz) ?? "",
    p.verified_at ? (formatDateTimeInZone(p.verified_at, tz) ?? "") : "",
    formatDateTimeInZone(p.consent_timestamp, tz) ?? "",
    p.consent_policy_version,
  ]);

  // Record the export (who, format, row count) in the audit trail.
  await ctx.supabase.rpc("admin_log_export", { p_format: format, p_row_count: records.length });
  const stamp = new Date().toISOString().slice(0, 10);
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };

  if (format === "csv") {
    // UTF-8 BOM so Excel opens non-ASCII names correctly.
    const body = "﻿" + toCsv([HEADERS, ...records]);
    return new NextResponse(body, {
      headers: { ...headers, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="participants-${stamp}.csv"` },
    });
  }

  const wb = new ExcelJS.Workbook();
  wb.created = new Date();
  const ws = wb.addWorksheet("Participants", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.addRow(HEADERS);
  ws.getRow(1).font = { bold: true };
  for (const r of records) ws.addRow(r.map(spreadsheetSafe));
  ws.columns.forEach((c, i) => {
    c.width = [24, 16, 30, 10, 40, 14, 16, 16, 22, 22, 22, 14][i] ?? 16;
  });
  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      ...headers,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="participants-${stamp}.xlsx"`,
    },
  });
}
