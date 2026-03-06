export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DashboardStatsResponse {
  summaryCards: { [key: string]: number };
  revenueTrend: ChartDataPoint[];
  spaceUsage: ChartDataPoint[];
  statusDistribution: ChartDataPoint[];
}
