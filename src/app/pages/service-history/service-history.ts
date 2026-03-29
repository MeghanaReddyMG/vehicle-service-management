import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { ServiceRecord, ServiceStatus, UserProfile } from '../../models/types';

@Component({
  selector: 'app-service-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div class="page-title">{{ user()?.role === 'Admin' ? 'Service History' : 'My Service History' }}</div>
        <div class="page-subtitle">{{ user()?.role === 'Admin' ? 'Track and manage all service records.' : 'Your vehicle service history.' }}</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;padding:14px">
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
        <div class="search-bar" style="flex:1;min-width:200px">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="form-control" [(ngModel)]="searchTerm" placeholder="Search by customer, vehicle, service..." />
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          @for (s of statuses; track s) {
            <button class="btn btn-sm" [class.btn-primary]="statusFilter() === s" [class.btn-secondary]="statusFilter() !== s" (click)="statusFilter.set(s)">{{ s }}</button>
          }
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>Date</th><th>Customer</th><th>Vehicle</th><th>Service</th><th>Status</th><th>Cost</th>
          </tr></thead>
          <tbody>
            @if (filtered().length === 0) {
              <tr><td colspan="6"><div class="empty-state">No records found.</div></td></tr>
            }
            @for (s of filtered(); track s.id) {
              <tr>
                <td>{{ s.serviceDate }}</td>
                <td style="font-weight:500;color:#f9fafb">{{ s.customerName }}</td>
                <td style="color:#9ca3af">{{ s.vehicleNumber }}</td>
                <td>{{ s.serviceType }}</td>
                <td>
                  @if (user()?.role === 'Admin') {
                    <select class="form-control" style="padding:4px 8px;font-size:12px;width:auto" [ngModel]="s.status" (ngModelChange)="updateStatus(s.id, $event)" [name]="'status-'+s.id">
                      @for (st of serviceStatuses; track st) { <option [value]="st">{{ st }}</option> }
                    </select>
                  } @else {
                    <span class="badge" [ngClass]="statusClass(s.status)">{{ s.status }}</span>
                  }
                </td>
                <td style="font-weight:500;color:#f9fafb">₹{{ s.cost.toLocaleString() }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ServiceHistoryComponent implements OnInit {
  user = signal<UserProfile | null>(null);
  services: ServiceRecord[] = [];
  searchTerm = '';
  statusFilter = signal('All');
  statuses = ['All', 'Pending', 'In Progress', 'Completed', 'Delivered'];
  serviceStatuses: ServiceStatus[] = ['Pending', 'In Progress', 'Completed', 'Delivered'];

  filtered = computed(() =>
    this.services.filter(s => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch = s.customerName.toLowerCase().includes(q) || s.vehicleNumber.toLowerCase().includes(q) || s.serviceType.toLowerCase().includes(q);
      const matchStatus = this.statusFilter() === 'All' || s.status === this.statusFilter();
      return matchSearch && matchStatus;
    })
  );

  constructor(private storage: StorageService) {}

  ngOnInit() {
    const u = this.storage.getUser();
    this.user.set(u);
    const all = this.storage.getServices().reverse();
    this.services = u?.role === 'User' ? all.filter(s => s.vehicleNumber === u.vehicleNumber) : all;
  }

  updateStatus(id: string, status: ServiceStatus) {
    const all = this.storage.getServices().map(s => s.id === id ? { ...s, status } : s);
    this.storage.saveServices(all);
    this.services = all.reverse();
  }

  statusClass(s: string) {
    return { 'badge-yellow': s === 'Pending', 'badge-blue': s === 'In Progress', 'badge-green': s === 'Completed' || s === 'Delivered' };
  }
}
