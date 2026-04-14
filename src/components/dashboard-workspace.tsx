"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { demoDataset } from "@/lib/demo-data";
import {
  getMetricColumns,
  createDatasetProfile,
  createQuestions,
  getPrimaryMetric,
} from "@/lib/dataset";
import { parseSpreadsheetFile } from "@/lib/uploads";
import type {
  AnalysisResponse,
  DatasetProfile,
  ForecastResponse,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BrainCircuit,
  ChartColumnBig,
  FileSpreadsheet,
  LoaderCircle,
  MessageSquareText,
  Sparkles,
  Upload,
} from "@/lib/icons";

const defaultQuestion =
  "What are the top trends, biggest risks, and best next chart to show an executive?";

export function DashboardWorkspace() {
  const [dataset, setDataset] = useState<DatasetProfile>(demoDataset);
  const [question, setQuestion] = useState(defaultQuestion);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [status, setStatus] = useState<string>("Loaded sample dataset.");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(
    getMetricColumns(demoDataset.rows)[0] ?? "",
  );
  const [isAnalyzing, startAnalyze] = useTransition();
  const [isForecasting, startForecast] = useTransition();

  useEffect(() => {
    setIsMounted(true);
    void runAnalysis(defaultQuestion, demoDataset, selectedMetric);
    void runForecast(demoDataset, selectedMetric);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis(
    nextQuestion: string,
    nextDataset = dataset,
    metricName = selectedMetric,
  ) {
    startAnalyze(async () => {
      setStatus("Analyzing your dataset...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: nextQuestion,
          dataset: nextDataset,
          metricName,
        }),
      });

      const result = (await response.json()) as AnalysisResponse | { error: string };

      if (!response.ok || "error" in result) {
        setStatus("Analysis failed. Check your env configuration and try again.");
        return;
      }

      setAnalysis(result);
      setStatus("Analysis updated.");
    });
  }

  async function runForecast(nextDataset = dataset, metricName = selectedMetric) {
    startForecast(async () => {
      const response = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset: nextDataset, metricName }),
      });

      const result = (await response.json()) as ForecastResponse | { error: string };

      if (!response.ok || "error" in result) {
        setStatus("Forecast generation failed.");
        return;
      }

      setForecast(result);
    });
  }

  async function handleFileChange(file: File) {
    setStatus(`Reading ${file.name}...`);

    try {
      const rows = await parseSpreadsheetFile(file);
      const profile = createDatasetProfile(file.name, rows);
      const suggestedQuestion = createQuestions(profile)[0] ?? defaultQuestion;
      const metric = getMetricColumns(profile.rows)[0] ?? "";

      setDataset(profile);
      setQuestion(suggestedQuestion);
      setSelectedMetric(metric);
      setAnalysis(null);
      setForecast(null);

      await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset: profile, fileName: file.name }),
      });

      void runAnalysis(suggestedQuestion, profile, metric);
      void runForecast(profile, metric);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to parse spreadsheet.",
      );
    }
  }

  const promptSuggestions = createQuestions(dataset);
  const heroMetric = getPrimaryMetric(dataset.rows);
  const metricColumns = getMetricColumns(dataset.rows);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(253,224,71,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.1),_transparent_28%),#09111f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">
                  Workspace
                </p>
                <h1 className="mt-2 text-3xl font-semibold">Explain My Data</h1>
              </div>
              <div className="rounded-full bg-emerald-300/15 px-4 py-2 text-sm text-emerald-100">
                Demo-ready
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Upload a spreadsheet, ask a business question, and get an analyst
              summary, chart direction, and a quick forecast. This prototype is
              wired so Supabase, Clerk, Upstash, and AI providers can be switched
              on with environment variables.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Rows"
                value={dataset.rows.length.toLocaleString()}
                tone="amber"
              />
              <StatCard
                label="Columns"
                value={String(dataset.columns.length)}
                tone="cyan"
              />
              <StatCard
                label="Primary metric"
                value={heroMetric.label}
                tone="emerald"
              />
            </div>

            <label className="mt-6 flex cursor-pointer flex-col gap-3 rounded-[1.75rem] border border-dashed border-white/20 bg-slate-950/45 p-5 transition hover:border-amber-300/50 hover:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-slate-950">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Upload CSV or Excel</p>
                  <p className="text-sm text-slate-400">
                    Parse locally, profile instantly, then store metadata through
                    the API layer.
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleFileChange(file);
                  }
                }}
              />
              <span className="text-sm text-amber-200">
                Choose a spreadsheet to replace the sample dataset
              </span>
            </label>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
              <div className="flex items-center gap-3">
                <MessageSquareText className="h-5 w-5 text-cyan-200" />
                <p className="font-semibold">Ask your analyst</p>
              </div>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="mt-4 min-h-32 w-full rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-300"
                placeholder="Ask about revenue drivers, churn, seasonality, anomalies, cohorts..."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {promptSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuestion(item)}
                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <span>Forecast metric</span>
                  <select
                    value={selectedMetric}
                    onChange={(event) => {
                      const metric = event.target.value;
                      setSelectedMetric(metric);
                      void runAnalysis(question, dataset, metric);
                      void runForecast(dataset, metric);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                  >
                    {metricColumns.map((column) => (
                      <option key={column} value={column} className="bg-slate-950">
                        {column}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-sm text-slate-400">{status}</p>
                <button
                  type="button"
                  onClick={() => void runAnalysis(question)}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isAnalyzing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate analysis
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-3">
              <OutcomeCard
                icon={FileSpreadsheet}
                title={dataset.name}
                copy="Parsed profile used across insights, charts, and forecasting."
              />
              <OutcomeCard
                icon={BrainCircuit}
                title={analysis?.answerTitle ?? "AI narrative"}
                copy={analysis?.summary ?? "Ask a question to generate a summary."}
              />
              <OutcomeCard
                icon={ChartColumnBig}
                title={
                  forecast?.metricName
                    ? `${forecast.headline} (${forecast.metricName})`
                    : "Forecast engine"
                }
                copy={forecast?.summary ?? "Forecast appears after profiling the file."}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                      Suggested chart
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      {analysis?.chart.title ?? "Monthly performance overview"}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                      {analysis?.chart.rationale ??
                        "The chart recommendation will appear once analysis is complete."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void runForecast()}
                    disabled={isForecasting}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-emerald-300 disabled:opacity-70"
                  >
                    {isForecasting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    Refresh forecast
                  </button>
                </div>

                <div className="mt-6 h-80 rounded-[1.5rem] bg-slate-950/50 p-4">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysis?.chart.data ?? dataset.timeSeries}>
                        <defs>
                          <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            background: "#08111f",
                            borderRadius: 18,
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#fbbf24"
                          fillOpacity={1}
                          fill="url(#metricFill)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[1.25rem] border border-white/8 bg-white/4 text-sm text-slate-400">
                      Chart preview loads after hydration.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Insights
                </p>
                <div className="mt-5 space-y-4">
                  {(analysis?.insights ?? []).map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {item.detail}
                      </p>
                    </div>
                  ))}

                  {analysis?.insights.length ? null : (
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm text-slate-400">
                      Insights will show up here after the first analysis call.
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/8 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/70">
                    Forecast summary
                  </p>
                  <p className="mt-3 text-lg font-semibold">
                    {forecast?.headline ?? "Forecast pending"}
                  </p>
                  {forecast?.metricName ? (
                    <p className="mt-2 text-sm text-emerald-100/80">
                      Forecasting column: {forecast.metricName}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm leading-7 text-emerald-50/90">
                    {forecast?.summary ??
                      "Once generated, the forecast will describe the next period trajectory and confidence."}
                  </p>
                  {forecast?.projectedPoints?.length ? (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {forecast.projectedPoints.map((point) => (
                        <div
                          key={point.label}
                          className="rounded-2xl border border-white/10 bg-slate-950/35 p-3"
                        >
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            {point.label}
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {point.value.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "cyan" | "emerald";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.4rem] border p-4",
        tone === "amber" && "border-amber-300/25 bg-amber-300/10",
        tone === "cyan" && "border-cyan-300/25 bg-cyan-300/10",
        tone === "emerald" && "border-emerald-300/25 bg-emerald-300/10",
      )}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-white/60">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function OutcomeCard({
  icon: Icon,
  title,
  copy,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  copy: string;
}) {
  return (
    <article className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/60 text-amber-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-300">{copy}</p>
    </article>
  );
}
