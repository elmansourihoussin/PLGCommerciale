import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckService } from '../../core/services/check.service';

@Component({
  selector: 'app-check-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

      <div class="card">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              placeholder="Rechercher par bénéficiaire ou numéro..."
              class="input"
            />
          </div>
          <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" class="input sm:w-48">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="printed">Imprimé</option>
            <option value="cashed">Encaissé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>N° Chèque</th>
                <th>Bénéficiaire</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Banque</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (check of filteredChecks(); track check.id) {
                <tr class="hover:bg-gray-50">
                  <td class="font-medium">{{ check.number }}</td>
                  <td>{{ check.beneficiary }}</td>
                  <td>{{ check.clientName }}</td>
                  <td>{{ formatDate(check.date) }}</td>
                  <td class="font-semibold">{{ check.amount.toLocaleString() }} MAD</td>
                  <td>{{ check.bankName || '-' }}</td>
                  <td>
                    <span [class]="getStatusBadgeClass(check.status)">
                      {{ getStatusLabel(check.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center space-x-3">
                      <button
                        (click)="printCheck(check.id)"
                        class="text-primary-600 hover:text-primary-700"
                        title="Imprimer"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                      </button>
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
                  <td colspan="8" class="text-center text-gray-500 py-8">
                    Aucun chèque trouvé
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CheckListComponent {
  searchTerm = signal('');
  filterStatus = signal('');

  constructor(private checkService: CheckService) {}

  filteredChecks = computed(() => {
    let checks = this.checkService.checks();

    const search = this.searchTerm().toLowerCase();
    if (search) {
      checks = checks.filter(c =>
        c.number.toLowerCase().includes(search) ||
        c.beneficiary.toLowerCase().includes(search) ||
        c.clientName?.toLowerCase().includes(search)
      );
    }

    const status = this.filterStatus();
    if (status) {
      checks = checks.filter(c => c.status === status);
    }

    return checks.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  onSearchChange() {
    this.searchTerm.set(this.searchTerm());
  }

  onFilterChange() {
    this.filterStatus.set(this.filterStatus());
  }

  printCheck(id: string) {
    const check = this.checkService.getById(id);
    if (check) {
      alert(`Impression du chèque ${check.number} pour ${check.amount} MAD`);
      this.checkService.update(id, { status: 'printed' });
    }
  }

  deleteCheck(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chèque ?')) {
      this.checkService.delete(id);
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'badge-warning',
      printed: 'badge-info',
      cashed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return classes[status] || 'badge-info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      printed: 'Imprimé',
      cashed: 'Encaissé',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }
}
