import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStatsResponse } from '../../core/models/dashboard.models';
// NgChartsModule is provided by the application module; remove local import to avoid mismatched package exports
import { ChartConfiguration, ChartData } from 'chart.js';
import { IconsModule } from '../../shared/icons/icons.module';
// Icons are provided via the centralized IconsModule (imported into this standalone component)

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconsModule],
  // icons are provided globally (centralized)
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private statsService = inject(DashboardService);

  // Using ng-icons (lucide) for icons

  stats = signal<DashboardStatsResponse | null>(null);
  loading = signal(true);

  // Revenue Trend Chart
  public lineChartData: ChartData<'line'> = {
    datasets: [],
    labels: []
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  // Status Distribution Chart
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // Space Usage Chart
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  ngOnInit() {
    this.statsService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res);
        this.prepareCharts(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching stats:', err);
        this.loading.set(false);
      }
    });
  }

  private prepareCharts(res: DashboardStatsResponse) {
    // Line Chart: Revenue Trend
    this.lineChartData = {
      labels: res.revenueTrend.map(d => d.label),
      datasets: [
        {
          data: res.revenueTrend.map(d => d.value),
          label: 'Revenue',
          borderColor: '#14b8a6',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Doughnut Chart: Status
    this.doughnutChartData = {
      labels: res.statusDistribution.map(d => d.label),
      datasets: [
        {
          data: res.statusDistribution.map(d => d.value),
          backgroundColor: ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#94a3b8']
        }
      ]
    };

    // Bar Chart: Space Usage
    this.barChartData = {
      labels: res.spaceUsage.map(d => d.label),
      datasets: [
        {
          data: res.spaceUsage.map(d => d.value),
          label: 'Bookings',
          backgroundColor: '#6366f1'
        }
      ]
    };
  }
}
