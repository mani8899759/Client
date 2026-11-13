import Link from "next/link";
import { ButtonLink } from "@/components/buttons/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-warm-ivory px-4 text-center">
      <Link href="/" className="text-meta text-muted-gold">
        Our Wedding
      </Link>
      <p className="mt-10 text-numeral text-[96px] leading-none text-champagne-gold">404</p>
      <h1 className="mt-6 text-h1 text-dark-walnut">This page could not be found</h1>
      <p className="mt-3 max-w-[40ch] text-body text-secondary-text">The link may be outdated, or the page may have moved.</p>
      <div className="mt-8">
        <ButtonLink href="/" variant="filled">
          Return home
        </ButtonLink>
      </div>
    </main>
  );
}
