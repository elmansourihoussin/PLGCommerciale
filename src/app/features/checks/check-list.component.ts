import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckService } from '../../core/services/check.service';
import { ClientService } from '../../core/services/client.service';
import { CheckStatus } from '../../core/models/check.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-check-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Chèques</h1>
        <a routerLink="/checks/new" class="mt-4 sm:mt-0 btn-primary">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau chèque
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card">
          <p class="text-sm text-gray-600">En attente</p>
          <p class="mt-2 text-2xl font-bold text-orange-600">{{ statusCounts().PENDING }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">Encaissés</p>
          <p class="mt-2 text-2xl font-bold text-green-600">{{ statusCounts().CASHED }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">Annulés</p>
          <p class="mt-2 text-2xl font-bold text-red-600">{{ statusCounts().CANCELLED }}</p>
        </div>
      </div>

      <div class="card">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" class="input sm:w-48">
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CASHED">Encaissé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
          <select [(ngModel)]="filterClientId" (ngModelChange)="onFilterChange()" class="input sm:w-64">
            <option value="">Tous les clients</option>
            @for (client of clients(); track client.id) {
              <option [value]="client.id">{{ client.name }}</option>
            }
          </select>
        </div>

        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ error() }}
          </div>
        }

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Échéance</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                <tr>
                  <td colspan="5" class="text-center text-gray-500 py-8">Chargement...</td>
                </tr>
              } @else {
                @for (check of checks(); track check.id) {
                <tr class="hover:bg-gray-50">
                  <td>{{ getClientName(check.clientId, check.clientName) }}</td>
                  <td>{{ formatDate(check.dueDate) }}</td>
                  <td class="font-semibold">{{ check.amount.toLocaleString() }} MAD</td>
                  <td>
                    <span [class]="getStatusBadgeClass(check.status)">
                      {{ getStatusLabel(check.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center space-x-3">
                      <a [routerLink]="['/checks', check.id, 'edit']" class="text-gray-600 hover:text-gray-900">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </a>
                      <button (click)="deleteCheck(check.id)" class="text-red-600 hover:text-red-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                  <tr>
                    <td colspan="5" class="text-center text-gray-500 py-8">
                      Aucun chèque trouvé
                    </td>
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

      <app-confirm-dialog
        [open]="showDeleteModal()"
        title="Supprimer le chèque"
        message="Cette action est définitive."
        [busy]="loading()"
        (cancel)="closeDeleteModal()"
        (confirm)="confirmDelete()"
      />
    </div>
  `
})
export class CheckListComponent implements OnInit {
  checks = this.checkService.checks;
  clients = this.clientService.clients;
  loading = signal(false);
  error = signal('');
  filterStatus = signal<CheckStatus | ''>('');
  filterClientId = signal('');
  page = signal(1);
  pageSize = signal(10);
  showDeleteModal = signal(false);
  pendingDeleteId = signal<string | null>(null);
  statusCounts = signal<Record<CheckStatus, number>>({
    PENDING: 0,
    CASHED: 0,
    CANCELLED: 0
  });

  constructor(
    private checkService: CheckService,
    private clientService: ClientService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.clientService.list(),
      this.loadChecks(),
      this.loadStatusCounts()
    ]);
  }

  async loadChecks() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.checkService.list({
        status: this.filterStatus() || undefined,
        clientId: this.filterClientId() || undefined,
        page: this.page(),
        limit: this.pageSize()
      });
    } catch {
      this.error.set('Impossible de charger les chèques');
    } finally {
      this.loading.set(false);
    }
  }

  onFilterChange() {
    this.page.set(1);
    this.loadChecks();
    this.loadStatusCounts();
  }

  async goToPage(page: number) {
    if (page < 1) return;
    this.page.set(page);
    await this.loadChecks();
  }

  deleteCheck(id: string) {
    this.pendingDeleteId.set(id);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
  }

  confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.checkService.delete(id).then(() => {
      this.closeDeleteModal();
      this.loadChecks();
      this.loadStatusCounts();
    }).catch(() => {
      this.error.set('Impossible de supprimer le chèque');
    });
  }

  totalPages = computed(() => {
    const total = this.checkService.totalCount();
    const size = this.pageSize();
    if (!total || size <= 0) return 1;
    return Math.max(1, Math.ceil(total / size));
  });

  async loadStatusCounts() {
    const clientId = this.filterClientId() || undefined;
    try {
      const [pending, cashed, cancelled] = await Promise.all([
        this.checkService.fetchCount({ status: 'PENDING', clientId }),
        this.checkService.fetchCount({ status: 'CASHED', clientId }),
        this.checkService.fetchCount({ status: 'CANCELLED', clientId })
      ]);
      this.statusCounts.set({
        PENDING: pending,
        CASHED: cashed,
        CANCELLED: cancelled
      });
    } catch {
      this.statusCounts.set({
        PENDING: 0,
        CASHED: 0,
        CANCELLED: 0
      });
    }
  }

  getStatusBadgeClass(status: CheckStatus | string): string {
    const classes: Record<string, string> = {
      PENDING: 'badge-warning',
      CASHED: 'badge-success',
      CANCELLED: 'badge-danger'
    };
    return classes[status] || 'badge-info';
  }

  getStatusLabel(status: CheckStatus | string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CASHED: 'Encaissé',
      CANCELLED: 'Annulé'
    };
    return labels[status] || status;
  }

  getClientName(clientId: string, fallback?: string): string {
    if (fallback) return fallback;
    const client = this.clients().find(c => c.id === clientId);
    return client?.name ?? '—';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }
}
