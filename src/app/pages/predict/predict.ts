import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Customer, ServiceRecord, UserProfile } from '../../models/types';

@Component({
  selector: 'app-predict',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">AI Service Prediction</div>
      <div class="page-subtitle">Smart analysis of vehicle history to predict maintenance needs.</div>
    </div>

    <div class="predict-layout" [class.full-width]="user()?.role !== 'Admin'">
      @if (user()?.role === 'Admin') {
        <div class="card card-body">
          <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:12px">Select Vehicle</div>
          <div class="search-bar" style="margin-bottom:10px">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="form-control" [(ngModel)]="searchTerm" placeholder="Search vehicle..." />
          </div>
          <div style="max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:4px">
            @for (c of filteredCustomers(); track c.id) {
              <button class="customer-btn" [class.selected]="selectedCustomer()?.id === c.id" (click)="selectCustomer(c)">
                <div class="cust-av">{{ c.name.charAt(0) }}</div>
                <div><div style="font-size:13px;font-weight:500;color:#f9fafb">{{ c.name }}</div><div style="font-size:11px;color:#6b7280">{{ c.vehicleNumber }}</div></div>
              </button>
            }
          </div>
        </div>
      }

      <div>
        @if (selectedCustomer() && prediction()) {
          <div class="card" style="overflow:hidden">
            <div class="pred-header" [ngClass]="headerClass()">
              <div style="display:flex;align-items:center;gap:16px">
                <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.05em">Next Service Prediction</div>
                  <div style="font-size:22px;font-weight:700;margin-top:2px">{{ prediction().nextDate }}</div>
                  <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
                    <span style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500">{{ prediction().status }}</span>
                    <span style="font-size:11px;color:rgba(255,255,255,0.6)">Confidence: {{ prediction().confidence }}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
              <div style="background:#1f2937;border:1px solid #374151;border-radius:6px;padding:12px;font-size:13px;color:#d1d5db;line-height:1.6">{{ prediction().message }}</div>
              <div class="grid-3">
                <div class="stat-mini"><div style="font-size:11px;color:#6b7280;margin-bottom:4px">Last Service</div><div style="font-size:14px;font-weight:500;color:#f9fafb">{{ prediction().lastDate || 'N/A' }}</div></div>
                <div class="stat-mini"><div style="font-size:11px;color:#6b7280;margin-bottom:4px">Service Type</div><div style="font-size:14px;font-weight:500;color:#f9fafb">{{ prediction().lastType || 'N/A' }}</div></div>
                <div class="stat-mini"><div style="font-size:11px;color:#6b7280;margin-bottom:4px">Days Remaining</div><div style="font-size:14px;font-weight:500" [style.color]="prediction().daysRemaining < 0 ? '#f87171' : '#4ade80'">{{ prediction().daysRemaining < 0 ? 'Overdue by ' + (prediction().daysRemaining * -1) : prediction().daysRemaining }} days</div></div>
              </div>
              <div>
                <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:10px">Maintenance Recommendations</div>
                <div class="grid-2">
                  @for (r of recommendations; track r.title) {
                    <div style="padding:10px;border:1px solid #1f2937;border-radius:6px;display:flex;justify-content:space-between;align-items:center">
                      <div><div style="font-size:13px;font-weight:500;color:#f9fafb">{{ r.title }}</div><div style="font-size:11px;color:#6b7280">{{ r.desc }}</div></div>
                      <span style="font-size:11px;font-weight:500;color:#60a5fa">{{ r.status }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="empty-state card" style="padding:80px 20px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <p style="font-size:15px;font-weight:500;margin-bottom:4px">Select a vehicle to see AI predictions</p>
            <p style="font-size:13px">We'll analyze the service history to predict maintenance needs.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .predict-layout { display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }
    .predict-layout.full-width { grid-template-columns: 1fr; }
    @media (max-width: 900px) { .predict-layout { grid-template-columns: 1fr; } }
    .customer-btn { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #1f2937; border: 1px solid #374151; border-radius: 6px; cursor: pointer; text-align: left; width: 100%; transition: all 0.15s; }
    .customer-btn:hover { border-color: #4b5563; }
    .customer-btn.selected { background: #2563eb; border-color: #3b82f6; }
    .cust-av { width: 28px; height: 28px; border-radius: 50%; background: rgba(59,130,246,0.15); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #60a5fa; flex-shrink: 0; }
    .pred-header { padding: 24px; color: #fff; }
    .pred-header.healthy { background: #1d4ed8; }
    .pred-header.overdue { background: #b91c1c; }
    .pred-header.upcoming { background: #b45309; }
    .stat-mini { background: #1f2937; border: 1px solid #374151; border-radius: 6px; padding: 12px; }
  `]
})
export class PredictComponent implements OnInit {
  user = signal<UserProfile | null>(null);
  customers: Customer[] = [];
  services: ServiceRecord[] = [];
  searchTerm = '';
  selectedCustomer = signal<Customer | null>(null);
  prediction = signal<any>(null);
  filteredCustomers = computed(() => this.customers.filter(c => c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || c.vehicleNumber.toLowerCase().includes(this.searchTerm.toLowerCase())));
  headerClass = computed(() => ({ healthy: this.prediction()?.status === 'Healthy', overdue: this.prediction()?.status === 'Overdue', upcoming: this.prediction()?.status === 'Upcoming' }));
  recommendations = [
    { title: 'Engine Oil', desc: 'Check levels and viscosity', status: 'Recommended' },
    { title: 'Brake Pads', desc: 'Inspect for wear and tear', status: 'Recommended' },
    { title: 'Tire Pressure', desc: 'Maintain optimal PSI', status: 'Routine' },
    { title: 'Air Filter', desc: 'Replace if clogged', status: 'Routine' }
  ];

  constructor(private storage: StorageService) {}

  ngOnInit() {
    const u = this.storage.getUser();
    this.user.set(u);
    this.customers = this.storage.getCustomers();
    this.services = this.storage.getServices();
    if (u?.role === 'User') {
      const c = this.customers.find(x => x.vehicleNumber === u.vehicleNumber);
      if (c) { this.selectedCustomer.set(c); this.calcPrediction(c); }
    }
  }

  selectCustomer(c: Customer) { this.selectedCustomer.set(c); this.calcPrediction(c); }

  calcPrediction(customer: Customer) {
    const svc = this.services.filter(s => s.vehicleNumber === customer.vehicleNumber);
    if (!svc.length) { this.prediction.set({ status: 'No History', message: 'No service history found.', nextDate: 'ASAP', confidence: 0 }); return; }
    const last = [...svc].sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())[0];
    const nextDate = new Date(last.serviceDate); nextDate.setMonth(nextDate.getMonth() + 6);
    const diff = Math.ceil((nextDate.getTime() - Date.now()) / 86400000);
    const status = diff < 0 ? 'Overdue' : diff < 15 ? 'Upcoming' : 'Healthy';
    this.prediction.set({ status, message: diff < 0 ? `Overdue by ${Math.abs(diff)} days.` : `Next service in ${diff} days.`, nextDate: nextDate.toLocaleDateString(), lastDate: new Date(last.serviceDate).toLocaleDateString(), lastType: last.serviceType, confidence: 85, daysRemaining: diff });
  }
}
