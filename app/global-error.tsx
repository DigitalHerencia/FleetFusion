"use client";
import { GenericErrorPage } from "@/components/blocks/error-pages";

// Fatal route errors require a client boundary; recovery presentation remains a block.
export default function GlobalError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <html lang="en">
      <body>
        <GenericErrorPage
          actions={[{ label: "Try again", onClick: reset }]}
          title="Something went wrong"
        />
      </body>
    </html>
  );
}
