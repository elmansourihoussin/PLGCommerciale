import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlatformTenantService } from '../../core/services/platform-tenant.service';

@Component({
  selector: 'app-platform-tenant-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Créer une entreprise</h1>
        <p class="text-sm text-gray-500 mt-1">Création d’un tenant sans utilisateur</p>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="card space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
          <input type="text" [(ngModel)]="name" name="name" class="input" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" [(ngModel)]="email" name="email" class="input" />
        </div>
        <div class="flex justify-end gap-3">
          <button type="button" class="btn-secondary" (click)="cancel()">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="loading()">Créer</button>
        </div>
      </form>
    </div>
  `
})
export class PlatformTenantCreateComponent {
  name = '';
  email = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private platformTenantService: PlatformTenantService,
    private router: Router
  ) {}

  async onSubmit() {
    this.loading.set(true);
    this.error.set('');
    try {
      const tenant = await this.platformTenantService.create({
        name: this.name,
        email: this.email || undefined
      });
      this.router.navigate(['/platform/tenants', tenant.id]);
    } catch {
      this.error.set('Impossible de créer l’entreprise');
    } finally {
      this.loading.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/platform/tenants']);
  }
}
