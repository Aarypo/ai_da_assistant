import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { buildMetricSeries, getTimeColumn } from "@/lib/dataset";
import type {
  AnalysisResponse,
  AnalyzeRequest,
  ChartPoint,
  DatasetProfile,
  ForecastResponse,
  InsightItem,
} from "@/lib/types";

export async function generateAnalysis({
  question,
  dataset,
  metricName,
}: AnalyzeRequest): Promise<AnalysisResponse> {
  const activeMetric = metricName ?? dataset.columns.find((column) => column.kind === "metric")?.name;
  const activeSeries =
    activeMetric && dataset.rows.length
      ? buildMetricSeries(dataset.rows, getTimeColumn(dataset), activeMetric)
      : dataset.timeSeries;
  const fallback = buildFallbackAnalysis(question, dataset, activeMetric, activeSeries);

  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return fallback;
  }

  try {
    const model = process.env.OPENAI_API_KEY
      ? openai("gpt-5.4-mini")
      : anthropic("claude-3-7-sonnet-latest");

    const prompt = [
      "You are a senior SaaS data analyst.",
      "Answer using concise executive language.",
      "Return valid JSON with keys: answerTitle, summary, insights, chart.",
      "The insights key must be an array of 3 objects with title and detail.",
      "The chart key must have title and rationale.",
      `Question: ${question}`,
      `Dataset name: ${dataset.name}`,
      `Columns: ${dataset.columns.map((column) => `${column.name} (${column.kind})`).join(", ")}`,
      `Forecast metric: ${activeMetric ?? "auto"}`,
      `Sample rows: ${JSON.stringify(dataset.sampleRows)}`,
      `Time series: ${JSON.stringify(activeSeries)}`,
      `Notes: ${dataset.notes.join(" | ")}`,
    ].join("\n");

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    const parsed = safeParseJson(text);

    if (!parsed) {
      return fallback;
    }

    return {
      answerTitle: readString(parsed.answerTitle) ?? fallback.answerTitle,
      summary: readString(parsed.summary) ?? fallback.summary,
      insights: readInsights(parsed.insights) ?? fallback.insights,
      chart: {
        title: readString(readRecord(parsed.chart)?.title) ?? fallback.chart.title,
        rationale:
          readString(readRecord(parsed.chart)?.rationale) ?? fallback.chart.rationale,
        data: activeSeries,
      },
    };
  } catch {
    return fallback;
  }
}

export function buildForecast(
  dataset: DatasetProfile,
  metricName?: string,
): ForecastResponse {
  const activeMetric = metricName ?? dataset.columns.find((column) => column.kind === "metric")?.name;
  const series =
    activeMetric && dataset.rows.length
      ? buildMetricSeries(dataset.rows, getTimeColumn(dataset), activeMetric)
      : dataset.timeSeries;
  const projectedPoints = projectForward(series);
  const current = series.at(-1)?.value ?? 0;
  const next = projectedPoints[0]?.value ?? current;
  const delta = current ? (((next - current) / current) * 100).toFixed(1) : "0.0";

  return {
    headline: `Projected next-period change: ${delta}%`,
    summary:
      "This lightweight forecast extrapolates the recent trend in the primary metric. In production, this is where you can add model-based forecasting jobs, scheduled refreshes, or anomaly-aware Redis-backed pipelines.",
    projectedPoints,
    metricName: activeMetric,
  };
}

function buildFallbackAnalysis(
  question: string,
  dataset: DatasetProfile,
  metricName?: string,
  series: ChartPoint[] = dataset.timeSeries,
): AnalysisResponse {
  const topMetric = series.at(-1)?.value ?? 0;
  const previousMetric = series.at(-2)?.value ?? topMetric;
  const growth = previousMetric
    ? (((topMetric - previousMetric) / previousMetric) * 100).toFixed(1)
    : "0.0";

  return {
    answerTitle: "Executive dataset summary",
    summary: `Based on "${dataset.name}", the latest period is trending ${Number(growth) >= 0 ? "up" : "down"} ${growth}% versus the prior point. Your question was: "${question}". The strongest next step is to compare the leading metric by segment and investigate the weakest cohort.`,
    insights: [
      {
        title: "Momentum signal",
        detail:
          "Recent periods suggest steady movement in the primary metric, which makes trend-based storytelling and forecasting viable for stakeholders.",
      },
      {
        title: "Segmentation opportunity",
        detail:
          "Use your dimension columns to break down winners versus laggards, then pair them with the main metric for a clear management view.",
      },
      {
        title: "Recommended workflow",
        detail:
          "Surface a top-line trend chart first, then follow with a segment comparison and a risk note around any rising negative metric such as churn or cost.",
      },
    ],
    chart: {
      title: `${metricName ?? "Primary metric"} trend over time`,
      rationale:
        "A simple time-series view quickly communicates whether growth is accelerating, flattening, or reversing before drilling into segment performance.",
      data: series,
    },
  };
}

function projectForward(series: ChartPoint[]) {
  if (series.length < 2) {
    return [];
  }

  const points = series.slice(-3);
  const deltas = points
    .slice(1)
    .map((point, index) => point.value - points[index]!.value);
  const avgDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  let lastValue = series.at(-1)?.value ?? 0;

  return Array.from({ length: 3 }, (_, index) => {
    lastValue = Math.round(lastValue + avgDelta);
    return {
      label: `F${index + 1}`,
      value: lastValue,
    };
  });
}

function safeParseJson(input: string): Record<string, unknown> | null {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");

  if (start === -1 || end === -1) {
    return null;
  }

  try {
    return JSON.parse(input.slice(start, end + 1));
  } catch {
    return null;
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function readInsights(value: unknown): InsightItem[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const insights = value
    .map((item) => {
      const record = readRecord(item);

      if (!record) {
        return null;
      }

      const title = readString(record.title);
      const detail = readString(record.detail);

      if (!title || !detail) {
        return null;
      }

      return { title, detail };
    })
    .filter((item): item is InsightItem => item !== null);

  return insights.length ? insights : null;
}
