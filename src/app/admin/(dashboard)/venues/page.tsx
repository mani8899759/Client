import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Panel, TableWrap, td, th } from "@/components/admin/ui";
import { ConfirmActionButton } from "@/components/admin/forms";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState } from "@/components/feedback/States";
import { VenueForm } from "../events/EventForms";
import { deleteVenue } from "../events/actions";
import type { Venue, WeddingEvent } from "@/types/database";

export const metadata = { title: "Venues & Locations" };

type Props = { searchParams: Promise<{ venue?: string }> };

export default async function VenuesPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const [venuesRes, eventsRes] = await Promise.all([
    supabase.from("venues").select("*").order("name"),
    supabase.from("events").select("id, name, venue_id, is_published").order("sort_order"),
  ]);
  const venues = (venuesRes.data as Venue[] | null) ?? [];
  const events = (eventsRes.data as Pick<WeddingEvent, "id" | "name" | "venue_id" | "is_published">[] | null) ?? [];
  const editing = sp.venue && sp.venue !== "new" ? (venues.find((v) => v.id === sp.venue) ?? null) : null;
  const showForm = sp.venue === "new" || !!editing;
  const usedBy = (id: string) => events.filter((e) => e.venue_id === id);

  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Venues & Locations"
        description="Events reference venues, so each address is maintained in one place. A venue appears on the public Locations page once a published event uses it."
        actions={!showForm ? <ButtonLink href="/admin/venues?venue=new" variant="filled" size="sm">Add venue</ButtonLink> : null}
      />

      {showForm ? (
        <div className="mb-8">
          <VenueForm key={editing?.id ?? "new"} venue={editing} />
        </div>
      ) : null}

      <Panel title={`${venues.length} venue${venues.length === 1 ? "" : "s"}`}>
        {venues.length ? (
          <TableWrap>
            <thead>
              <tr>
                <th className={th}>Venue</th>
                <th className={th}>City</th>
                <th className={th}>Directions</th>
                <th className={th}>Events</th>
                <th className={th}>Public</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => {
                const evs = usedBy(v.id);
                const isPublic = evs.some((e) => e.is_published);
                return (
                  <tr key={v.id}>
                    <td className={td}>
                      <span className="block">{v.name}</span>
                      <span className="text-[12px] text-secondary-text">{v.address ?? "No address"}</span>
                    </td>
                    <td className={`${td} text-secondary-text`}>{v.city ?? "—"}</td>
                    <td className={`${td} text-secondary-text`}>
                      {[v.google_maps_url ? "Maps link" : null, v.latitude !== null ? "Coordinates" : null].filter(Boolean).join(" + ") || "—"}
                    </td>
                    <td className={`${td} text-secondary-text`}>{evs.length ? evs.map((e) => e.name).join(", ") : "Not used"}</td>
                    <td className={`${td} text-secondary-text`}>{isPublic ? "Yes" : "No"}</td>
                    <td className={`${td} text-right whitespace-nowrap`}>
                      <Link href={`/admin/venues?venue=${v.id}`} className="mr-2 text-[13px] underline underline-offset-4">
                        Edit
                      </Link>
                      <ConfirmActionButton
                        action={deleteVenue}
                        fields={{ id: v.id }}
                        label="Delete"
                        title="Delete this venue?"
                        description={evs.length ? `${evs.length} event(s) use this venue and will be left without one.` : "This venue is not used by any event."}
                        tone="danger"
                        variant="ghost"
                        className="text-secondary!"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        ) : (
          <EmptyState title="No venues yet" description="Add the real venue name and address, then link it to events." />
        )}
      </Panel>
    </>
  );
}
