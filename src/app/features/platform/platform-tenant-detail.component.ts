import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PlatformTenantService } from '../../core/services/platform-tenant.service';
import { PlatformTenant, PlatformTenantHistoryEntry } from '../../core/models/platform-tenant.model';

@Component({
  selector: 'app-platform-tenant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Détails entreprise</h1>
          <p class="text-sm text-gray-500 mt-1">{{ tenant()?.name || '—' }}</p>
        </div>
        <button class="btn-secondary mt-4 sm:mt-0" (click)="toggleStatus()" [disabled]="loading() || !tenant()">
          {{ tenant()?.isActive ? 'Désactiver' : 'Activer' }}
        </button>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="card lg:col-span-2">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p class="text-xs text-gray-400">Nom</p>
              <p class="font-medium">{{ tenant()?.name || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Email</p>
              <p class="font-medium">{{ tenant()?.email || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Statut</p>
              <p class="font-medium">{{ tenant()?.isActive ? 'Actif' : 'Inactif' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Création</p>
              <p class="font-medium">{{ formatDate(tenant()?.createdAt) }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Abonnement</h2>
          <form #subscriptionForm="ngForm" (ngSubmit)="updateSubscription(subscriptionForm)" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <input type="text" [(ngModel)]="subscriptionPlan" class="input" placeholder="PRO" required #planRef="ngModel" />
              @if (planRef.invalid && planRef.touched) {
                <p class="text-xs text-red-600 mt-1">Champ obligatoire</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <input type="text" [(ngModel)]="subscriptionStatus" class="input" placeholder="ACTIVE" required #statusRef="ngModel" />
              @if (statusRef.invalid && statusRef.touched) {
                <p class="text-xs text-red-600 mt-1">Champ obligatoire</p>
              }
            </div>
            <button type="submit" class="btn-primary w-full" [disabled]="loading() || !isSubscriptionFormValid()">
              Mettre à jour
            </button>
          </form>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Historique abonnement</h2>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Statut</th>
                <th>Action</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (historyLoading()) {
                <tr>
                  <td colspan="5" class="text-center text-gray-500 py-8">Chargement...</td>
                </tr>
              } @else {
                @for (entry of history(); track entry.id) {
                  <tr>
                    <td>{{ formatDate(entry.createdAt) }}</td>
                    <td>{{ entry.plan || '—' }}</td>
                    <td>{{ entry.status || '—' }}</td>
                    <td>{{ entry.action || '—' }}</td>
                    <td>{{ entry.note || '—' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center text-gray-500 py-8">Aucun historique</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PlatformTenantDetailComponent implements OnInit {
  tenant = signal<PlatformTenant | null>(null);
  history = signal<PlatformTenantHistoryEntry[]>([]);
  loading = signal(false);
  historyLoading = signal(false);
  error = signal('');
  subscriptionPlan = '';
  subscriptionStatus = '';

  constructor(
    private platformTenantService: PlatformTenantService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    await this.loadTenant();
    await this.loadHistory();
  }

  async loadTenant() {
    this.loading.set(true);
    this.error.set('');
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;
      const tenant = await this.platformTenantService.getById(id);
      this.tenant.set(tenant);
      this.subscriptionPlan = tenant.subscription?.plan ?? '';
      this.subscriptionStatus = tenant.subscription?.status ?? '';
    } catch {
      this.error.set('Impossible de charger l’entreprise');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus() {
    const tenant = this.tenant();
    if (!tenant) return;
    this.loading.set(true);
    try {
      const updated = await this.platformTenantService.updateStatus(tenant.id, !tenant.isActive);
      this.tenant.set(updated);
    } catch {
      this.error.set('Impossible de modifier le statut');
    } finally {
      this.loading.set(false);
    }
  }

  async updateSubscription(form?: NgForm) {
    const tenant = this.tenant();
    if (!tenant) return;
    if (form?.invalid) {
      form.form.markAllAsTouched();
      this.error.set('Veuillez remplir tous les champs obligatoires');
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.loading.set(true);
    try {
      const updated = await this.platformTenantService.updateSubscription(tenant.id, {
        plan: this.subscriptionPlan || undefined,
        status: this.subscriptionStatus || undefined
      });
      this.tenant.set(updated);
      await this.loadHistory();
    } catch {
      this.error.set('Impossible de mettre à jour l’abonnement');
    } finally {
      this.loading.set(false);
    }
  }

  async loadHistory() {
    const tenant = this.tenant();
    if (!tenant) return;
    this.historyLoading.set(true);
    try {
      const response = await this.platformTenantService.getBillingHistory(tenant.id, {
        page: 1,
        limit: 20
      });
      this.history.set(response.entries);
    } catch {
      this.error.set('Impossible de charger l’historique');
    } finally {
      this.historyLoading.set(false);
    }
  }

  formatDate(date?: Date): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  isSubscriptionFormValid(): boolean {
    return Boolean(this.subscriptionPlan?.trim()) && Boolean(this.subscriptionStatus?.trim());
  }
}
