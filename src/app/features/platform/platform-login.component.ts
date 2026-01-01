import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlatformAuthService } from '../../core/services/platform-auth.service';

@Component({
  selector: 'app-platform-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Platform Admin</h1>
          <p class="text-sm text-gray-500 mt-2">Accès réservé à l’administration</p>
        </div>

        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" [(ngModel)]="email" name="email" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" class="input" required />
          </div>
          <button type="submit" class="btn-primary w-full" [disabled]="loading()">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  `
})
export class PlatformLoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private platformAuthService: PlatformAuthService,
    private router: Router
  ) {}

  async onSubmit() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.platformAuthService.login({
        email: this.email,
        password: this.password
      });
      this.router.navigate(['/platform/tenants']);
    } catch {
      this.error.set('Identifiants invalides');
    } finally {
      this.loading.set(false);
    }
  }
}
