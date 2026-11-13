"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, background: "#F7F0E4", color: "#493628", fontFamily: "Georgia, serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center" }}>
          <h1 style={{ fontWeight: 400, fontSize: 30 }}>Something went wrong</h1>
          <p style={{ color: "#7B6A58", fontFamily: "system-ui, sans-serif" }}>Please try again in a moment.</p>
          <button
            onClick={reset}
            style={{ marginTop: 24, height: 44, padding: "0 24px", border: "1px solid #493628", background: "#493628", color: "#FFF9F0", borderRadius: 6, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
