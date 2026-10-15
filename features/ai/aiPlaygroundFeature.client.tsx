"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AiPlaygroundTemplate } from "@/components/templates/aiPlaygroundTemplate";
export function AiPlaygroundFeatureClient({
  configuration,
}: {
  configuration: { configured: boolean; model: string };
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <AiPlaygroundTemplate
      model={configuration.model}
      output={
        <div aria-live="polite" className="whitespace-pre-wrap">
          {pending
            ? "Generating…"
            : output || "Submit a prompt to generate a response."}
        </div>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          try {
            const response = await fetch("/api/ai/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt }),
            });
            const result: unknown = await response.json();
            if (
              !response.ok ||
              !result ||
              typeof result !== "object" ||
              !("text" in result) ||
              typeof result.text !== "string"
            )
              throw new Error(
                "Generation failed. Check provider configuration, permissions, or rate limits.",
              );
            setOutput(result.text);
            router.refresh();
          } catch {
            setError(
              "Generation failed. Check provider configuration, permissions, or rate limits.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <Label htmlFor="ai-prompt">Your prompt</Label>
        <textarea
          id="ai-prompt"
          className="control-field min-h-64 w-full"
          required
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={pending}
        />
        {!configuration.configured && (
          <p role="status">
            The AI provider is not configured for this workspace.
          </p>
        )}
        {error && <p role="alert">{error}</p>}
        <Button type="submit" disabled={pending || !configuration.configured}>
          {pending ? "Generating…" : "Generate response"}
        </Button>
      </form>
    </AiPlaygroundTemplate>
  );
}
