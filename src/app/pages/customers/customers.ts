import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Customer } from '../../models/types';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">Customer Registration</div>
      <div class="page-subtitle">Register a new customer and their vehicle details.</div>
    </div>

    <div class="reg-layout">
      <div class="reg-sidebar">
        <div class="sidebar-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        </div>
        <div>
          <div style="font-size:15px;font-weight:600;margin-bottom:6px">New Customer</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6">Enter the customer's personal and vehicle information to create a new record.</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
          @for (item of ['Instant record creation','Vehicle history tracking','Automatic service reminders']; track item) {
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,0.8)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ item }}
            </div>
          }
        </div>
      </div>

      <div class="card" style="flex:1">
        <div class="card-body">
          @if (isSuccess()) {
            <div class="alert-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Customer registered successfully!
            </div>
          }
          <form (ngSubmit)="handleSubmit()" #f="ngForm">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <div class="input-icon-wrap">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input class="form-control" required [(ngModel)]="form.name" name="name" placeholder="John Doe" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <div class="input-icon-wrap">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input class="form-control" type="email" required [(ngModel)]="form.email" name="email" placeholder="john@example.com" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <div class="input-icon-wrap">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <input class="form-control" required [(ngModel)]="form.phone" name="phone" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Vehicle Number</label>
                <div class="input-icon-wrap">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                  <input class="form-control" required [(ngModel)]="form.vehicleNumber" name="vehicleNumber" placeholder="ABC-1234" />
                </div>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">Vehicle Model</label>
                <div class="input-icon-wrap">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  <input class="form-control" required [(ngModel)]="form.vehicleModel" name="vehicleModel" placeholder="Toyota Camry 2022" />
                </div>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">Address</label>
                <textarea class="form-control" rows="3" [(ngModel)]="form.address" name="address" placeholder="Enter residential address..."></textarea>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()" style="width:100%;justify-content:center">
              @if (isSubmitting()) { <span class="spinner"></span> } @else {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Register Customer
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reg-layout { display: flex; gap: 20px; align-items: flex-start; }
    .reg-sidebar { width: 220px; flex-shrink: 0; background: #1d4ed8; border-radius: 8px; padding: 24px 20px; color: #fff; display: flex; flex-direction: column; gap: 16px; }
    .sidebar-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .sidebar-icon svg { width: 20px; height: 20px; }
    @media (max-width: 768px) { .reg-layout { flex-direction: column; } .reg-sidebar { width: 100%; } }
  `]
})
export class CustomersComponent {
  form = { name: '', email: '', phone: '', vehicleNumber: '', vehicleModel: '', address: '' };
  isSubmitting = signal(false);
  isSuccess = signal(false);

  constructor(private storage: StorageService) {}

  handleSubmit() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      const customer: Customer = { id: Date.now().toString(), ...this.form, registrationDate: new Date().toLocaleDateString() };
      const all = this.storage.getCustomers();
      this.storage.saveCustomers([...all, customer]);
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
      this.form = { name: '', email: '', phone: '', vehicleNumber: '', vehicleModel: '', address: '' };
      setTimeout(() => this.isSuccess.set(false), 3000);
    }, 800);
  }
}
