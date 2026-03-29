import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Customer, BillingItem } from '../../models/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SERVICE_PRICES: Record<string, number> = {
  'Full Service': 5000, 'Oil Change': 1500, 'Brake Repair': 2500, 'Tire Rotation': 1000,
  'Engine Diagnostics': 2000, 'Battery Replacement': 3500, 'Wheel Alignment': 1800, 'AC Service': 2200
};

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">Billing & Invoicing</div>
      <div class="page-subtitle">Generate professional invoices and track payments.</div>
    </div>

    <div class="billing-layout">
      <div style="display:flex;flex-direction:column;gap:16px">
        <!-- Customer -->
        <div class="card card-body">
          <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:12px">1. Select Customer</div>
          @if (!selectedCustomer()) {
            <div class="search-bar" style="margin-bottom:10px">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input class="form-control" [(ngModel)]="searchTerm" placeholder="Search customer..." />
            </div>
            <div style="max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:4px">
              @for (c of filteredCustomers(); track c.id) {
                <button class="customer-btn" (click)="selectedCustomer.set(c)">
                  <div class="cust-av">{{ c.name.charAt(0) }}</div>
                  <div><div style="font-size:13px;font-weight:500;color:#f9fafb">{{ c.name }}</div><div style="font-size:11px;color:#6b7280">{{ c.vehicleNumber }}</div></div>
                </button>
              }
              @if (filteredCustomers().length === 0) { <div class="empty-state" style="padding:16px">No customers found</div> }
            </div>
          } @else {
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.2);border-radius:6px">
              <div style="display:flex;align-items:center;gap:10px">
                <div class="cust-av">{{ selectedCustomer()!.name.charAt(0) }}</div>
                <div><div style="font-size:13px;font-weight:500;color:#f9fafb">{{ selectedCustomer()!.name }}</div><div style="font-size:11px;color:#60a5fa">{{ selectedCustomer()!.vehicleNumber }}</div></div>
              </div>
              <button class="btn btn-secondary btn-sm" (click)="selectedCustomer.set(null)">Change</button>
            </div>
          }
        </div>

        <!-- Items -->
        <div class="card card-body" [style.opacity]="selectedCustomer() ? 1 : 0.5" [style.pointer-events]="selectedCustomer() ? 'auto' : 'none'">
          <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:12px">2. Add Service Items</div>
          <div class="grid-4" style="margin-bottom:12px">
            @for (entry of servicePriceEntries; track entry[0]) {
              <button class="svc-btn" (click)="addService(entry[0])">
                <div style="font-size:12px;color:#d1d5db">{{ entry[0] }}</div>
                <div style="font-size:12px;font-weight:600;color:#60a5fa">₹{{ entry[1] }}</div>
              </button>
            }
          </div>
          <form (ngSubmit)="addCustomItem()" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;align-items:end">
            <div class="form-group" style="margin:0"><input class="form-control" [(ngModel)]="newName" name="newName" placeholder="Item name..." /></div>
            <div class="form-group" style="margin:0"><input class="form-control" type="number" [(ngModel)]="newPrice" name="newPrice" placeholder="Price" /></div>
            <div class="form-group" style="margin:0">
              <select class="form-control" [(ngModel)]="newCategory" name="newCategory">
                <option value="Parts">Parts</option><option value="Labor">Labor</option><option value="Service">Service</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">Add</button>
          </form>
        </div>
      </div>

      <!-- Summary -->
      <div class="card" [style.opacity]="selectedCustomer() ? 1 : 0.5" [style.pointer-events]="selectedCustomer() ? 'auto' : 'none'" style="position:sticky;top:20px">
        <div class="card-header" style="font-size:13px;font-weight:500;color:#f9fafb">Invoice Summary</div>
        <div class="card-body">
          @if (items().length === 0) { <div class="empty-state" style="padding:24px">No items added yet</div> }
          <div style="display:flex;flex-direction:column;gap:8px;max-height:280px;overflow-y:auto;margin-bottom:12px">
            @for (item of items(); track item.id) {
              <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1f2937">
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;color:#f9fafb">{{ item.description }}</div>
                  <div style="font-size:11px;color:#6b7280">{{ item.category }} · Qty {{ item.quantity }}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;margin-left:10px">
                  <span style="font-size:13px;font-weight:500;color:#f9fafb">₹{{ item.total }}</span>
                  <button style="background:none;border:none;color:#6b7280;cursor:pointer;padding:2px" (click)="removeItem(item.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>
          <div style="border-top:1px solid #1f2937;padding-top:10px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#9ca3af"><span>Subtotal</span><span>₹{{ total() }}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#9ca3af"><span>Tax (0%)</span><span>₹0</span></div>
            <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:600;color:#f9fafb;padding-top:6px;border-top:1px solid #374151"><span>Total</span><span style="color:#60a5fa">₹{{ total() }}</span></div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:14px" [disabled]="items().length === 0" (click)="saveAndComplete()">
            Save & Generate Invoice
          </button>
          <p style="font-size:11px;color:#6b7280;text-align:center;margin-top:8px">Saves the bill and generates a PDF invoice.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .billing-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
    @media (max-width: 900px) { .billing-layout { grid-template-columns: 1fr; } }
    .customer-btn { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #1f2937; border: 1px solid #374151; border-radius: 6px; cursor: pointer; text-align: left; width: 100%; transition: border-color 0.15s; }
    .customer-btn:hover { border-color: #4b5563; }
    .cust-av { width: 28px; height: 28px; border-radius: 50%; background: rgba(59,130,246,0.15); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #60a5fa; flex-shrink: 0; }
    .svc-btn { padding: 10px 8px; background: #1f2937; border: 1px solid #374151; border-radius: 6px; cursor: pointer; text-align: center; transition: border-color 0.15s; }
    .svc-btn:hover { border-color: #4b5563; }
  `]
})
export class BillingComponent implements OnInit {
  customers: Customer[] = [];
  searchTerm = '';
  selectedCustomer = signal<Customer | null>(null);
  items = signal<BillingItem[]>([]);
  newName = ''; newPrice = ''; newCategory: 'Parts' | 'Labor' | 'Service' = 'Parts';
  servicePriceEntries = Object.entries(SERVICE_PRICES);
  total = computed(() => this.items().reduce((s, i) => s + i.total, 0));
  filteredCustomers = computed(() => this.customers.filter(c => c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || c.vehicleNumber.toLowerCase().includes(this.searchTerm.toLowerCase())));

  constructor(private storage: StorageService) {}
  ngOnInit() { this.customers = this.storage.getCustomers(); }

  addService(name: string) {
    const price = SERVICE_PRICES[name];
    this.items.update(arr => [...arr, { id: Date.now().toString(), description: name, quantity: 1, price, total: price, category: 'Service' }]);
  }

  addCustomItem() {
    if (!this.newName || !this.newPrice) return;
    const price = parseFloat(this.newPrice);
    this.items.update(arr => [...arr, { id: Date.now().toString(), description: this.newName, quantity: 1, price, total: price, category: this.newCategory }]);
    this.newName = ''; this.newPrice = '';
  }

  removeItem(id: string) { this.items.update(arr => arr.filter(i => i.id !== id)); }

  saveAndComplete() {
    const cust = this.selectedCustomer();
    if (!cust || this.items().length === 0) return;
    const record = { id: `BILL-${Date.now()}`, customerId: cust.id, customerName: cust.name, vehicleNumber: cust.vehicleNumber, date: new Date().toLocaleDateString(), items: this.items(), total: this.total(), status: 'Paid' };
    this.storage.saveBills([...this.storage.getBills(), record]);
    this.generatePDF(record);
    this.selectedCustomer.set(null); this.items.set([]); this.searchTerm = '';
  }

  generatePDF(data: any) {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('VEHICLE SERVICE INVOICE', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('VMS Garage Services', 20, 35); doc.text('123 Auto Lane, Tech City', 20, 40);
    doc.text(`Invoice Date: ${data.date}`, 140, 35); doc.text(`Invoice No: ${data.id}`, 140, 40);
    doc.setFontSize(11); doc.text('Bill To:', 20, 55);
    doc.setFontSize(10); doc.text(`Customer: ${data.customerName}`, 20, 62); doc.text(`Vehicle: ${data.vehicleNumber}`, 20, 68);
    (doc as any).autoTable({ startY: 76, head: [['Description', 'Category', 'Qty', 'Price', 'Total']], body: data.items.map((i: any) => [i.description, i.category, i.quantity, `₹${i.price}`, `₹${i.total}`]), theme: 'striped', headStyles: { fillColor: [37, 99, 235] }, margin: { left: 20, right: 20 } });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13); doc.text(`Total: ₹${data.total.toLocaleString()}`, 140, y);
    doc.setFontSize(10); doc.setTextColor(120, 120, 120); doc.text('Thank you for your business!', 105, y + 25, { align: 'center' });
    doc.save(`Invoice_${data.vehicleNumber}_${data.date}.pdf`);
  }
}
