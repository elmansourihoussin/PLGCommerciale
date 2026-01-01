import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

type ReadFilter = '' | 'true' | 'false';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
          <p class="text-sm text-gray-500 mt-1">Suivez l’activité de votre compte</p>
        </div>
        <button class="btn-secondary mt-4 sm:mt-0" (click)="markAllRead()" [disabled]="loading()">
          Tout marquer lu
        </button>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="card">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <select [(ngModel)]="filterIsRead" (ngModelChange)="onFilterChange()" class="input sm:w-56">
            <option value="">Toutes</option>
            <option value="false">Non lues</option>
            <option value="true">Lues</option>
          </select>
        </div>

        <div class="space-y-3">
          @if (loading()) {
            <div class="text-center text-gray-500 py-8">Chargement...</div>
          } @else {
            @for (notif of notifications(); track notif.id) {
              <div class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow flex items-start gap-4">
                <div class="mt-1">
                  <span class="w-2.5 h-2.5 rounded-full block" [class.bg-red-500]="!notif.isRead" [class.bg-gray-300]="notif.isRead"></span>
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-gray-900">{{ notif.title }}</p>
                      @if (notif.message) {
                        <p class="text-sm text-gray-600 mt-1">{{ notif.message }}</p>
                      }
                    </div>
                    <div class="text-xs text-gray-400 whitespace-nowrap">
                      {{ formatDate(notif.createdAt) }}
                    </div>
                  </div>
                  <div class="mt-3 flex items-center gap-3">
                    @if (!notif.isRead) {
                      <button class="text-xs text-primary-600 hover:underline" (click)="markRead(notif.id)">
                        Marquer comme lu
                      </button>
                    } @else {
                      <span class="text-xs text-gray-400">Lu</span>
                    }
                    @if (getEntityLink(notif)) {
                      <a [routerLink]="getEntityLink(notif)" class="text-xs text-gray-600 hover:underline">
                        Voir
                      </a>
                    }
                  </div>
                </div>
              </div>
            } @empty {
              <div class="text-center text-gray-500 py-8">Aucune notification</div>
            }
          }
        </div>

        <div class="flex items-center justify-between pt-6">
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
    </div>
  `
})
export class NotificationListComponent implements OnInit {
  notifications = this.notificationService.notifications;
  loading = signal(false);
  error = signal('');
  page = signal(1);
  pageSize = signal(10);
  filterIsRead = signal<ReadFilter>('');
  totalPages = signal(1);

  constructor(private notificationService: NotificationService) {}

  async ngOnInit() {
    await this.loadNotifications();
  }

  async loadNotifications() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.notificationService.list({
        page: this.page(),
        limit: this.pageSize(),
        isRead: this.filterIsRead() === '' ? undefined : this.filterIsRead() === 'true'
      });
      this.totalPages.set(this.computeTotalPages());
    } catch {
      this.error.set('Impossible de charger les notifications');
    } finally {
      this.loading.set(false);
    }
  }

  onFilterChange() {
    this.page.set(1);
    this.loadNotifications();
  }

  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    await this.loadNotifications();
  }

  markRead(id: string) {
    this.notificationService.markRead(id).then(() => this.loadNotifications());
  }

  markAllRead() {
    this.notificationService.markAllRead().then(() => this.loadNotifications());
  }

  formatDate(date?: Date): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  getEntityLink(notif: { entityType?: string; entityId?: string }): string | null {
    if (!notif.entityType || !notif.entityId) return null;
    const type = notif.entityType.toLowerCase();
    if (type === 'invoice' || type === 'facture') {
      return `/invoices/${notif.entityId}`;
    }
    if (type === 'quote' || type === 'devis') {
      return `/quotes/${notif.entityId}/edit`;
    }
    if (type === 'cheque' || type === 'check') {
      return `/checks/${notif.entityId}/edit`;
    }
    return null;
  }

  private computeTotalPages(): number {
    const total = this.notificationService.totalCount();
    const size = this.pageSize();
    if (!total || size <= 0) return 1;
    return Math.max(1, Math.ceil(total / size));
  }
}
