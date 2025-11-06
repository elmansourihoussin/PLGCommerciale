import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService } from '../../core/services/quote.service';
import { ClientService } from '../../core/services/client.service';
import { Quote, QuoteLine } from '../../core/models/quote.model';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier le devis' : 'Nouveau devis' }}
        </h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <select [(ngModel)]="formData.clientId" name="clientId" required class="input">
                <option value="">Sélectionner un client</option>
                @for (client of clients(); track client.id) {
                  <option [value]="client.id">{{ client.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
              <input
                type="text"
                [(ngModel)]="formData.title"
                name="title"
                required
                class="input"
                placeholder="Ex: Travaux de plomberie"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                [(ngModel)]="formData.date"
                name="date"
                required
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Validité jusqu'au *</label>
              <input
                type="date"
                [(ngModel)]="formData.validUntil"
                name="validUntil"
                required
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Taux TVA (%)</label>
              <input
                type="number"
                [(ngModel)]="formData.taxRate"
                name="taxRate"
                (ngModelChange)="calculateTotals()"
                class="input"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select [(ngModel)]="formData.status" name="status" class="input">
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Lignes du devis</h2>
            <button type="button" (click)="addLine()" class="btn-secondary text-sm">
              <svg class="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Ajouter une ligne
            </button>
          </div>

          <div class="space-y-3">
            @for (line of formData.lines; track line.id; let i = $index) {
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div class="md:col-span-5">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      [(ngModel)]="line.description"
                      [name]="'description_' + i"
                      class="input"
                      placeholder="Description du service/produit"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      [(ngModel)]="line.quantity"
                      [name]="'quantity_' + i"
                      (ngModelChange)="updateLineTotal(line)"
                      class="input"
                      min="1"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Prix unitaire</label>
                    <input
                      type="number"
                      [(ngModel)]="line.unitPrice"
                      [name]="'unitPrice_' + i"
                      (ngModelChange)="updateLineTotal(line)"
                      class="input"
                      min="0"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <input
                      type="text"
                      [value]="line.total.toLocaleString() + ' MAD'"
                      readonly
                      class="input bg-gray-50"
                    />
                  </div>
                  <div class="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      (click)="removeLine(i)"
                      class="w-full btn-secondary text-red-600 hover:bg-red-50"
                    >
                      <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="mt-6 border-t border-gray-200 pt-4">
            <div class="flex justify-end">
              <div class="w-full md:w-80 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Sous-total:</span>
                  <span class="font-medium">{{ totals().subtotal.toLocaleString() }} MAD</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">TVA ({{ formData.taxRate }}%):</span>
                  <span class="font-medium">{{ totals().taxAmount.toLocaleString() }} MAD</span>
                </div>
                <div class="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>{{ totals().total.toLocaleString() }} MAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            [(ngModel)]="formData.notes"
            name="notes"
            rows="4"
            class="input"
            placeholder="Notes additionnelles..."
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">
            Annuler
          </button>
          <button type="submit" class="btn-primary">
            {{ isEdit() ? 'Mettre à jour' : 'Créer le devis' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class QuoteFormComponent implements OnInit {
  isEdit = signal(false);
  clients = this.clientService.clients;

  formData: any = {
    clientId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lines: [],
    taxRate: 20,
    status: 'draft',
    notes: ''
  };

  totals = signal({
    subtotal: 0,
    taxAmount: 0,
    total: 0
  });

  constructor(
    private quoteService: QuoteService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loadQuote(id);
    } else {
      this.addLine();
    }
  }

  loadQuote(id: string) {
    const quote = this.quoteService.getById(id);
    if (quote) {
      this.formData = {
        ...quote,
        date: new Date(quote.date).toISOString().split('T')[0],
        validUntil: new Date(quote.validUntil).toISOString().split('T')[0]
      };
      this.calculateTotals();
    }
  }

  addLine() {
    this.formData.lines.push({
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
  }

  removeLine(index: number) {
    this.formData.lines.splice(index, 1);
    this.calculateTotals();
  }

  updateLineTotal(line: QuoteLine) {
    line.total = line.quantity * line.unitPrice;
    this.calculateTotals();
  }

  calculateTotals() {
    const subtotal = this.formData.lines.reduce((sum: number, line: QuoteLine) => sum + line.total, 0);
    const taxAmount = subtotal * (this.formData.taxRate / 100);
    const total = subtotal + taxAmount;

    this.totals.set({
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    });
  }

  onSubmit() {
    if (!this.formData.clientId || !this.formData.title || this.formData.lines.length === 0) {
      alert('Veuillez remplir tous les champs requis et ajouter au moins une ligne');
      return;
    }

    const client = this.clientService.getById(this.formData.clientId);
    const quoteData = {
      clientId: this.formData.clientId,
      clientName: client?.name,
      title: this.formData.title,
      date: new Date(this.formData.date),
      validUntil: new Date(this.formData.validUntil),
      lines: this.formData.lines,
      subtotal: this.totals().subtotal,
      taxRate: this.formData.taxRate,
      taxAmount: this.totals().taxAmount,
      total: this.totals().total,
      status: this.formData.status,
      notes: this.formData.notes
    };

    if (this.isEdit()) {
      this.quoteService.update(this.route.snapshot.paramMap.get('id')!, quoteData);
    } else {
      this.quoteService.create(quoteData as any);
    }

    this.router.navigate(['/quotes']);
  }

  goBack() {
    this.router.navigate(['/quotes']);
  }
}
