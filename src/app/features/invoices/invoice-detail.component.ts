import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../core/services/invoice.service';
import { Invoice } from '../../core/models/invoice.model';
import { InvoicePaymentsComponent } from './invoice-payments.component';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, InvoicePaymentsComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Facture {{ invoice()?.number || '' }}</h1>
          <p class="text-gray-600">{{ invoice()?.title }}</p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="btn-outline" (click)="downloadPdf()" [disabled]="!invoiceId()">
            Télécharger PDF
          </button>
          <a [routerLink]="['/invoices', invoiceId(), 'edit']" class="btn-secondary">Modifier</a>
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
              <p class="font-semibold text-gray-900">{{ invoice()?.clientName || '—' }}</p>
            </div>
            <span [class]="getStatusBadgeClass(invoice()?.status)">
              {{ getStatusLabel(invoice()?.status || '') }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="text-gray-600">Date facture</p>
              <p class="font-medium">{{ formatDate(invoice()?.date) }}</p>
            </div>
            <div>
              <p class="text-gray-600">Échéance</p>
              <p class="font-medium">{{ formatDate(invoice()?.dueDate) }}</p>
            </div>
            <div>
              <p class="text-gray-600">Mode de paiement</p>
              <p class="font-medium">{{ invoice()?.paymentMethod || '—' }}</p>
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
                @for (line of invoice()?.lines || []; track line.id) {
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

          @if (invoice()?.notes) {
            <div>
              <p class="text-sm text-gray-600">Note</p>
              <p class="text-gray-900">{{ invoice()?.notes }}</p>
            </div>
          }
        </div>

        <div class="card space-y-4">
          <div>
            <p class="text-sm text-gray-600">Sous-total</p>
            <p class="text-xl font-semibold text-gray-900">{{ (invoice()?.subtotal ?? 0).toLocaleString() }} MAD</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">TVA</p>
            <p class="text-lg font-semibold text-gray-900">{{ (invoice()?.taxAmount ?? 0).toLocaleString() }} MAD</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ (invoice()?.total ?? 0).toLocaleString() }} MAD</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Payé</p>
            <p class="text-lg font-semibold text-green-700">{{ totalPaid().toLocaleString() }} MAD</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Reste à payer</p>
            <p class="text-lg font-semibold text-red-600">{{ (balanceDue() || 0).toLocaleString() }} MAD</p>
          </div>
        </div>
      </div>

      <app-invoice-payments [invoiceId]="invoiceId()"></app-invoice-payments>
    </div>
  `
})
export class InvoiceDetailComponent implements OnInit {
  invoiceId = signal('');
  invoice = signal<Invoice | null>(null);
  error = signal('');
  paymentsTotal = signal(0);

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.invoiceId.set(id);
    await this.loadInvoice(id);
  }

  async loadInvoice(id: string) {
    this.error.set('');
    try {
      const invoice = await this.invoiceService.getById(id);
      this.invoice.set(invoice);
      this.paymentsTotal.set(invoice.paidAmount ?? 0);
    } catch (err) {
      this.error.set('Impossible de charger la facture');
    }
  }

  totalPaid = computed(() => this.paymentsTotal());

  balanceDue = computed(() => {
    const inv = this.invoice();
    if (!inv) return 0;
    return Math.max(0, inv.total - this.paymentsTotal());
  });

  getStatusBadgeClass(status?: string): string {
    const classes: Record<string, string> = {
      paid: 'badge-success',
      unpaid: 'badge-warning',
      partially_paid: 'badge-info',
      overdue: 'badge-danger'
    };
    return classes[status || 'unpaid'] || 'badge-info';
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

  formatDate(date?: Date): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  goBack() {
    this.router.navigate(['/invoices']);
  }

  async downloadPdf() {
    const id = this.invoiceId();
    if (!id) return;
    try {
      const blob = await this.invoiceService.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      this.error.set('Impossible de télécharger la facture');
    }
  }
}
