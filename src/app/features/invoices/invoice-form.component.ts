import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { ArticleService } from '../../core/services/article.service';
import { ClientService } from '../../core/services/client.service';
import { InvoiceLine } from '../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier la facture' : 'Nouvelle facture' }}
        </h1>
      </div>

      @if (clientsError()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ clientsError() }}
        </div>
      }
      @if (formError()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ formError() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Numéro *</label>
              <input
                type="text"
                formControlName="number"
                class="input"
                placeholder="Ex: FAC-2025-001"
              />
              @if (isControlInvalid('number')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <select formControlName="clientId" class="input">
                <option value="">Sélectionner un client</option>
                @if (clientsLoading()) {
                  <option value="" disabled>Chargement...</option>
                } @else {
                  @for (client of clients(); track client.id) {
                    <option [value]="client.id">{{ client.name }}</option>
                  }
                }
              </select>
              @if (isControlInvalid('clientId')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
              <input
                type="text"
                formControlName="title"
                class="input"
                placeholder="Ex: Facture travaux octobre"
              />
              @if (isControlInvalid('title')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input type="date" formControlName="date" class="input" />
              @if (isControlInvalid('date')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date d'échéance *</label>
              <input type="date" formControlName="dueDate" class="input" />
              @if (isControlInvalid('dueDate')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select formControlName="status" class="input">
                <option value="draft">Brouillon</option>
                <option value="unpaid">Impayée</option>
                <option value="partially_paid">Partiellement payée</option>
                <option value="paid">Payée</option>
                <option value="overdue">En retard</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
              <select formControlName="paymentMethod" class="input">
                <option value="">Non spécifié</option>
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="card">Carte bancaire</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card" formArrayName="lines">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Lignes de la facture</h2>
            <button type="button" (click)="addLine()" class="btn-secondary text-sm">
              <svg class="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Ajouter une ligne
            </button>
          </div>

          <div class="space-y-3">
            @for (line of lines.controls; track $index; let i = $index) {
              <div class="border border-gray-200 rounded-lg p-4" [formGroupName]="i">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div class="md:col-span-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Article</label>
                    <select
                      formControlName="articleId"
                      (change)="applyArticle(i)"
                      class="input"
                    >
                      <option value="">Libre</option>
                      @for (article of articles(); track article.id) {
                        <option [value]="article.id">{{ article.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="md:col-span-5">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="input"
                      placeholder="Description du service/produit"
                    />
                    @if (isLineControlInvalid(i, 'description')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    }
                  </div>
                  <div class="md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      formControlName="quantity"
                      (input)="updateLineTotal(i)"
                      class="input w-20"
                      min="1"
                    />
                    @if (isLineControlInvalid(i, 'quantity')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    }
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (MAD)</label>
                    <input
                      type="number"
                      formControlName="unitPrice"
                      (input)="updateLineTotal(i)"
                      class="input"
                      min="0"
                    />
                    @if (isLineControlInvalid(i, 'unitPrice')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    }
                  </div>
                  <div class="md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
                    <input
                      type="number"
                      formControlName="taxRate"
                      (input)="calculateTotals()"
                      class="input w-20"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <input
                      type="text"
                      [value]="getLineTotal(i).toLocaleString() + ' MAD'"
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
                  <span class="text-gray-600">TVA (par ligne):</span>
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
            formControlName="notes"
            rows="4"
            class="input"
            placeholder="Notes additionnelles..."
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">
            Annuler
          </button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid || !areLinesValid()">
            {{ isEdit() ? 'Mettre à jour' : 'Créer la facture' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class InvoiceFormComponent implements OnInit {
  isEdit = signal(false);
  clients = this.clientService.clients;
  articles = this.articleService.articles;
  clientsLoading = signal(false);
  clientsError = signal('');
  formError = signal('');

  form: FormGroup;

  totals = signal({
    subtotal: 0,
    taxAmount: 0,
    total: 0
  });

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      number: ['', Validators.required],
      clientId: ['', Validators.required],
      title: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], Validators.required],
      status: ['unpaid'],
      paymentMethod: [''],
      notes: [''],
      lines: this.fb.array<FormGroup>([])
    });
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  async ngOnInit() {
    await Promise.all([
      this.loadClients(),
      this.articleService.list({ page: 1, limit: 200 })
    ]);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      await this.loadInvoice(id);
      this.form.get('number')?.disable({ emitEvent: false });
    } else {
      await this.loadNextNumber();
      this.addLine();
    }
  }

  async loadInvoice(id: string) {
    const invoice = await this.invoiceService.getById(id);
    this.form.patchValue({
      number: invoice.number,
      clientId: invoice.clientId,
      title: invoice.title,
      date: new Date(invoice.date).toISOString().split('T')[0],
      dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
      status: invoice.status,
      paymentMethod: this.mapPaymentMethodFromApi(invoice.paymentMethod),
      notes: invoice.notes ?? ''
    });

    this.lines.clear();
    invoice.lines.forEach((line) => {
      this.lines.push(this.createLine({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
        articleId: line.articleId
      }));
    });

    this.calculateTotals();
  }

  private async loadClients() {
    this.clientsLoading.set(true);
    this.clientsError.set('');
    try {
      await this.clientService.list();
    } catch {
      this.clientsError.set('Impossible de charger les clients');
    } finally {
      this.clientsLoading.set(false);
    }
  }

  private async loadNextNumber() {
    try {
      const nextNumber = await this.invoiceService.getNextNumber();
      if (nextNumber) {
        this.form.patchValue({ number: nextNumber });
      }
    } catch {
      this.formError.set('Impossible de générer le numéro de facture');
    }
  }

  createLine(data?: Partial<InvoiceLine>): FormGroup {
    const quantity = data?.quantity ?? 1;
    const unitPrice = data?.unitPrice ?? 0;
    const total = quantity * unitPrice;
    return this.fb.group({
      articleId: [data?.articleId ?? ''],
      description: [data?.description ?? '', Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
      taxRate: [data?.taxRate ?? null],
      total: [{ value: total, disabled: true }]
    });
  }

  addLine() {
    this.lines.push(this.createLine());
    this.calculateTotals();
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
    this.calculateTotals();
  }

  updateLineTotal(index: number) {
    const line = this.lines.at(index) as FormGroup;
    const quantity = Number(line.get('quantity')?.value || 0);
    const unitPrice = Number(line.get('unitPrice')?.value || 0);
    const total = quantity * unitPrice;
    line.get('total')?.setValue(total, { emitEvent: false });
    this.calculateTotals();
  }

  applyArticle(index: number) {
    const line = this.lines.at(index) as FormGroup;
    const articleId = line.get('articleId')?.value;
    if (!articleId) return;
    const article = this.articles().find(a => a.id === articleId);
    if (!article) return;
    line.patchValue({
      description: article.name,
      unitPrice: article.unitPrice,
      taxRate: article.taxRate !== undefined ? article.taxRate * 100 : line.get('taxRate')?.value
    });
    this.updateLineTotal(index);
  }

  getLineTotal(index: number): number {
    const line = this.lines.at(index) as FormGroup;
    return Number(line.get('total')?.value ?? 0);
  }

  calculateTotals() {
    const subtotal = this.lines.controls.reduce((sum, control) => {
      const total = Number(control.get('total')?.value ?? 0);
      return sum + total;
    }, 0);
    const taxAmount = this.lines.controls.reduce((sum, control) => {
      const lineTotal = Number(control.get('total')?.value ?? 0);
      const lineTaxRate = Number(control.get('taxRate')?.value ?? 0);
      return sum + (lineTotal * (lineTaxRate / 100));
    }, 0);
    const total = subtotal + taxAmount;

    this.totals.set({
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    });
  }

  async onSubmit() {
    if (this.form.invalid || !this.areLinesValid()) {
      this.form.markAllAsTouched();
      this.lines.markAllAsTouched();
      this.formError.set('Veuillez remplir les champs obligatoires');
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    this.formError.set('');

    const formValue = this.form.getRawValue();
    const invoiceData = {
      number: formValue.number,
      clientId: formValue.clientId,
      title: formValue.title,
      note: formValue.notes,
      paymentMethod: this.mapPaymentMethod(formValue.paymentMethod),
      invoiceDate: formValue.date,
      dueDate: formValue.dueDate,
      status: formValue.status,
      items: formValue.lines.map((line: InvoiceLine) => ({
        label: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: this.normalizeLineTaxRate(line.taxRate),
        articleId: line.articleId || undefined
      }))
    };

    if (this.isEdit()) {
      const { number, ...updates } = invoiceData;
      await this.invoiceService.update(this.route.snapshot.paramMap.get('id')!, updates);
    } else {
      await this.invoiceService.create(invoiceData as any);
    }

    this.router.navigate(['/invoices']);
  }

  goBack() {
    this.router.navigate(['/invoices']);
  }

  isControlInvalid(name: string): boolean {
    const control = this.form.get(name);
    return Boolean(control && control.invalid && control.touched);
  }

  isLineControlInvalid(index: number, name: string): boolean {
    const line = this.lines.at(index);
    const control = line?.get(name);
    return Boolean(control && control.invalid && control.touched);
  }

  areLinesValid(): boolean {
    return this.lines.length > 0 && this.lines.valid;
  }

  private normalizeTaxRate(value: number): number {
    if (value > 1) {
      return value / 100;
    }
    return value;
  }

  private normalizeLineTaxRate(value?: number): number | undefined {
    if (value === undefined || value === null || value === ('' as any)) {
      return undefined;
    }
    return this.normalizeTaxRate(value);
  }

  private mapPaymentMethod(value?: string): string | undefined {
    if (!value) return undefined;
    const map: Record<string, string> = {
      bank_transfer: 'Virement',
      card: 'Carte',
      cash: 'Espèces',
      check: 'Chèque'
    };
    return map[value] ?? value;
  }

  private mapPaymentMethodFromApi(value?: string): string {
    if (!value) return '';
    const map: Record<string, string> = {
      Virement: 'bank_transfer',
      Carte: 'card',
      Espèces: 'cash',
      Chèque: 'check'
    };
    return map[value] ?? value;
  }
}
