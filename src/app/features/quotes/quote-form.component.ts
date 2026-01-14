import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuoteService } from '../../core/services/quote.service';
import { ClientService } from '../../core/services/client.service';
import { ArticleService } from '../../core/services/article.service';
import { QuoteLine } from '../../core/models/quote.model';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier le devis' : 'Nouveau devis' }}
        </h1>
      </div>

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
                placeholder="Ex: DEV-2025-001"
              />
              @if (isControlInvalid('number')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <select formControlName="clientId" class="input">
                <option value="">Sélectionner un client</option>
                @for (client of clients(); track client.id) {
                  <option [value]="client.id">{{ client.name }}</option>
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
                placeholder="Ex: Travaux de plomberie"
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Validité jusqu'au *</label>
              <input type="date" formControlName="validUntil" class="input" />
              @if (isControlInvalid('validUntil')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select formControlName="status" class="input">
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card" formArrayName="lines">
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
                      <option value="" disabled>Sélectionner un article</option>
                      @for (article of articles(); track article.id) {
                        <option [value]="article.id">{{ article.name }}</option>
                      }
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                      Sélectionnez un article pour préremplir description, prix et TVA.
                    </p>
                  </div>
                  <div class="md:col-span-5">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="input"
                      [ngClass]="{ 'border-red-500 focus:ring-red-500': isLineControlInvalid(i, 'description') }"
                      placeholder="Description du service/produit"
                    />
                    @if (isLineControlInvalid(i, 'description')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    }
                  </div>
                  <div class="md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                    <input
                      type="number"
                      formControlName="quantity"
                      (input)="updateLineTotal(i)"
                      class="input w-20"
                      [ngClass]="{ 'border-red-500 focus:ring-red-500': isLineControlInvalid(i, 'quantity') }"
                      min="1"
                    />
                    @if (isLineControlInvalid(i, 'quantity')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    }
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (MAD) *</label>
                    <input
                      type="number"
                      formControlName="unitPrice"
                      (input)="updateLineTotal(i)"
                      class="input"
                      [ngClass]="{ 'border-red-500 focus:ring-red-500': isLineControlInvalid(i, 'unitPrice') }"
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
                      [ngClass]="{ 'border-red-500 focus:ring-red-500': isLineTaxRateMissing(i) }"
                      min="0"
                      max="100"
                    />
                    @if (isLineTaxRateMissing(i)) {
                      <p class="text-xs text-red-600 mt-1">Renseignez la TVA (0 si non applicable)</p>
                    }
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
  articles = this.articleService.articles;
  formError = signal('');

  form: FormGroup;

  totals = signal({
    subtotal: 0,
    taxAmount: 0,
    total: 0
  });

  constructor(
    private quoteService: QuoteService,
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
      validUntil: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], Validators.required],
      status: ['draft'],
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
      await this.loadQuote(id);
      this.form.get('number')?.disable({ emitEvent: false });
    } else {
      await this.loadNextNumber();
      this.addLine();
    }
  }

  async loadQuote(id: string) {
    const quote = await this.quoteService.getById(id);
    this.form.patchValue({
      number: quote.number,
      clientId: quote.clientId,
      title: quote.title,
      date: new Date(quote.date).toISOString().split('T')[0],
      validUntil: new Date(quote.validUntil).toISOString().split('T')[0],
      status: quote.status,
      notes: quote.notes ?? ''
    });

    this.lines.clear();
    quote.lines.forEach((line) => {
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
    const quoteData = {
      number: formValue.number,
      clientId: formValue.clientId,
      title: formValue.title,
      date: formValue.date,
      validUntil: formValue.validUntil,
      status: formValue.status,
      note: formValue.notes,
      items: formValue.lines.map((line: QuoteLine) => ({
        label: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: this.normalizeLineTaxRate(line.taxRate),
        articleId: line.articleId || undefined
      }))
    };

    try {
      if (this.isEdit()) {
        const { number, ...updates } = quoteData;
        await this.quoteService.update(this.route.snapshot.paramMap.get('id')!, updates);
      } else {
        await this.quoteService.create(quoteData as any);
      }

      this.router.navigate(['/quotes']);
    } catch (err: any) {
      const message =
        err?.error?.message ||
        err?.error?.error?.message ||
        err?.message ||
        'Impossible d’enregistrer le devis';
      this.formError.set(message);
    }
  }

  goBack() {
    this.router.navigate(['/quotes']);
  }

  private async loadClients() {
    await this.clientService.list();
  }

  private async loadNextNumber() {
    try {
      const nextNumber = await this.quoteService.getNextNumber();
      if (nextNumber) {
        this.form.patchValue({ number: nextNumber });
      }
    } catch {
      this.formError.set('Impossible de générer le numéro de devis');
    }
  }

  createLine(data?: Partial<QuoteLine>): FormGroup {
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

  isControlInvalid(name: string): boolean {
    const control = this.form.get(name);
    return Boolean(control && control.invalid && control.touched);
  }

  isLineControlInvalid(index: number, name: string): boolean {
    const line = this.lines.at(index);
    const control = line?.get(name);
    const hasArticle = Boolean(line?.get('articleId')?.value);
    return Boolean(control && control.invalid && (control.touched || hasArticle));
  }

  isLineTaxRateMissing(index: number): boolean {
    const line = this.lines.at(index);
    const hasArticle = Boolean(line?.get('articleId')?.value);
    const value = line?.get('taxRate')?.value;
    if (!hasArticle) return false;
    return value === null || value === undefined || value === '';
  }

  areLinesValid(): boolean {
    return this.lines.length > 0 && this.lines.valid;
  }

  private normalizeLineTaxRate(value?: number): number | undefined {
    if (value === undefined || value === null || value === ('' as any)) {
      return undefined;
    }
    if (value > 1) {
      return value / 100;
    }
    return value;
  }
}
