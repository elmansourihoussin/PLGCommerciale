import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService } from '../../core/services/quote.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Quote } from '../../core/models/quote.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ConvertQuoteDialogComponent } from '../../shared/components/convert-quote-dialog.component';
import { StatusDialogComponent, StatusOption } from '../../shared/components/status-dialog.component';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent, ConvertQuoteDialogComponent, StatusDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Devis</h1>
        <a routerLink="/quotes/new" class="mt-4 sm:mt-0 btn-primary">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau devis
        </a>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

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
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyé</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Rejeté</option>
            <option value="expired">Expiré</option>
          </select>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>N° Devis</th>
                <th>Client</th>
                <th>Date</th>
                <th>Validité</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                <tr>
                  <td colspan="7" class="text-center text-gray-500 py-8">Chargement des devis...</td>
                </tr>
              } @else {
                @for (quote of filteredQuotes(); track quote.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="font-medium">{{ quote.number }}</td>
                    <td>{{ getShortClientName(quote.client?.name ?? quote.clientName) }}</td>
                    <td>{{ formatDate(quote.date) }}</td>
                    <td>{{ formatDate(quote.validUntil) }}</td>
                    <td class="font-semibold">{{ formatAmount(quote.total) }} MAD</td>
                    <td>
                      <button
                        type="button"
                        class="cursor-pointer"
                        (click)="openStatusModal(quote.id, quote.status)"
                      >
                        <span [class]="getStatusBadgeClass(quote.status)">
                          {{ getStatusLabel(quote.status) }}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div class="flex items-center space-x-3">
                        <button
                          (click)="openConvertDialog(quote.id)"
                          class="text-emerald-600 hover:text-emerald-700"
                          title="Créer une facture"
                          [disabled]="convertingId() === quote.id"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/>
                          </svg>
                        </button>
                        <button (click)="downloadPdf(quote.id)" class="text-gray-600 hover:text-gray-900" title="Télécharger PDF">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v12m0 0l-3-3m3 3l3-3M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4"/>
                          </svg>
                        </button>
                        <a [routerLink]="['/quotes', quote.id]" class="text-primary-600 hover:text-primary-700">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <a [routerLink]="['/quotes', quote.id, 'edit']" class="text-gray-600 hover:text-gray-900">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <button (click)="deleteQuote(quote.id)" class="text-red-600 hover:text-red-700">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center text-gray-500 py-8">
                      Aucun devis trouvé
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
        title="Supprimer le devis"
        message="Cette action est définitive."
        [busy]="loading()"
        (cancel)="closeDeleteModal()"
        (confirm)="confirmDelete()"
      />

      <app-convert-quote-dialog
        [open]="showConvertModal()"
        [busy]="convertBusy()"
        [number]="convertNumber()"
        [error]="convertError()"
        (cancel)="closeConvertModal()"
        (confirm)="confirmConvert($event)"
      />

      <app-status-dialog
        [open]="showStatusModal()"
        [busy]="statusBusy()"
        [error]="statusError()"
        [options]="statusOptions"
        [currentValue]="statusCurrent()"
        [currentLabel]="getStatusLabel(statusCurrent())"
        title="Modifier le statut du devis"
        (cancel)="closeStatusModal()"
        (confirm)="confirmStatusChange($event)"
      />
    </div>
  `
})
export class QuoteListComponent implements OnInit {
  searchTerm = signal('');
  filterStatus = signal('');
  loading = signal(false);
  error = signal('');
  convertingId = signal<string | null>(null);
  showConvertModal = signal(false);
  convertQuoteId = signal<string | null>(null);
  convertNumber = signal('');
  convertError = signal('');
  convertBusy = signal(false);
  showStatusModal = signal(false);
  statusCurrent = signal<Quote['status'] | ''>('');
  statusTargetId = signal<string | null>(null);
  statusError = signal('');
  statusBusy = signal(false);
  page = signal(1);
  pageSize = signal(10);
  showDeleteModal = signal(false);
  pendingDeleteId = signal<string | null>(null);

  statusOptions: StatusOption[] = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'sent', label: 'Envoyé' },
    { value: 'accepted', label: 'Accepté' },
    { value: 'rejected', label: 'Rejeté' },
    { value: 'expired', label: 'Expiré' }
  ];

  constructor(
    private quoteService: QuoteService,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadQuotes();
  }

  filteredQuotes = computed(() => {
    return this.quoteService.quotes()
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  onSearchChange() {
    this.searchTerm.set(this.searchTerm());
    this.page.set(1);
    this.loadQuotes();
  }

  onFilterChange() {
    this.filterStatus.set(this.filterStatus());
    this.page.set(1);
    this.loadQuotes();
  }

  deleteQuote(id: string) {
    this.pendingDeleteId.set(id);
    this.showDeleteModal.set(true);
  }

  async openConvertDialog(id: string) {
    this.convertError.set('');
    this.convertQuoteId.set(id);
    this.showConvertModal.set(true);
    this.convertBusy.set(true);
    this.convertingId.set(id);
    try {
      const nextNumber = await this.invoiceService.getNextNumber();
      this.convertNumber.set(nextNumber || '');
    } catch {
      this.convertError.set('Impossible de générer le numéro de facture');
    } finally {
      this.convertBusy.set(false);
    }
  }

  closeConvertModal() {
    this.showConvertModal.set(false);
    this.convertQuoteId.set(null);
    this.convertNumber.set('');
    this.convertError.set('');
    this.convertingId.set(null);
  }

  async confirmConvert(number: string) {
    const id = this.convertQuoteId();
    if (!id) return;
    this.convertBusy.set(true);
    this.convertError.set('');
    try {
      const invoiceId = await this.quoteService.convertToInvoice(id, number);
      if (invoiceId) {
        this.closeConvertModal();
        this.router.navigate(['/invoices', invoiceId, 'edit']);
        return;
      }
      this.convertError.set('La conversion a réussi mais la facture est introuvable');
    } catch {
      this.convertError.set('Impossible de convertir le devis en facture');
    } finally {
      this.convertBusy.set(false);
      this.convertingId.set(null);
    }
  }

  openStatusModal(id: string, status: Quote['status']) {
    this.statusTargetId.set(id);
    this.statusCurrent.set(status);
    this.statusError.set('');
    this.showStatusModal.set(true);
  }

  closeStatusModal() {
    this.showStatusModal.set(false);
    this.statusTargetId.set(null);
    this.statusCurrent.set('');
    this.statusError.set('');
    this.statusBusy.set(false);
  }

  async confirmStatusChange(status: string) {
    const id = this.statusTargetId();
    if (!id) return;
    this.statusBusy.set(true);
    this.statusError.set('');
    try {
      await this.quoteService.update(id, { status: status as Quote['status'] });
      await this.loadQuotes();
      this.closeStatusModal();
    } catch {
      this.statusError.set('Impossible de modifier le statut du devis');
    } finally {
      this.statusBusy.set(false);
    }
  }

  async downloadPdf(id: string) {
    try {
      const blob = await this.quoteService.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      this.error.set('Impossible de télécharger le devis');
    }
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
  }

  confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.quoteService.delete(id).then(() => {
      this.closeDeleteModal();
      this.loadQuotes();
    }).catch(() => {
      this.error.set('Impossible de supprimer le devis');
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      draft: 'badge-info',
      sent: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-danger',
      expired: 'badge-danger'
    };
    return classes[status] || 'badge-info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Rejeté',
      expired: 'Expiré'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  getShortClientName(name?: string): string {
    if (!name) return '—';
    if (name.length <= 10) return name;
    return `${name.slice(0, 10)}...`;
  }

  async loadQuotes() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.quoteService.list({
        page: this.page(),
        limit: this.pageSize(),
        search: this.searchTerm() || undefined,
        status: this.filterStatus() || undefined
      });
    } catch (err) {
      this.error.set('Impossible de charger les devis');
    } finally {
      this.loading.set(false);
    }
  }

  async goToPage(page: number) {
    if (page < 1) return;
    this.page.set(page);
    await this.loadQuotes();
  }

  totalPages = computed(() => {
    const total = this.quoteService.totalCount();
    const size = this.pageSize();
    if (!total || size <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / size));
  });
}
