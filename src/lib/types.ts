export type CellValue = string | number | null;

export type DataRow = Record<string, CellValue>;

export type ColumnProfile = {
  name: string;
  kind: "dimension" | "metric" | "time";
  description: string;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type DatasetProfile = {
  name: string;
  columns: ColumnProfile[];
  rows: DataRow[];
  sampleRows: DataRow[];
  timeSeries: ChartPoint[];
  notes: string[];
};

export type InsightItem = {
  title: string;
  detail: string;
};

export type AnalysisResponse = {
  answerTitle: string;
  summary: string;
  insights: InsightItem[];
  chart: {
    title: string;
    rationale: string;
    data: ChartPoint[];
  };
};

export type ForecastResponse = {
  headline: string;
  summary: string;
  projectedPoints: ChartPoint[];
  metricName?: string;
};

export type AnalyzeRequest = {
  question: string;
  dataset: DatasetProfile;
  metricName?: string;
};
