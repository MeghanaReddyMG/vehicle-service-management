import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Customer, ServiceRecord } from '../../models/types';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="page-title">Dashboard</div>
      <div class="page-subtitle">Garage analytics and operational overview.</div>
    </div>

    <div class="grid-5" style="margin-bottom:24px">
      <div class="card card-body stat-card">
        <div class="stat-icon" style="background:rgba(37,99,235,0.15)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-label">Customers</div>
        <div class="stat-value">{{ stats.totalCustomers }}</div>
      </div>
      <div class="card card-body stat-card">
        <div class="stat-icon" style="background:rgba(124,58,237,0.15)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <div class="stat-label">Total Services</div>
        <div class="stat-value">{{ stats.totalServices }}</div>
      </div>
      <div class="card card-body stat-card">
        <div class="stat-icon" style="background:rgba(5,150,105,0.15)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </div>
        <div class="stat-label">Revenue</div>
        <div class="stat-value">₹{{ stats.revenue.toLocaleString() }}</div>
      </div>
      <div class="card card-body stat-card">
        <div class="stat-icon" style="background:rgba(217,119,6,0.15)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-label">Pending</div>
        <div class="stat-value">{{ stats.pendingServices }}</div>
      </div>
      <div class="card card-body stat-card">
        <div class="stat-icon" style="background:rgba(59,130,246,0.1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="stat-label">Top Service</div>
        <div class="stat-value" style="font-size:13px">{{ stats.mostCommonService }}</div>
      </div>
    </div>

    <div class="dash-grid">
      <!-- Chart -->
      <div class="card" style="padding:20px">
        <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:16px">Revenue Overview</div>
        <div class="chart-bars">
          @for (d of chartData; track d.name) {
            <div class="chart-col">
              <div class="bar-wrap">
                <div class="bar" [style.height.%]="(d.revenue / maxRevenue) * 100" [class.bar-active]="$last"></div>
              </div>
              <div class="bar-label">{{ d.name }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header" style="font-size:13px;font-weight:500;color:#f9fafb">Recent Activity</div>
        @if (recentServices.length === 0) {
          <div class="empty-state">No recent activity.</div>
        }
        @for (s of recentServices; track s.id) {
          <div class="activity-item">
            <div class="activity-avatar">{{ s.customerName.charAt(0) }}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;color:#f9fafb">{{ s.customerName }}</div>
              <div style="font-size:11px;color:#6b7280">{{ s.vehicleNumber }} · {{ s.serviceType }}</div>
            </div>
            <span class="badge" [ngClass]="statusClass(s.status)">{{ s.status }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-card { display: flex; flex-direction: column; gap: 4px; }
    .stat-icon { width: 36px; height: 36px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .stat-icon svg { width: 18px; height: 18px; }
    .stat-label { font-size: 11px; color: #6b7280; }
    .stat-value { font-size: 20px; font-weight: 600; color: #f9fafb; }
    .dash-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr; } }
    .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 180px; padding-bottom: 24px; position: relative; }
    .chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
    .bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .bar { width: 100%; background: #374151; border-radius: 3px 3px 0 0; transition: height 0.3s; min-height: 4px; }
    .bar-active { background: #3b82f6; }
    .bar-label { font-size: 11px; color: #6b7280; margin-top: 6px; }
    .activity-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid #1f2937; }
    .activity-item:last-child { border-bottom: none; }
    .activity-avatar { width: 28px; height: 28px; border-radius: 50%; background: #1f2937; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; color: #9ca3af; flex-shrink: 0; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats = { totalCustomers: 0, totalServices: 0, pendingServices: 0, revenue: 0, mostCommonService: 'N/A' };
  recentServices: ServiceRecord[] = [];
  chartData = [
    { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 }, { name: 'May', revenue: 1890 }, { name: 'Jun', revenue: 2390 }
  ];
  maxRevenue = 4000;

  constructor(private storage: StorageService) {}

  ngOnInit() {
    const customers: Customer[] = this.storage.getCustomers();
    const services: ServiceRecord[] = this.storage.getServices();
    const pending = services.filter(s => s.status === 'Pending' || s.status === 'In Progress').length;
    const revenue = services.reduce((a, s) => a + (s.cost || 0), 0);
    const counts: Record<string, number> = {};
    services.forEach(s => { counts[s.serviceType] = (counts[s.serviceType] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    this.stats = { totalCustomers: customers.length, totalServices: services.length, pendingServices: pending, revenue, mostCommonService: top };
    this.recentServices = services.slice(-5).reverse();
  }

  statusClass(status: string) {
    return { 'badge-green': status === 'Delivered', 'badge-yellow': status === 'Pending', 'badge-blue': status === 'In Progress' || status === 'Completed' };
  }
}
