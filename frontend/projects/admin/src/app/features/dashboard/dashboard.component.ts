import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStatsResponse } from '../../core/models/dashboard.models';
import { ChartConfiguration, ChartData } from 'chart.js';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private statsService = inject(DashboardService);
  private authService = inject(AuthService);
  private refreshInterval?: number;

  stats = signal<DashboardStatsResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  sidebarOpen = signal(true);

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
    this.loadStats();
    this.refreshInterval = window.setInterval(() => this.loadStats(), 60000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadStats() {
    this.loading.set(true);
    this.error.set(null);
    this.statsService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res);
        this.prepareCharts(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching stats:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  private prepareCharts(res: DashboardStatsResponse) {
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

    this.doughnutChartData = {
      labels: res.statusDistribution.map(d => d.label),
      datasets: [
        {
          data: res.statusDistribution.map(d => d.value),
          backgroundColor: ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#94a3b8']
        }
      ]
    };

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
