import { Injectable } from '@angular/core';
import { UserProfile, Customer, ServiceRecord, BillingRecord } from '../models/types';

@Injectable({ providedIn: 'root' })
export class StorageService {
  getUser(): UserProfile | null {
    try { return JSON.parse(localStorage.getItem('vms_user') || 'null'); } catch { return null; }
  }
  setUser(u: UserProfile) { localStorage.setItem('vms_user', JSON.stringify(u)); }
  clearUser() { localStorage.removeItem('vms_user'); }

  getCustomers(): Customer[] {
    return JSON.parse(localStorage.getItem('vms_customers') || '[]');
  }
  saveCustomers(c: Customer[]) { localStorage.setItem('vms_customers', JSON.stringify(c)); }

  getServices(): ServiceRecord[] {
    return JSON.parse(localStorage.getItem('vms_services') || '[]');
  }
  saveServices(s: ServiceRecord[]) { localStorage.setItem('vms_services', JSON.stringify(s)); }

  getBills(): BillingRecord[] {
    return JSON.parse(localStorage.getItem('vms_bills') || '[]');
  }
  saveBills(b: BillingRecord[]) { localStorage.setItem('vms_bills', JSON.stringify(b)); }
}
