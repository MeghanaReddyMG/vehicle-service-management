import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Reminder, UserProfile } from '../../models/types';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="page-title">Service Reminders</div>
      <div class="page-subtitle">Stay on top of your vehicle maintenance schedule.</div>
    </div>

    <div class="grid-3" style="margin-bottom:20px">
      <div class="card card-body" style="display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;background:rgba(239,68,68,0.1);border-radius:6px;display:flex;align-items:center;justify-content:center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Overdue</div><div style="font-size:20px;font-weight:600;color:#f9fafb">{{ overdueCount() }}</div></div>
      </div>
      <div class="card card-body" style="display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;background:rgba(234,179,8,0.1);border-radius:6px;display:flex;align-items:center;justify-content:center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Due Soon</div><div style="font-size:20px;font-weight:600;color:#f9fafb">{{ dueSoonCount() }}</div></div>
      </div>
      <div class="card card-body" style="display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;background:rgba(34,197,94,0.1);border-radius:6px;display:flex;align-items:center;justify-content:center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Healthy</div><div style="font-size:20px;font-weight:600;color:#f9fafb">{{ healthyCount() }}</div></div>
      </div>
    </div>

    @if (reminders().length === 0) {
      <div class="empty-state card" style="padding:48px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <p style="font-size:15px;font-weight:500;margin-bottom:4px">No reminders</p>
        <p style="font-size:13px">Add service records to generate reminders.</p>
      </div>
    }

    <div style="display:flex;flex-direction:column;gap:10px">
      @for (r of reminders(); track r.id) {
        <div class="card card-body reminder-card" [class.overdue]="r.overdue">
          <div style="display:flex;align-items:center;gap:14px;flex:1">
            <div class="rem-icon" [class.overdue]="r.overdue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
                <span style="font-size:14px;font-weight:600;color:#f9fafb">{{ r.vehicleNumber }}</span>
                <span class="badge" [ngClass]="priorityClass(r.priority)">{{ r.priority }}</span>
              </div>
              <div style="font-size:12px;color:#9ca3af">Last: {{ r.serviceType }}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:2px">Due: {{ r.dueDate }}</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
            <div style="font-size:16px;font-weight:700" [style.color]="r.overdue ? '#f87171' : '#f9fafb'">
              {{ r.overdue ? (r.daysRemaining * -1) + ' days overdue' : r.daysRemaining + ' days left' }}
            </div>
            <button class="btn btn-sm" [class.btn-danger]="r.overdue" [class.btn-primary]="!r.overdue">Schedule Service</button>
          </div>
        </div>
      }
    </div>

    <div class="card card-body" style="margin-top:20px;display:flex;gap:12px;align-items:flex-start">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div>
        <div style="font-size:13px;font-weight:500;color:#f9fafb;margin-bottom:4px">Why regular service matters?</div>
        <div style="font-size:12px;color:#9ca3af;line-height:1.6">Regular vehicle maintenance ensures safety, improves fuel efficiency, and extends the lifespan of your vehicle. We recommend a full service every 6 months or 10,000 km.</div>
      </div>
    </div>
  `,
  styles: [`
    .reminder-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .reminder-card.overdue { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.03); }
    .rem-icon { width: 44px; height: 44px; border-radius: 6px; background: rgba(59,130,246,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #60a5fa; }
    .rem-icon.overdue { background: rgba(239,68,68,0.1); color: #f87171; }
    @media (max-width: 600px) { .reminder-card { flex-direction: column; align-items: flex-start; } }
  `]
})
export class RemindersComponent implements OnInit {
  reminders = signal<Reminder[]>([]);
  overdueCount = signal(0); dueSoonCount = signal(0); healthyCount = signal(0);

  constructor(private storage: StorageService) {}

  ngOnInit() {
    const u = this.storage.getUser();
    const services = this.storage.getServices().filter(s => u?.role === 'Admin' ? true : s.vehicleNumber === u?.vehicleNumber);
    const lastByVehicle: Record<string, typeof services[0]> = {};
    services.forEach(s => { if (!lastByVehicle[s.vehicleNumber] || new Date(s.serviceDate) > new Date(lastByVehicle[s.vehicleNumber].serviceDate)) lastByVehicle[s.vehicleNumber] = s; });
    const list: Reminder[] = Object.values(lastByVehicle).map(s => {
      const due = new Date(s.serviceDate); due.setMonth(due.getMonth() + 6);
      const diff = Math.ceil((due.getTime() - Date.now()) / 86400000);
      return { id: `REM-${s.id}`, vehicleNumber: s.vehicleNumber, serviceType: s.serviceType, dueDate: due.toLocaleDateString(), daysRemaining: diff, overdue: diff < 0, priority: (diff < 0 ? 'High' : diff < 15 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low' };
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);
    this.reminders.set(list);
    this.overdueCount.set(list.filter(r => r.overdue).length);
    this.dueSoonCount.set(list.filter(r => !r.overdue && r.daysRemaining < 15).length);
    this.healthyCount.set(list.filter(r => r.daysRemaining >= 15).length);
  }

  priorityClass(p: string) { return { 'badge-red': p === 'High', 'badge-yellow': p === 'Medium', 'badge-green': p === 'Low' }; }
}
