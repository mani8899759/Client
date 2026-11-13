import Link from "next/link";
import { getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";

/** Shared layout for the admin sign-in, forgot-password and reset-password screens. */
export async function AuthShell({ title, intro, children }: { title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  const wedding = await getWeddingSettings();
  const brand = wedding.website_title ?? coupleNames(wedding).joined;
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-warm-ivory px-4 py-12">
      <Link href="/" className="text-center">
        <span className="block font-serif text-[40px] leading-none text-dark-walnut sm:text-[48px]">{brand}</span>
        <span className="mt-3 block text-meta text-muted-gold">Wedding Administration</span>
      </Link>
      <div className="mt-10 w-full max-w-[420px] rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-6 shadow-[var(--shadow-lift)] sm:p-9">
        <h1 className="text-h1 text-dark-walnut">{title}</h1>
        {intro ? <div className="mt-2 text-support text-secondary-text">{intro}</div> : null}
        <div className="mt-7">{children}</div>
      </div>
      <p className="mt-8 text-[12px] text-secondary-text">Authorised administrators only.</p>
    </main>
  );
}
