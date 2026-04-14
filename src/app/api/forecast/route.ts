import { NextResponse } from "next/server";
import { buildForecast } from "@/lib/analysis";
import type { DatasetProfile } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      dataset: DatasetProfile;
      metricName?: string;
    };
    const forecast = buildForecast(payload.dataset, payload.metricName);

    return NextResponse.json(forecast);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate forecast.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
