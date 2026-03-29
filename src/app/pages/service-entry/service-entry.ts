import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Customer, ServiceRecord } from '../../models/types';

const SERVICE_TYPES = ['Full Service','Oil Change','Brake Repair','Tire Rotation','Engine Diagnostics','Battery Replacement','Wheel Alignment','AC Service'];

@Component({
  selector: 'app-service-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">New Service Entry</div>
      <div class="page-subtitle">Record a new service session for an existing customer.</div>
    </div>

    <div class="entry-layout">
      <!-- Customer picker -->
      <div class="card" style="padding:16px">
        <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:12px">1. Select Customer</div>
        @if (!selectedCustomer()) {
          <div class="search-bar" style="margin-bottom:10px">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="form-control" [(ngModel)]="searchTerm" placeholder="Search customer..." />
          </div>
          <div style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:4px">
            @for (c of filteredCustomers(); track c.id) {
              <button class="customer-btn" (click)="selectedCustomer.set(c)">
                <div class="cust-avatar">{{ c.name.charAt(0) }}</div>
                <div><div style="font-size:13px;font-weight:500;color:#f9fafb">{{ c.name }}</div><div style="font-size:11px;color:#6b7280">{{ c.vehicleNumber }}</div></div>
              </button>
            }
            @if (filteredCustomers().length === 0) { <div class="empty-state" style="padding:20px">No customers found</div> }
          </div>
        } @else {
          <div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.2);border-radius:6px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="cust-avatar">{{ selectedCustomer()!.name.charAt(0) }}</div>
              <div><div style="font-size:13px;font-weight:500;color:#f9fafb">{{ selectedCustomer()!.name }}</div><div style="font-size:11px;color:#60a5fa">{{ selectedCustomer()!.vehicleNumber }}</div></div>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="selectedCustomer.set(null)">Change</button>
          </div>
        }
      </div>

      <!-- Form -->
      <div class="card card-body" [style.opacity]="selectedCustomer() ? 1 : 0.5" [style.pointer-events]="selectedCustomer() ? 'auto' : 'none'">
        <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:16px">2. Service Details</div>
        @if (isSuccess()) {
          <div class="alert-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Service record added successfully!
          </div>
        }
        <form (ngSubmit)="handleSubmit()">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Service Type</label>
              <select class="form-control" required [(ngModel)]="form.serviceType" name="serviceType">
                <option value="">Select type...</option>
                @for (t of serviceTypes; track t) { <option [value]="t">{{ t }}</option> }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Service Date</label>
              <input class="form-control" type="date" required [(ngModel)]="form.serviceDate" name="serviceDate" />
            </div>
            <div class="form-group">
              <label class="form-label">Cost (₹)</label>
              <input class="form-control" type="number" required [(ngModel)]="form.cost" name="cost" placeholder="0.00" />
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label class="form-label">Notes</label>
              <textarea class="form-control" rows="3" [(ngModel)]="form.notes" name="notes" placeholder="Any specific issues or requests..."></textarea>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="isSubmitting() || !selectedCustomer()" style="width:100%;justify-content:center">
            @if (isSubmitting()) { <span class="spinner"></span> } @else { Create Service Record }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .entry-layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; align-items: start; }
    @media (max-width: 900px) { .entry-layout { grid-template-columns: 1fr; } }
    .customer-btn { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #1f2937; border: 1px solid #374151; border-radius: 6px; cursor: pointer; text-align: left; width: 100%; transition: border-color 0.15s; }
    .customer-btn:hover { border-color: #4b5563; }
    .cust-avatar { width: 30px; height: 30px; border-radius: 50%; background: rgba(59,130,246,0.15); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #60a5fa; flex-shrink: 0; }
  `]
})
export class ServiceEntryComponent implements OnInit {
  customers: Customer[] = [];
  searchTerm = '';
  selectedCustomer = signal<Customer | null>(null);
  form = { serviceType: '', serviceDate: new Date().toISOString().split('T')[0], cost: '', notes: '' };
  isSubmitting = signal(false);
  isSuccess = signal(false);
  serviceTypes = SERVICE_TYPES;

  filteredCustomers = computed(() =>
    this.customers.filter(c =>
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.vehicleNumber.toLowerCase().includes(this.searchTerm.toLowerCase())
    )
  );

  constructor(private storage: StorageService) {}
  ngOnInit() { this.customers = this.storage.getCustomers(); }

  handleSubmit() {
    const cust = this.selectedCustomer();
    if (!cust) return;
    this.isSubmitting.set(true);
    setTimeout(() => {
      const rec: ServiceRecord = {
        id: Date.now().toString(), customerId: cust.id, customerName: cust.name,
        vehicleNumber: cust.vehicleNumber, serviceType: this.form.serviceType,
        serviceDate: this.form.serviceDate, cost: parseFloat(this.form.cost), status: 'Pending', notes: this.form.notes
      };
      this.storage.saveServices([...this.storage.getServices(), rec]);
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
      this.selectedCustomer.set(null);
      this.form = { serviceType: '', serviceDate: new Date().toISOString().split('T')[0], cost: '', notes: '' };
      setTimeout(() => this.isSuccess.set(false), 3000);
    }, 800);
  }
}
