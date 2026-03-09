package com.aihub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Map<String, Number> summaryCards;
    private List<ChartDataPoint> revenueTrend;
    private List<ChartDataPoint> spaceUsage;
    private List<ChartDataPoint> statusDistribution;
}
