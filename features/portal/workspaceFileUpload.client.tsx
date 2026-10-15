"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadWorkspaceAsset } from "@/lib/actions/commonActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function WorkspaceFileUpload({
  domain,
}: {
  domain: "portal" | "social";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <form
      className="space-y-3 surface-inset p-4"
      action={(data) =>
        startTransition(async () => {
          setMessage("");
          const file = data.get("file");
          if (
            !(file instanceof File) ||
            file.size > 750000 ||
            file.size === 0
          ) {
            setMessage("Choose a non-empty file up to 750 KB.");
            return;
          }
          try {
            await uploadWorkspaceAsset(data);
            setMessage("File uploaded to private workspace storage.");
            router.refresh();
          } catch {
            setMessage(
              "Upload failed. Check file size, workspace permissions, and storage configuration.",
            );
          }
        })
      }
    >
      <input type="hidden" name="domain" value={domain} />
      <Label htmlFor={`upload-${domain}`}>
        Upload workspace file (up to 750 KB)
      </Label>
      <Input
        id={`upload-${domain}`}
        name="file"
        type="file"
        required
        disabled={pending}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload file"}
      </Button>
      <p role="status">{message}</p>
    </form>
  );
}
