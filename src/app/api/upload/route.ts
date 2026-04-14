import { NextResponse } from "next/server";
import { maybePersistUpload } from "@/lib/uploads.server";
import type { DatasetProfile } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      dataset: DatasetProfile;
      fileName?: string;
    };

    const upload = await maybePersistUpload(payload.dataset, payload.fileName);

    return NextResponse.json(upload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to register upload.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
