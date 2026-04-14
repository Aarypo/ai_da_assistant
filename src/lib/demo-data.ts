import type { DatasetProfile } from "@/lib/types";

export const demoDataset: DatasetProfile = {
  name: "revenue-ops-q1.csv",
  columns: [
    {
      name: "month",
      kind: "time",
      description: "Monthly reporting bucket.",
    },
    {
      name: "region",
      kind: "dimension",
      description: "Sales territory used for segment comparison.",
    },
    {
      name: "revenue",
      kind: "metric",
      description: "Booked revenue for the period.",
    },
    {
      name: "churn_rate",
      kind: "metric",
      description: "Percentage of customers lost in the region.",
    },
  ],
  rows: [
    { month: "Jan", region: "North", revenue: 92000, churn_rate: 2.1 },
    { month: "Jan", region: "South", revenue: 67000, churn_rate: 3.8 },
    { month: "Jan", region: "West", revenue: 81000, churn_rate: 2.6 },
    { month: "Feb", region: "North", revenue: 101000, churn_rate: 2.0 },
    { month: "Feb", region: "South", revenue: 69000, churn_rate: 4.1 },
    { month: "Feb", region: "West", revenue: 86000, churn_rate: 2.4 },
    { month: "Mar", region: "North", revenue: 108000, churn_rate: 1.9 },
    { month: "Mar", region: "South", revenue: 72000, churn_rate: 4.4 },
    { month: "Mar", region: "West", revenue: 90000, churn_rate: 2.3 },
  ],
  sampleRows: [
    { month: "Jan", region: "North", revenue: 92000, churn_rate: 2.1 },
    { month: "Feb", region: "South", revenue: 69000, churn_rate: 4.1 },
    { month: "Mar", region: "West", revenue: 90000, churn_rate: 2.3 },
  ],
  timeSeries: [
    { label: "Jan", value: 240000 },
    { label: "Feb", value: 256000 },
    { label: "Mar", value: 270000 },
  ],
  notes: [
    "North is the best-performing region in absolute revenue.",
    "South has the highest churn and the weakest growth trend.",
    "Monthly totals show consistent momentum into March.",
  ],
};
