"use client";

import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ParseResult } from "papaparse";
import { createDatasetProfile, createQuestions, getPrimaryMetric } from "@/lib/dataset";
import type { DataRow } from "@/lib/types";

export async function parseSpreadsheetFile(file: File): Promise<DataRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return new Promise((resolve, reject) => {
      Papa.parse<DataRow>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results: ParseResult<DataRow>) => resolve(results.data),
        error: (error: Error) => reject(error),
      });
    });
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];

  if (!firstSheet) {
    throw new Error("Spreadsheet is empty.");
  }

  return XLSX.utils.sheet_to_json<DataRow>(firstSheet, {
    defval: null,
  });
}
export { createDatasetProfile, createQuestions, getPrimaryMetric };
