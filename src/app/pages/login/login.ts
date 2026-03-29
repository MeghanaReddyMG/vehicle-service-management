import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { UserRole } from '../../models/types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card card">
        <div class="card-body">
          <div class="login-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
          <h1 class="login-title">Vehicle Service Pro</h1>
          <p class="login-subtitle">Select your role to continue</p>

          <div class="role-selector">
            <button class="role-btn" [class.active]="role() === 'Admin'" (click)="selectAdmin()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Admin
            </button>
            <button class="role-btn" [class.active]="role() === 'User'" (click)="selectUser()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 10-16 0"/></svg>
              User
            </button>
          </div>

          <form (ngSubmit)="handleLogin()">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-icon-wrap">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input class="form-control" type="email" required [(ngModel)]="email" name="email" placeholder="name@company.com" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-icon-wrap">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input class="form-control" type="password" required [(ngModel)]="password" name="password" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:4px">
              Sign In as {{ role() }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>
        </div>
        <div class="login-footer">
          Demo: admin&#64;garage.com / password
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; background: #030712; }
    .login-card { width: 100%; max-width: 400px; }
    .login-logo { width: 48px; height: 48px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .login-logo svg { width: 26px; height: 26px; color: #fff; }
    .login-title { font-size: 20px; font-weight: 600; color: #f9fafb; text-align: center; margin-bottom: 4px; }
    .login-subtitle { font-size: 13px; color: #6b7280; text-align: center; margin-bottom: 20px; }
    .role-selector { display: flex; gap: 10px; margin-bottom: 20px; }
    .role-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; border-radius: 6px; border: 1px solid #374151; background: #1f2937; color: #9ca3af; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .role-btn svg { width: 20px; height: 20px; }
    .role-btn:hover { border-color: #4b5563; color: #e5e7eb; }
    .role-btn.active { border-color: #3b82f6; background: rgba(59,130,246,0.1); color: #60a5fa; }
    .login-footer { padding: 12px 20px; border-top: 1px solid #1f2937; text-align: center; font-size: 12px; color: #6b7280; }
  `]
})
export class LoginComponent {
  email = 'admin@garage.com';
  password = 'password';
  role = signal<UserRole>('Admin');

  constructor(private storage: StorageService, private router: Router) {}

  selectAdmin() { this.role.set('Admin'); this.email = 'admin@garage.com'; }
  selectUser() { this.role.set('User'); this.email = 'customer@example.com'; }

  handleLogin() {
    const r = this.role();
    this.storage.setUser({
      id: r === 'Admin' ? 'admin-1' : 'user-1',
      name: r === 'Admin' ? 'Admin User' : 'Customer User',
      email: this.email,
      role: r,
      vehicleNumber: r === 'User' ? 'ABC-1234' : undefined
    });
    this.router.navigate([r === 'Admin' ? '/' : '/user-dashboard']);
  }
}
