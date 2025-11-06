import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Factures</h1>
        <a routerLink="/invoices/new" class="mt-4 sm:mt-0 btn-primary">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle facture
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card">
          <p class="text-sm text-gray-600">Total facturé</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">{{ stats().totalAmount.toLocaleString() }} MAD</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">Payées</p>
          <p class="mt-2 text-2xl font-bold text-green-600">{{ stats().paidCount }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">Impayées</p>
          <p class="mt-2 text-2xl font-bold text-orange-600">{{ stats().unpaidCount }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600">En retard</p>
          <p class="mt-2 text-2xl font-bold text-red-600">{{ stats().overdueCount }}</p>
        </div>
      </div>

      <div class="card">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              placeholder="Rechercher par client ou numéro..."
              class="input"
            />
          </div>
          <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" class="input sm:w-48">
            <option value="">Tous les statuts</option>
            <option value="paid">Payée</option>
            <option value="unpaid">Impayée</option>
            <option value="partially_paid">Partiellement payée</option>
            <option value="overdue">En retard</option>
          </select>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Date</th>
                <th>Échéance</th>
                <th>Montant</th>
                <th>Payé</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (invoice of filteredInvoices(); track invoice.id) {
                <tr class="hover:bg-gray-50">
                  <td class="font-medium">{{ invoice.number }}</td>
                  <td>{{ invoice.clientName }}</td>
                  <td>{{ formatDate(invoice.date) }}</td>
                  <td>{{ formatDate(invoice.dueDate) }}</td>
                  <td class="font-semibold">{{ invoice.total.toLocaleString() }} MAD</td>
                  <td>{{ invoice.paidAmount.toLocaleString() }} MAD</td>
                  <td>
                    <span [class]="getStatusBadgeClass(invoice.status)">
                      {{ getStatusLabel(invoice.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center space-x-3">
                      <a [routerLink]="['/invoices', invoice.id]" class="text-primary-600 hover:text-primary-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>
                      <a [routerLink]="['/invoices', invoice.id, 'edit']" class="text-gray-600 hover:text-gray-900">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </a>
                      <button (click)="deleteInvoice(invoice.id)" class="text-red-600 hover:text-red-700">
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
                    Aucune facture trouvée
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
export class InvoiceListComponent {
  searchTerm = signal('');
  filterStatus = signal('');

  constructor(private invoiceService: InvoiceService) {}

  stats = computed(() => {
    const invoices = this.invoiceService.invoices();
    return {
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      paidCount: invoices.filter(inv => inv.status === 'paid').length,
      unpaidCount: invoices.filter(inv => inv.status === 'unpaid').length,
      overdueCount: invoices.filter(inv => inv.status === 'overdue').length
    };
  });

  filteredInvoices = computed(() => {
    let invoices = this.invoiceService.invoices();

    const search = this.searchTerm().toLowerCase();
    if (search) {
      invoices = invoices.filter(inv =>
        inv.number.toLowerCase().includes(search) ||
        inv.clientName?.toLowerCase().includes(search)
      );
    }

    const status = this.filterStatus();
    if (status) {
      invoices = invoices.filter(inv => inv.status === status);
    }

    return invoices.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  onSearchChange() {
    this.searchTerm.set(this.searchTerm());
  }

  onFilterChange() {
    this.filterStatus.set(this.filterStatus());
  }

  deleteInvoice(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      this.invoiceService.delete(id);
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      paid: 'badge-success',
      unpaid: 'badge-warning',
      partially_paid: 'badge-info',
      overdue: 'badge-danger'
    };
    return classes[status] || 'badge-info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      paid: 'Payée',
      unpaid: 'Impayée',
      partially_paid: 'Part. payée',
      overdue: 'En retard'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }
}
