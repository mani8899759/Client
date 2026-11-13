"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/States";
import { Button } from "@/components/buttons/Button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorState
      title="This screen could not load"
      description="Check the database connection and try again. No changes were made."
      action={
        <Button variant="filled" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
