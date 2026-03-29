import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EstimateItem } from '../../models/types';

const SERVICE_PRICES: Record<string, number> = {
  'Full Service': 5000, 'Oil Change': 1500, 'Brake Repair': 2500, 'Tire Rotation': 1000,
  'Engine Diagnostics': 2000, 'Battery Replacement': 3500, 'Wheel Alignment': 1800, 'AC Service': 2200
};

@Component({
  selector: 'app-cost-estimator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="page-title">Service Cost Estimator</div>
      <div class="page-subtitle">Estimate service costs before generating a bill.</div>
    </div>

    <div class="estimator-layout">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-body">
          <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:12px">Standard Services</div>
          <div class="grid-4">
            @for (entry of servicePriceEntries; track entry[0]) {
              <button class="svc-btn" (click)="addItem(entry[0], entry[1], 'Service')">
                <div style="font-size:12px;color:#d1d5db">{{ entry[0] }}</div>
                <div style="font-size:12px;font-weight:600;color:#60a5fa;margin-top:4px">₹{{ entry[1] }}</div>
              </button>
            }
          </div>
        </div>

        <div class="card card-body">
          <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:12px">Add Parts & Labor</div>
          <form (ngSubmit)="addCustom()" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;align-items:end">
            <div class="form-group" style="margin:0"><input class="form-control" [(ngModel)]="customName" name="cn" placeholder="Item description..." /></div>
            <div class="form-group" style="margin:0"><input class="form-control" type="number" [(ngModel)]="customPrice" name="cp" placeholder="Price (₹)" /></div>
            <div class="form-group" style="margin:0">
              <select class="form-control" [(ngModel)]="customCategory" name="cc">
                <option value="Parts">Parts</option><option value="Labor">Labor</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </form>
        </div>

        <div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.15);border-radius:6px;padding:12px;font-size:12px;color:#93c5fd;line-height:1.6">
          Estimates are based on standard rates. Actual costs may vary depending on vehicle condition and specific parts required.
        </div>
      </div>

      <!-- Summary -->
      <div class="card" style="position:sticky;top:20px">
        <div class="card-header" style="font-size:13px;font-weight:500;color:#f9fafb">Estimation Summary</div>
        <div class="card-body">
          @if (items().length === 0) {
            <div class="empty-state" style="padding:32px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
              <p>Add items to see estimate</p>
            </div>
          }
          <div style="display:flex;flex-direction:column;gap:6px;max-height:320px;overflow-y:auto;margin-bottom:12px">
            @for (item of items(); track item.id) {
              <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1f2937">
                <div>
                  <div style="font-size:13px;color:#f9fafb">{{ item.description }}</div>
                  <div style="font-size:11px;color:#6b7280">{{ item.category }}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:13px;font-weight:500;color:#f9fafb">₹{{ item.price }}</span>
                  <button style="background:none;border:none;color:#6b7280;cursor:pointer" (click)="removeItem(item.id)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>
          <div style="border-top:1px solid #1f2937;padding-top:10px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#9ca3af"><span>Subtotal</span><span>₹{{ total() }}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:600;color:#f9fafb;padding-top:6px;border-top:1px solid #374151"><span>Estimated Total</span><span style="color:#60a5fa">₹{{ total() }}</span></div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:14px" [disabled]="items().length === 0">Proceed to Billing</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .estimator-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
    @media (max-width: 900px) { .estimator-layout { grid-template-columns: 1fr; } }
    .svc-btn { padding: 10px 8px; background: #1f2937; border: 1px solid #374151; border-radius: 6px; cursor: pointer; text-align: center; transition: border-color 0.15s; }
    .svc-btn:hover { border-color: #4b5563; }
  `]
})
export class CostEstimatorComponent {
  items = signal<EstimateItem[]>([]);
  customName = ''; customPrice = ''; customCategory: 'Parts' | 'Labor' = 'Parts';
  servicePriceEntries = Object.entries(SERVICE_PRICES);
  total = computed(() => this.items().reduce((s, i) => s + i.price, 0));

  addItem(desc: string, price: number, cat: 'Parts' | 'Labor' | 'Service') {
    this.items.update(arr => [...arr, { id: Date.now().toString(), description: desc, price, category: cat }]);
  }
  addCustom() {
    if (!this.customName || !this.customPrice) return;
    this.addItem(this.customName, parseFloat(this.customPrice), this.customCategory);
    this.customName = ''; this.customPrice = '';
  }
  removeItem(id: string) { this.items.update(arr => arr.filter(i => i.id !== id)); }
}
