import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ArticleService, CreateArticlePayload } from '../../core/services/article.service';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

      <form #articleForm="ngForm" (ngSubmit)="onSubmit(articleForm)" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
          <div class="mb-4">
            <label class="flex items-center space-x-2">
              <input type="checkbox" [(ngModel)]="formData.isService" name="isService" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
              <span class="text-sm text-gray-700">Service (pas de stock)</span>
            </label>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input type="text" [(ngModel)]="formData.name" name="name" class="input" required #nameRef="ngModel" />
              @if (nameRef.invalid && nameRef.touched) {
                <p class="text-xs text-red-600 mt-1">Champ obligatoire</p>
              }
            </div>
            @if (!formData.isService) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input type="text" [(ngModel)]="formData.sku" name="sku" class="input" />
              </div>
            }
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prix unitaire *</label>
              <input type="number" [(ngModel)]="formData.unitPrice" name="unitPrice" class="input" min="0" required #unitPriceRef="ngModel" />
              @if (unitPriceRef.invalid && unitPriceRef.touched) {
                <p class="text-xs text-red-600 mt-1">Champ obligatoire</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">TVA (%)</label>
              <input type="number" [(ngModel)]="formData.taxRate" name="taxRate" class="input" min="0" max="100" />
            </div>
            @if (!formData.isService) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                <input type="number" [(ngModel)]="formData.stockQty" name="stockQty" class="input" min="0" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Unité</label>
                <input type="text" [(ngModel)]="formData.unit" name="unit" class="input" placeholder="pc, h, kg" />
              </div>
            }
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="loading() || articleForm.invalid">
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
  formData: CreateArticlePayload = {
    name: '',
    sku: '',
    unitPrice: 0,
    taxRate: undefined,
    stockQty: undefined,
    unit: '',
    isService: false
  };

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
      this.formData = {
        name: article.name,
        sku: article.sku,
        unitPrice: article.unitPrice,
        taxRate: article.taxRate !== undefined ? article.taxRate * 100 : undefined,
        stockQty: article.stockQty,
        unit: article.unit,
        isService: article.isService
      };
    } catch (err) {
      this.error.set('Impossible de charger l’article');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      this.error.set('Veuillez remplir tous les champs obligatoires');
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      const payload: CreateArticlePayload = {
        ...this.formData,
        taxRate: this.normalizeTaxRate(this.formData.taxRate)
      };
      if (this.isEdit()) {
        await this.articleService.update(this.route.snapshot.paramMap.get('id')!, payload);
      } else {
        await this.articleService.create(payload);
      }
      this.router.navigate(['/articles']);
    } catch (err) {
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

  goBack() {
    this.router.navigate(['/articles']);
  }
}
