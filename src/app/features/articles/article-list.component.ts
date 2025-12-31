import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../core/services/article.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Articles</h1>
        <a routerLink="/articles/new" class="mt-4 sm:mt-0 btn-primary">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvel article
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
              placeholder="Rechercher un article..."
              class="input"
            />
          </div>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>SKU</th>
                <th>Prix</th>
                <th>TVA</th>
                <th>Stock</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                <tr>
                  <td colspan="7" class="text-center text-gray-500 py-8">Chargement...</td>
                </tr>
              } @else {
                @for (article of articles(); track article.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="font-medium">{{ article.name }}</td>
                    <td>{{ article.sku || '—' }}</td>
                    <td>{{ formatAmount(article.unitPrice) }} MAD</td>
                    <td>{{ formatPercent(article.taxRate) }}</td>
                    <td>{{ article.isService ? '—' : (article.stockQty ?? 0) }}</td>
                    <td>{{ article.isService ? 'Service' : 'Produit' }}</td>
                    <td>
                      <div class="flex items-center space-x-3">
                        <a [routerLink]="['/articles', article.id, 'edit']" class="text-gray-600 hover:text-gray-900">
                          Modifier
                        </a>
                        <button (click)="deleteArticle(article.id)" class="text-red-600 hover:text-red-700">
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center text-gray-500 py-8">Aucun article</td>
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
        title="Supprimer l’article"
        message="Cette action est définitive."
        [busy]="loading()"
        (cancel)="closeDeleteModal()"
        (confirm)="confirmDelete()"
      />
    </div>
  `
})
export class ArticleListComponent implements OnInit {
  articles = this.articleService.articles;
  loading = signal(false);
  error = signal('');
  searchTerm = signal('');
  page = signal(1);
  pageSize = signal(10);
  showDeleteModal = signal(false);
  pendingDeleteId = signal<string | null>(null);

  constructor(private articleService: ArticleService) {}

  async ngOnInit() {
    await this.loadArticles();
  }

  async loadArticles() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.articleService.list({
        page: this.page(),
        limit: this.pageSize(),
        search: this.searchTerm() || undefined
      });
    } catch (err) {
      this.error.set('Impossible de charger les articles');
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange() {
    this.page.set(1);
    this.loadArticles();
  }

  async goToPage(page: number) {
    if (page < 1) return;
    this.page.set(page);
    await this.loadArticles();
  }

  deleteArticle(id: string) {
    this.pendingDeleteId.set(id);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
  }

  confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.articleService.delete(id).then(() => {
      this.closeDeleteModal();
      this.loadArticles();
    }).catch(() => {
      this.error.set('Impossible de supprimer l’article');
    });
  }

  totalPages = computed(() => {
    const total = this.articleService.totalCount();
    const size = this.pageSize();
    if (!total || size <= 0) return 1;
    return Math.max(1, Math.ceil(total / size));
  });

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatPercent(value?: number): string {
    if (value === undefined || value === null) return '—';
    const percent = value <= 1 ? value * 100 : value;
    return `${percent.toFixed(0)}%`;
  }
}
