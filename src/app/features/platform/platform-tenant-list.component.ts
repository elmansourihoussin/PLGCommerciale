import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PlatformTenantService } from '../../core/services/platform-tenant.service';
import { PlatformTenant } from '../../core/models/platform-tenant.model';

@Component({
  selector: 'app-platform-tenant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Entreprises</h1>
          <p class="text-sm text-gray-500 mt-1">Gestion globale des tenants</p>
        </div>
        <a routerLink="/platform/tenants/new" class="btn-primary mt-4 sm:mt-0">Créer une entreprise</a>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="card">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            placeholder="Rechercher par nom ou email..."
            class="input flex-1"
          />
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Plan</th>
                <th>Subscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                <tr>
                  <td colspan="6" class="text-center text-gray-500 py-8">Chargement...</td>
                </tr>
              } @else {
                @for (tenant of tenants(); track tenant.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="font-medium">{{ tenant.name }}</td>
                    <td>{{ tenant.email || '—' }}</td>
                    <td>
                      <span [class]="tenant.isActive ? 'badge-success' : 'badge-danger'">
                        {{ tenant.isActive ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td>{{ tenant.subscription?.plan || '—' }}</td>
                    <td>{{ tenant.subscription?.status || '—' }}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <a [routerLink]="['/platform/tenants', tenant.id]" class="text-primary-600 hover:text-primary-700 text-sm">
                          Détails
                        </a>
                        <button class="text-xs text-gray-600 hover:text-gray-900" (click)="toggleStatus(tenant)">
                          {{ tenant.isActive ? 'Désactiver' : 'Activer' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center text-gray-500 py-8">Aucune entreprise</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between pt-4">
          <p class="text-sm text-gray-600">
            Page {{ page() }} sur {{ totalPages() }}
          </p>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              class="btn-secondary"
              [disabled]="page() <= 1 || loading()"
              (click)="goToPage(page() - 1)"
            >
              Précédent
            </button>
            <button
              type="button"
              class="btn-secondary"
              [disabled]="page() >= totalPages() || loading()"
              (click)="goToPage(page() + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PlatformTenantListComponent implements OnInit {
  tenants = this.platformTenantService.tenants;
  loading = signal(false);
  error = signal('');
  searchTerm = signal('');
  page = signal(1);
  pageSize = signal(10);

  constructor(private platformTenantService: PlatformTenantService) {}

  async ngOnInit() {
    await this.loadTenants();
  }

  async loadTenants() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.platformTenantService.list({
        search: this.searchTerm() || undefined,
        page: this.page(),
        limit: this.pageSize()
      });
    } catch {
      this.error.set('Impossible de charger les entreprises');
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange() {
    this.page.set(1);
    this.loadTenants();
  }

  async goToPage(page: number) {
    if (page < 1) return;
    this.page.set(page);
    await this.loadTenants();
  }

  async toggleStatus(tenant: PlatformTenant) {
    try {
      await this.platformTenantService.updateStatus(tenant.id, !tenant.isActive);
      await this.loadTenants();
    } catch {
      this.error.set('Impossible de modifier le statut');
    }
  }

  totalPages = computed(() => {
    const total = this.platformTenantService.totalCount();
    const size = this.pageSize();
    if (!total || size <= 0) return 1;
    return Math.max(1, Math.ceil(total / size));
  });
}
