import type { ChartPoint, ColumnProfile, DataRow, DatasetProfile } from "@/lib/types";

export function createDatasetProfile(name: string, rows: DataRow[]): DatasetProfile {
  if (!rows.length) {
    throw new Error("No rows were found in the uploaded file.");
  }

  const keys = Object.keys(rows[0] ?? {});
  const columns = keys.map((key) => describeColumn(key, rows));
  const timeColumn = columns.find((column) => column.kind === "time")?.name ?? keys[0];
  const metricColumn =
    getMetricColumns(rows)[0] ??
    keys.find((key) => typeof rows[0]?.[key] === "number") ??
    keys[1] ??
    keys[0];

  return {
    name,
    columns,
    rows,
    sampleRows: rows.slice(0, 5),
    timeSeries: buildMetricSeries(rows, timeColumn, metricColumn),
    notes: [
      `Detected ${columns.filter((column) => column.kind === "metric").length} metric columns.`,
      `Primary time axis inferred from "${timeColumn}".`,
      `Primary measure inferred from "${metricColumn}".`,
    ],
  };
}

export function createQuestions(dataset: DatasetProfile) {
  const metric = dataset.columns.find((column) => column.kind === "metric")?.name ?? "performance";
  const dimension =
    dataset.columns.find((column) => column.kind === "dimension")?.name ?? "segment";

  return [
    `Which ${dimension} is driving the biggest change in ${metric}?`,
    "Summarize the main risks and opportunities in this dataset.",
    "What chart would best explain the trend to an executive team?",
  ];
}

export function getPrimaryMetric(rows: DataRow[]) {
  const numericEntries = Object.entries(rows[0] ?? {}).filter(
    ([, value]) => typeof value === "number",
  );

  if (!numericEntries.length) {
    return { label: "No numeric field", value: 0 };
  }

  const [label] = numericEntries[0];
  const total = rows.reduce((sum, row) => sum + Number(row[label] ?? 0), 0);

  return {
    label,
    value: Math.round(total),
  };
}

export function getMetricColumns(rows: DataRow[]) {
  return Object.entries(rows[0] ?? {})
    .filter(([, value]) => typeof value === "number")
    .map(([key]) => key);
}

export function getTimeColumn(dataset: DatasetProfile) {
  return dataset.columns.find((column) => column.kind === "time")?.name ?? Object.keys(dataset.rows[0] ?? {})[0] ?? "index";
}

export function buildMetricSeries(
  rows: DataRow[],
  timeColumn: string,
  metricColumn: string,
): ChartPoint[] {
  const grouped = new Map<string, number>();

  rows.forEach((row) => {
    const label = String(row[timeColumn] ?? "Unknown");
    const metric = Number(row[metricColumn] ?? 0);
    grouped.set(label, (grouped.get(label) ?? 0) + (Number.isFinite(metric) ? metric : 0));
  });

  return [...grouped.entries()].map(([label, value]) => ({
    label,
    value: Math.round(value),
  }));
}

function describeColumn(name: string, rows: DataRow[]): ColumnProfile {
  const values = rows.map((row) => row[name]).filter((value) => value !== null);
  const lower = name.toLowerCase();

  if (lower.includes("date") || lower.includes("month") || lower.includes("year")) {
    return {
      name,
      kind: "time",
      description: "Likely a date or reporting period field.",
    };
  }

  if (values.every((value) => typeof value === "number")) {
    return {
      name,
      kind: "metric",
      description: "Numeric field that can be aggregated for analysis.",
    };
  }

  return {
    name,
    kind: "dimension",
    description: "Categorical field that can be used for grouping and filters.",
  };
}
