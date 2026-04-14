import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { DatasetProfile } from "@/lib/types";

export async function maybePersistUpload(
  dataset: DatasetProfile,
  fileName?: string,
) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      id: randomUUID(),
      mode: "demo",
      datasetName: dataset.name,
      fileName,
    };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const payload = {
    dataset_name: dataset.name,
    file_name: fileName ?? dataset.name,
    column_count: dataset.columns.length,
    row_count: dataset.rows.length,
    profile_json: dataset,
  };

  const { data, error } = await supabase
    .from("uploads")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return {
      id: randomUUID(),
      mode: "fallback",
      datasetName: dataset.name,
      fileName,
      error: error.message,
    };
  }

  return {
    id: data.id,
    mode: "supabase",
    datasetName: dataset.name,
    fileName,
  };
}
