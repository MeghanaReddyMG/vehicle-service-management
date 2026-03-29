import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from '../services/storage.service';
import { UserProfile } from '../models/types';

interface NavItem { path: string; label: string; icon: string; }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
          <div>
            <div class="logo-name">VMS Garage</div>
            <div class="logo-role">{{ user()?.role }}</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          @for (item of navLinks(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.path === ''}"
               class="nav-link" (click)="sidebarOpen.set(false)">
              <span class="nav-icon" [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-name">{{ user()?.name }}</div>
            <div class="user-email">{{ user()?.email }}</div>
          </div>
          <button class="btn btn-secondary btn-sm" style="width:100%;justify-content:center" (click)="logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Overlay -->
      @if (sidebarOpen()) {
        <div class="overlay" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Main -->
      <div class="main-content">
        <header class="topbar">
          <button class="menu-btn" (click)="sidebarOpen.set(true)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span class="topbar-title">VMS Garage</span>
        </header>
        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: 220px; background: #111827; border-right: 1px solid #1f2937; display: flex; flex-direction: column; position: fixed; inset-y: 0; left: 0; z-index: 30; transition: transform 0.2s; }
    .sidebar-header { display: flex; align-items: center; gap: 10px; padding: 18px 16px; border-bottom: 1px solid #1f2937; }
    .logo-icon { width: 32px; height: 32px; background: #2563eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .logo-icon svg { width: 18px; height: 18px; color: #fff; }
    .logo-name { font-size: 13px; font-weight: 600; color: #f9fafb; }
    .logo-role { font-size: 11px; color: #6b7280; }
    .sidebar-nav { flex: 1; padding: 10px 10px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
    .nav-link { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; font-size: 13px; color: #9ca3af; text-decoration: none; transition: background 0.15s, color 0.15s; }
    .nav-link:hover { background: #1f2937; color: #e5e7eb; }
    .nav-link.active { background: #2563eb; color: #fff; }
    .nav-icon { width: 16px; height: 16px; flex-shrink: 0; display: flex; }
    .nav-icon svg { width: 16px; height: 16px; }
    .sidebar-footer { padding: 12px; border-top: 1px solid #1f2937; }
    .user-info { padding: 8px 4px 10px; }
    .user-name { font-size: 12px; font-weight: 500; color: #f9fafb; }
    .user-email { font-size: 11px; color: #6b7280; }
    .main-content { flex: 1; margin-left: 220px; display: flex; flex-direction: column; min-height: 100vh; }
    .topbar { display: none; align-items: center; gap: 12px; padding: 10px 16px; background: #111827; border-bottom: 1px solid #1f2937; position: sticky; top: 0; z-index: 20; }
    .topbar-title { font-size: 14px; font-weight: 600; color: #f9fafb; }
    .menu-btn { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; }
    .page-content { flex: 1; padding: 24px 28px; }
    .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 25; }
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .main-content { margin-left: 0; }
      .topbar { display: flex; }
      .overlay { display: block; }
      .page-content { padding: 16px; }
    }
  `]
})
export class LayoutComponent implements OnInit {
  user = signal<UserProfile | null>(null);
  sidebarOpen = signal(false);

  private adminLinks: NavItem[] = [
    { path: '', label: 'Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    { path: 'customers', label: 'Customers', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>' },
    { path: 'service-entry', label: 'Service Entry', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>' },
    { path: 'service-history', label: 'Service History', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
    { path: 'billing', label: 'Billing', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' },
    { path: 'my-bills', label: 'Invoices', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
    { path: 'cost-estimator', label: 'Cost Estimator', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>' },
    { path: 'predict', label: 'AI Predict', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
    { path: 'reminders', label: 'Reminders', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>' },
  ];

  private userLinks: NavItem[] = [
    { path: 'user-dashboard', label: 'My Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    { path: 'service-history', label: 'My History', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
    { path: 'my-bills', label: 'My Bills', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
    { path: 'reminders', label: 'Reminders', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>' },
    { path: 'predict', label: 'AI Predict', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  ];

  navLinks = signal<NavItem[]>([]);

  constructor(private storage: StorageService, private router: Router) {}

  ngOnInit() {
    const u = this.storage.getUser();
    this.user.set(u);
    this.navLinks.set(u?.role === 'Admin' ? this.adminLinks : this.userLinks);
  }

  logout() {
    this.storage.clearUser();
    this.router.navigate(['/login']);
  }
}
