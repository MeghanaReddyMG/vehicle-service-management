import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { BillingRecord, UserProfile } from '../../models/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-my-bills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">{{ user()?.role === 'Admin' ? 'All Invoices' : 'My Invoices' }}</div>
      <div class="page-subtitle">{{ user()?.role === 'Admin' ? 'Manage all generated invoices.' : 'Your billing history.' }}</div>
    </div>

    <div class="card" style="margin-bottom:16px;padding:14px">
      <div class="search-bar">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="form-control" [(ngModel)]="searchTerm" placeholder="Search by invoice ID or date..." />
      </div>
    </div>

    @if (filtered().length === 0) {
      <div class="empty-state card" style="padding:48px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p style="font-size:15px;font-weight:500;margin-bottom:4px">No invoices found</p>
        <p style="font-size:13px">No invoices have been generated yet.</p>
      </div>
    }

    <div class="grid-2">
      @for (bill of filtered(); track bill.id) {
        <div class="card">
          <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:8px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span style="font-size:13px;font-weight:500;color:#f9fafb">{{ bill.id }}</span>
            </div>
            <span class="badge badge-green">{{ bill.status }}</span>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <div style="font-size:13px;font-weight:500;color:#f9fafb">{{ bill.customerName }}</div>
                <div style="font-size:12px;color:#9ca3af">{{ bill.vehicleNumber }}</div>
              </div>
              <div style="font-size:12px;color:#6b7280">{{ bill.date }}</div>
            </div>
            <div style="background:#1f2937;border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px">
              <div style="display:flex;justify-content:space-between;font-size:12px;color:#9ca3af"><span>Items</span><span>{{ bill.items.length }} services</span></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:500;color:#f9fafb;padding-top:6px;border-top:1px solid #374151"><span>Total</span><span style="color:#60a5fa">₹{{ bill.total.toLocaleString() }}</span></div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" style="flex:1;justify-content:center" (click)="downloadPDF(bill)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MyBillsComponent implements OnInit {
  user = signal<UserProfile | null>(null);
  bills: BillingRecord[] = [];
  searchTerm = '';
  filtered = computed(() => this.bills.filter(b => b.id.toLowerCase().includes(this.searchTerm.toLowerCase()) || b.date.includes(this.searchTerm)));

  constructor(private storage: StorageService) {}

  ngOnInit() {
    const u = this.storage.getUser();
    this.user.set(u);
    const all = this.storage.getBills().reverse();
    this.bills = u?.role === 'User' ? all.filter(b => b.vehicleNumber === u.vehicleNumber) : all;
  }

  downloadPDF(bill: BillingRecord) {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('VEHICLE SERVICE INVOICE', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('VMS Garage Services', 20, 35); doc.text('123 Auto Lane, Tech City', 20, 40);
    doc.text(`Invoice Date: ${bill.date}`, 140, 35); doc.text(`Invoice No: ${bill.id}`, 140, 40);
    doc.setFontSize(11); doc.text('Bill To:', 20, 55);
    doc.setFontSize(10); doc.text(`Customer: ${bill.customerName}`, 20, 62); doc.text(`Vehicle: ${bill.vehicleNumber}`, 20, 68);
    (doc as any).autoTable({ startY: 76, head: [['Description', 'Qty', 'Price', 'Total']], body: bill.items.map((i: any) => [i.description, i.quantity, `₹${i.price}`, `₹${i.total}`]), theme: 'striped', headStyles: { fillColor: [37, 99, 235] }, margin: { left: 20, right: 20 } });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13); doc.text(`Total: ₹${bill.total.toLocaleString()}`, 140, y);
    doc.save(`Invoice_${bill.vehicleNumber}_${bill.date}.pdf`);
  }
}
