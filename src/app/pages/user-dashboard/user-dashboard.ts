import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { ServiceRecord, UserProfile } from '../../models/types';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div class="page-title">My Dashboard</div>
        <div class="page-subtitle">Welcome back, {{ user()?.name }}!</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:#6b7280">Vehicle</div>
        <div style="font-size:14px;font-weight:600;color:#60a5fa">{{ user()?.vehicleNumber }}</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <div class="card card-body">
        <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:12px">Service Reminders</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          @for (r of reminders(); track r.vehicle) {
            <div style="padding:10px;border-radius:6px;border:1px solid;display:flex;align-items:center;justify-content:space-between"
              [style.border-color]="r.overdue ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'"
              [style.background]="r.overdue ? 'rgba(239,68,68,0.05)' : 'rgba(59,130,246,0.05)'">
              <div>
                <div style="font-size:13px;font-weight:500" [style.color]="r.overdue ? '#f87171' : '#60a5fa'">{{ r.vehicle }}</div>
                <div style="font-size:12px;color:#9ca3af">{{ r.overdue ? 'Overdue by ' + (r.days * -1) + ' days' : 'Due in ' + r.days + ' days' }}</div>
              </div>
              <button class="btn btn-sm" [class.btn-danger]="r.overdue" [class.btn-primary]="!r.overdue">Book Now</button>
            </div>
          }
        </div>
      </div>

      <div class="card card-body">
        <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:12px">Latest Status</div>
        @if (recentServices().length > 0) {
          <div style="background:#1f2937;border:1px solid #374151;border-radius:6px;padding:12px">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
              <span style="font-size:13px;font-weight:500;color:#f9fafb">{{ recentServices()[0].serviceType }}</span>
              <span class="badge" [ngClass]="statusClass(recentServices()[0].status)">{{ recentServices()[0].status }}</span>
            </div>
            <div style="font-size:12px;color:#9ca3af;margin-bottom:6px">{{ recentServices()[0].notes || 'No additional notes.' }}</div>
            <div style="font-size:11px;color:#6b7280">Updated: {{ recentServices()[0].serviceDate }}</div>
          </div>
        } @else {
          <div class="empty-state" style="padding:24px">No recent service records.</div>
        }
      </div>
    </div>

    <div class="card">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:13px;font-weight:500;color:#f9fafb">My Recent History</span>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Date</th><th>Service</th><th>Status</th><th style="text-align:right">Cost</th></tr></thead>
          <tbody>
            @if (recentServices().length === 0) {
              <tr><td colspan="4"><div class="empty-state">No service records found.</div></td></tr>
            }
            @for (s of recentServices(); track s.id) {
              <tr>
                <td>{{ s.serviceDate }}</td>
                <td>{{ s.serviceType }}</td>
                <td><span class="badge" [ngClass]="statusClass(s.status)">{{ s.status }}</span></td>
                <td style="text-align:right;font-weight:500;color:#f9fafb">₹{{ s.cost.toLocaleString() }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UserDashboardComponent implements OnInit {
  user = signal<UserProfile | null>(null);
  recentServices = signal<ServiceRecord[]>([]);
  reminders = signal<{ vehicle: string; days: number; overdue: boolean }[]>([]);

  constructor(private storage: StorageService) {}

  ngOnInit() {
    const u = this.storage.getUser();
    this.user.set(u);
    const all = this.storage.getServices().filter(s => s.vehicleNumber === u?.vehicleNumber);
    this.recentServices.set(all.slice(-5).reverse());
    this.reminders.set([
      { vehicle: u?.vehicleNumber || 'ABC-1234', days: 5, overdue: false },
      { vehicle: 'XYZ-9876', days: -2, overdue: true }
    ]);
  }

  statusClass(s: string) { return { 'badge-yellow': s === 'Pending', 'badge-blue': s === 'In Progress', 'badge-green': s === 'Completed' || s === 'Delivered' }; }
}
