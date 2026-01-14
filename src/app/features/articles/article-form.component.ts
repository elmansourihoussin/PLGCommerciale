import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleService, CreateArticlePayload } from '../../core/services/article.service';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier l’article' : 'Nouvel article' }}
        </h1>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Type d’article</label>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600">Produit</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" formControlName="isService" class="sr-only peer">
                <span class="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-4 peer-focus:ring-primary-200 peer-checked:bg-primary-600 transition-colors"></span>
                <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
              </label>
              <span class="text-sm text-gray-600">Service</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Service = prestation sans stock. Produit = article stockable.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input type="text" formControlName="name" class="input" required />
              @if (isControlInvalid('name')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>
            @if (!form.get('isService')?.value) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input type="text" formControlName="sku" class="input" />
              </div>
            }
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prix unitaire *</label>
              <input type="number" formControlName="unitPrice" class="input" min="0" required />
              @if (isControlInvalid('unitPrice')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">TVA (%)</label>
              <input type="number" formControlName="taxRate" class="input" min="0" max="100" />
            </div>
            @if (!form.get('isService')?.value) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                <input type="number" formControlName="stockQty" class="input" min="0" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unité</label>
                <input type="text" formControlName="unit" class="input" placeholder="pc, h, kg" />
              </div>
            }
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">
            {{ isEdit() ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class ArticleFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  error = signal('');
  form: FormGroup;

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      sku: [''],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [null],
      stockQty: [null],
      unit: [''],
      isService: [false]
    });

    this.form.get('isService')?.valueChanges.subscribe((isService) => {
      if (isService) {
        this.form.patchValue({ sku: '', stockQty: null, unit: '' });
      }
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      await this.loadArticle(id);
    }
  }

  async loadArticle(id: string) {
    this.loading.set(true);
    this.error.set('');
    try {
      const article = await this.articleService.getById(id);
      this.form.patchValue({
        name: article.name,
        sku: article.sku ?? '',
        unitPrice: article.unitPrice,
        taxRate: article.taxRate !== undefined ? article.taxRate * 100 : null,
        stockQty: article.stockQty ?? null,
        unit: article.unit ?? '',
        isService: article.isService
      });
    } catch {
      this.error.set('Impossible de charger l’article');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez remplir les champs obligatoires');
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    try {
      const formValue = this.form.value as CreateArticlePayload;
      const payload: CreateArticlePayload = {
        ...formValue,
        taxRate: this.normalizeTaxRate(formValue.taxRate as number | undefined)
      };
      if (this.isEdit()) {
        await this.articleService.update(this.route.snapshot.paramMap.get('id')!, payload);
      } else {
        await this.articleService.create(payload);
      }
      this.router.navigate(['/articles']);
    } catch {
      this.error.set('Impossible d’enregistrer l’article');
    } finally {
      this.loading.set(false);
    }
  }

  normalizeTaxRate(value?: number): number | undefined {
    if (value === undefined || value === null || value === ('' as any)) return undefined;
    if (value > 1) return value / 100;
    return value;
  }

  isControlInvalid(name: string): boolean {
    const control = this.form.get(name);
    return Boolean(control && control.invalid && control.touched);
  }

  goBack() {
    this.router.navigate(['/articles']);
  }
}
