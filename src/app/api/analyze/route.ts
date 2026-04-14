import { NextResponse } from "next/server";
import { generateAnalysis } from "@/lib/analysis";
import type { AnalyzeRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzeRequest;
    const result = await generateAnalysis(payload);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyze dataset.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
