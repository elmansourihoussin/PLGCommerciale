import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../core/services/quote.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Quote } from '../../core/models/quote.model';
import { ConvertQuoteDialogComponent } from '../../shared/components/convert-quote-dialog.component';

@Component({
  selector: 'app-quote-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ConvertQuoteDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Devis {{ quote()?.number || '' }}</h1>
          <p class="text-gray-600">{{ quote()?.title }}</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-outline" (click)="openConvertDialog()" [disabled]="!quoteId() || converting()">
            Créer une facture
          </button>
          <button class="btn-outline" (click)="downloadPdf()" [disabled]="!quoteId()">
            Télécharger PDF
          </button>
          <a [routerLink]="['/quotes', quoteId(), 'edit']" class="btn-secondary">Modifier</a>
          <button class="btn-outline" (click)="goBack()">Retour</button>
        </div>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="card lg:col-span-2 space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-600">Client</p>
              <p class="font-semibold text-gray-900">{{ quote()?.clientName || '—' }}</p>
            </div>
            <span [class]="getStatusBadgeClass(quote()?.status)">
              {{ getStatusLabel(quote()?.status || '') }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="text-gray-600">Date devis</p>
              <p class="font-medium">{{ formatDate(quote()?.date) }}</p>
            </div>
            <div>
              <p class="text-gray-600">Validité</p>
              <p class="font-medium">{{ formatDate(quote()?.validUntil) }}</p>
            </div>
            <div>
              <p class="text-gray-600">Statut</p>
              <p class="font-medium">{{ getStatusLabel(quote()?.status || '') }}</p>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Qté</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (line of quote()?.lines || []; track line.id) {
                  <tr>
                    <td>{{ line.description }}</td>
                    <td>{{ line.quantity }}</td>
                    <td>{{ line.unitPrice.toLocaleString() }} MAD</td>
                    <td class="font-semibold">{{ line.total.toLocaleString() }} MAD</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center text-gray-500 py-6">Aucune ligne</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (quote()?.notes) {
            <div>
              <p class="text-sm text-gray-600">Note</p>
              <p class="text-gray-900">{{ quote()?.notes }}</p>
            </div>
          }
        </div>

        <div class="card space-y-4">
          <div>
            <p class="text-sm text-gray-600">Sous-total</p>
            <p class="text-xl font-semibold text-gray-900">{{ (quote()?.subtotal ?? 0).toLocaleString() }} MAD</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">TVA</p>
            <p class="text-lg font-semibold text-gray-900">{{ (quote()?.taxAmount ?? 0).toLocaleString() }} MAD</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ (quote()?.total ?? 0).toLocaleString() }} MAD</p>
          </div>
        </div>
      </div>

      <app-convert-quote-dialog
        [open]="showConvertModal()"
        [busy]="convertBusy()"
        [number]="convertNumber()"
        [error]="convertError()"
        (cancel)="closeConvertModal()"
        (confirm)="confirmConvert($event)"
      />
    </div>
  `
})
export class QuoteDetailComponent implements OnInit {
  quoteId = signal('');
  quote = signal<Quote | null>(null);
  error = signal('');
  converting = signal(false);
  showConvertModal = signal(false);
  convertNumber = signal('');
  convertError = signal('');
  convertBusy = signal(false);

  constructor(
    private quoteService: QuoteService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.quoteId.set(id);
    await this.loadQuote(id);
  }

  async loadQuote(id: string) {
    this.error.set('');
    try {
      const quote = await this.quoteService.getById(id);
      this.quote.set(quote);
    } catch {
      this.error.set('Impossible de charger le devis');
    }
  }

  getStatusBadgeClass(status?: string): string {
    const classes: Record<string, string> = {
      draft: 'badge-info',
      sent: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-danger',
      expired: 'badge-danger'
    };
    return classes[status || 'draft'] || 'badge-info';
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

  formatDate(date?: Date): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  goBack() {
    this.router.navigate(['/quotes']);
  }

  async downloadPdf() {
    const id = this.quoteId();
    if (!id) return;
    try {
      const blob = await this.quoteService.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      this.error.set('Impossible de télécharger le devis');
    }
  }

  async openConvertDialog() {
    const id = this.quoteId();
    if (!id) return;
    try {
      this.convertError.set('');
      this.showConvertModal.set(true);
      this.convertBusy.set(true);
      this.converting.set(true);
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
    this.convertNumber.set('');
    this.convertError.set('');
    this.converting.set(false);
  }

  async confirmConvert(number: string) {
    const id = this.quoteId();
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
    }
  }
}
