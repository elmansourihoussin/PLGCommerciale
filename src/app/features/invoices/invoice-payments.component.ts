import { Component, Input, OnChanges, OnInit, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoicePayment, InvoiceService, PaymentCreatePayload } from '../../core/services/invoice.service';

@Component({
  selector: 'app-invoice-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card space-y-4 mt-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Paiements</h2>
        <span class="text-sm text-gray-600">
          Total payé: {{ totalPaid().toLocaleString() }} MAD
        </span>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Montant *</label>
          <input type="number" [(ngModel)]="form.amount" name="amount" class="input" min="0" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <select [(ngModel)]="form.method" name="method" class="input">
            <option value="">Non spécifié</option>
            <option value="Virement">Virement</option>
            <option value="Carte">Carte</option>
            <option value="Espèces">Espèces</option>
            <option value="Chèque">Chèque</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input type="date" [(ngModel)]="form.paidAt" name="paidAt" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Référence</label>
          <input type="text" [(ngModel)]="form.reference" name="reference" class="input" />
        </div>
        <div class="flex items-end">
          <button type="button" class="btn-primary w-full" [disabled]="loading()" (click)="addPayment()">
            @if (loading()) {
              <span>Ajout...</span>
            } @else {
              <span>Ajouter</span>
            }
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Montant</th>
              <th>Mode</th>
              <th>Référence</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @if (loading() && payments().length === 0) {
              <tr>
                <td colspan="6" class="text-center text-gray-500 py-6">Chargement...</td>
              </tr>
            } @else {
              @for (payment of payments(); track payment.id) {
                <tr>
                  <td>{{ formatDate(payment.paidAt) }}</td>
                  <td class="font-semibold">{{ payment.amount.toLocaleString() }} MAD</td>
                  <td>{{ payment.method || '—' }}</td>
                  <td>{{ payment.reference || '—' }}</td>
                  <td>{{ payment.note || '—' }}</td>
                  <td class="text-right">
                    <button class="text-red-600 hover:text-red-700" (click)="removePayment(payment)">
                      Supprimer
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center text-gray-500 py-6">Aucun paiement</td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InvoicePaymentsComponent implements OnInit, OnChanges {
  @Input() invoiceId = '';

  payments = signal<InvoicePayment[]>([]);
  loading = signal(false);
  error = signal('');

  form: PaymentCreatePayload = {
    amount: 0,
    method: '',
    paidAt: '',
    reference: '',
    note: ''
  };

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadPayments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['invoiceId'] && !changes['invoiceId'].firstChange) {
      this.loadPayments();
    }
  }

  totalPaid = () => this.payments().reduce((sum, p) => sum + p.amount, 0);

  async loadPayments() {
    if (!this.invoiceId) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const payments = await this.invoiceService.getPayments(this.invoiceId);
      this.payments.set(payments);
    } catch (err) {
      this.error.set('Impossible de charger les paiements');
    } finally {
      this.loading.set(false);
    }
  }

  async addPayment() {
    if (!this.invoiceId || !this.form.amount) {
      this.error.set('Le montant est obligatoire');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      const payload: PaymentCreatePayload = {
        amount: this.form.amount,
        method: this.form.method || undefined,
        paidAt: this.form.paidAt || undefined,
        reference: this.form.reference || undefined,
        note: this.form.note || undefined
      };
      const payment = await this.invoiceService.addPayment(this.invoiceId, payload);
      this.payments.set([payment, ...this.payments()]);
      this.form = { amount: 0, method: '', paidAt: '', reference: '', note: '' };
    } catch (err) {
      this.error.set('Impossible d’ajouter le paiement');
    } finally {
      this.loading.set(false);
    }
  }

  async removePayment(payment: InvoicePayment) {
    if (!this.invoiceId) return;
    if (!confirm('Supprimer ce paiement ?')) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.invoiceService.removePayment(this.invoiceId, payment.id);
      this.payments.set(this.payments().filter((p) => p.id !== payment.id));
    } catch (err) {
      this.error.set('Impossible de supprimer le paiement');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }
}
