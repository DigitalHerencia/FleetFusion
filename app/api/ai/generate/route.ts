import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError } from "@/lib/auth/auth";
import { AuthorizationError } from "@/lib/authz/permissions";
import { ResourceAuthorizationError } from "@/lib/authz/policies";
import { executeGenerationWorkflow } from "@/lib/workflows/aiWorkflows";
import { aiGenerationRequestSchema } from "@/schemas/aiSchemas";

export async function POST(request: Request) {
  try {
    const { prompt } = aiGenerationRequestSchema.parse(await request.json());
    return NextResponse.json(await executeGenerationWorkflow({ prompt }));
  } catch (cause) {
    if (cause instanceof SyntaxError || cause instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid AI generation request." },
        { status: 400 },
      );
    }
    if (cause instanceof AuthenticationRequiredError) {
      return NextResponse.json(
        { error: "Authentication is required." },
        { status: 401 },
      );
    }
    if (
      cause instanceof AuthorizationError ||
      cause instanceof ResourceAuthorizationError
    ) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    if (cause instanceof Error && cause.name === "AiRateLimitError") {
      return NextResponse.json(
        { error: "AI generation rate limit exceeded." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "AI generation failed." },
      { status: 500 },
    );
  }
}
