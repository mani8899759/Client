import Link from "next/link";
import Image from "next/image";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Panel, TableWrap, td, th } from "@/components/admin/ui";
import { ConfirmActionButton } from "@/components/admin/forms";
import { MoveButtons, PublishToggle } from "@/components/admin/RowActions";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState } from "@/components/feedback/States";
import { StoryForm } from "./StoryForm";
import { deleteStoryEntry, moveStoryEntry, publishStoryEntry } from "./actions";
import { mediaUrl } from "@/lib/storage/media";
import { formatDateOnly } from "@/lib/utils/datetime";
import type { StoryEntry } from "@/types/database";

export const metadata = { title: "Love Story" };

type Props = { searchParams: Promise<{ edit?: string; new?: string }> };

export default async function StoryAdminPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const { data } = await supabase.from("story_entries").select("*").order("sort_order").order("created_at");
  const entries = (data as StoryEntry[] | null) ?? [];
  const editing = sp.edit ? entries.find((e) => e.id === sp.edit) ?? null : null;
  const showForm = !!editing || sp.new === "1";

  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Love Story"
        description="Timeline chapters shown on the Our Story page, in the order below. The homepage preview uses the first chapters with photographs."
        actions={!showForm ? <ButtonLink href="/admin/story?new=1" variant="filled" size="sm">Add chapter</ButtonLink> : null}
      />

      {showForm ? (
        <div className="mb-8">
          <StoryForm key={editing?.id ?? "new"} entry={editing} />
        </div>
      ) : null}

      <Panel title="Timeline" description={`${entries.length} chapter${entries.length === 1 ? "" : "s"}`}>
        {entries.length ? (
          <TableWrap>
            <thead>
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Chapter</th>
                <th className={th}>Date</th>
                <th className={th}>Visibility</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const thumb = mediaUrl(e.image_path);
                return (
                  <tr key={e.id}>
                    <td className={td}>
                      <MoveButtons action={moveStoryEntry} id={e.id} isFirst={i === 0} isLast={i === entries.length - 1} />
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-[4px] bg-soft-cream">
                          {thumb ? <Image src={thumb} alt="" fill sizes="44px" className="object-cover" /> : null}
                        </span>
                        <span>
                          <span className="block text-[15px]">{e.title}</span>
                          {e.chapter ? <span className="text-[12px] text-secondary-text">{e.chapter}</span> : null}
                        </span>
                      </div>
                    </td>
                    <td className={`${td} text-secondary-text`}>{e.date_label ?? formatDateOnly(e.entry_date, "short") ?? "—"}</td>
                    <td className={td}>
                      <PublishToggle action={publishStoryEntry} id={e.id} published={e.is_published} />
                    </td>
                    <td className={`${td} text-right whitespace-nowrap`}>
                      <Link href={`/admin/story?edit=${e.id}`} className="mr-2 text-[13px] text-dark-walnut underline underline-offset-4">
                        Edit
                      </Link>
                      <ConfirmActionButton
                        action={deleteStoryEntry}
                        fields={{ id: e.id }}
                        label="Delete"
                        title="Delete this chapter?"
                        description={`"${e.title}" and its photographs will be permanently removed.`}
                        tone="danger"
                        variant="ghost"
                        className="text-secondary! decoration-secondary/40!"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        ) : (
          <EmptyState title="No chapters yet" description="Add how you met, milestones, the proposal and engagement." />
        )}
      </Panel>
    </>
  );
}
