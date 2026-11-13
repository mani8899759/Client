"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/States";
import { Button, ButtonLink } from "@/components/buttons/Button";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="px-4 py-24">
      <ErrorState
        title="This page could not load"
        description="Please check your connection and try again."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="filled" onClick={reset}>
              Try again
            </Button>
            <ButtonLink href="/" variant="primary">
              Return home
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
