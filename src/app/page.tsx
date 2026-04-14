import Link from "next/link";
import { demoDataset } from "@/lib/demo-data";
import {
  Bot,
  BrainCircuit,
  ChartColumnBig,
  Database,
  FileSpreadsheet,
  Lock,
  Sparkles,
  Upload,
} from "@/lib/icons";

const stack = [
  {
    title: "Frontend",
    value: "Next.js on Vercel",
    description: "Fast onboarding, dashboard UX, and streaming analysis surfaces.",
    icon: ChartColumnBig,
  },
  {
    title: "Auth",
    value: "Clerk",
    description: "User accounts, organizations, and protected workspaces.",
    icon: Lock,
  },
  {
    title: "Data Layer",
    value: "Supabase",
    description: "Metadata in Postgres and uploaded files in Storage buckets.",
    icon: Database,
  },
  {
    title: "AI Engine",
    value: "OpenAI or Claude",
    description: "Question answering, dataset narration, and forecast commentary.",
    icon: BrainCircuit,
  },
  {
    title: "Jobs + Cache",
    value: "Upstash Redis",
    description: "Queued runs, fast retrieval of recent analyses, and warm cache keys.",
    icon: Sparkles,
  },
  {
    title: "Semantic Search",
    value: "Pinecone (optional)",
    description: "Cross-file memory and semantic lookup over prior analyses.",
    icon: Bot,
  },
];

const highlights = [
  "Upload CSV or Excel in seconds.",
  "Ask plain-English questions about trends, anomalies, and segments.",
  "Generate charts and lightweight forecasts without writing SQL.",
];

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_35%),linear-gradient(180deg,_#08111f_0%,_#0d1626_45%,_#f4efe6_45%,_#f4efe6_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm text-white shadow-[0_12px_50px_rgba(0,0,0,0.22)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-slate-900">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold tracking-[0.22em] uppercase text-white/70">
                Explain My Data
              </p>
              <p className="text-white">AI Data Analyst SaaS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:bg-white/10"
            >
              Open dashboard
            </Link>
            <a
              href="#stack"
              className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              View architecture
            </a>
          </div>
        </header>

        <section className="grid flex-1 gap-12 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
              <Upload className="h-4 w-4" />
              Upload files, ask questions, get instant analysis
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Turn messy spreadsheets into answers, visuals, and forward-looking
                insight.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                This build gives you the SaaS foundation: a Next.js dashboard,
                upload workflow, AI question answering, insights generation, chart
                recommendations, and forecasting hooks around Clerk, Supabase,
                Upstash, and optional Pinecone.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-white/6 p-4 text-sm text-slate-200 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Launch product prototype
              </Link>
              <a
                href="#demo"
                className="rounded-full border border-white/20 px-6 py-3 text-sm text-white transition hover:bg-white/10"
              >
                See built-in sample data
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-900 p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                    Live product preview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Revenue Ops Dataset</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {demoDataset.rows.length.toLocaleString()} rows,{" "}
                    {demoDataset.columns.length} columns, uploaded from CSV
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-300/15 px-3 py-2 text-xs text-emerald-200">
                  Demo mode ready
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <PreviewMetric label="Revenue" value="$428k" delta="+14.2%" />
                <PreviewMetric label="Avg. growth" value="8.6%" delta="+2.1 pts" />
                <PreviewMetric label="Risk signal" value="Low" delta="Stable" />
              </div>

              <div className="mt-6 rounded-3xl border border-white/8 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Example question
                </p>
                <p className="mt-3 text-lg">
                  Which region is underperforming relative to growth plan, and
                  what should I watch next month?
                </p>
                <div className="mt-4 rounded-2xl bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50">
                  South is trailing plan because revenue growth lags while churn
                  is climbing. Prioritize retention campaigns there and watch
                  April renewal cohorts. A monthly revenue line chart plus churn
                  by region explains the story clearly.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="stack"
          className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_25px_100px_rgba(15,23,42,0.08)] backdrop-blur lg:p-8"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                Architecture
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Built exactly around the stack you described
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              The scaffold is designed so each service can be activated through
              environment variables. If a service is not configured yet, the app
              falls back gracefully instead of breaking local development.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stack.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-amber-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {item.title}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{item.value}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="demo" className="py-16">
          <div className="rounded-[2rem] border border-slate-200 bg-[#f7f1e6] p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Demo dataset
                </p>
                <h2 className="mt-2 text-3xl font-semibold">
                  Included so you can test the experience immediately
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  The dashboard ships with a realistic revenue operations sample
                  file. That means you can open the product, ask questions, and
                  see the full loop even before connecting Supabase storage or
                  dropping in real customer spreadsheets.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {demoDataset.columns.map((column) => (
                  <div
                    key={column.name}
                    className="rounded-3xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {column.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {column.kind}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {column.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PreviewMetric({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-emerald-200">{delta}</p>
    </div>
  );
}
