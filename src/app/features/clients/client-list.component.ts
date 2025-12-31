import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
        <a routerLink="/clients/new" class="mt-4 sm:mt-0 btn-primary">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau client
        </a>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="card">
        <div class="mb-6">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            placeholder="Rechercher un client..."
            class="input"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @if (loading()) {
            <div class="col-span-full text-center py-12 text-gray-500">
              Chargement des clients...
            </div>
          } @else {
            @for (client of filteredClients(); track client.id) {
            <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-lg font-semibold text-primary-700">
                      {{ getInitials(client.name) }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <h3 class="font-semibold text-gray-900">{{ client.name }}</h3>
                    @if (client.ice) {
                      <p class="text-xs text-gray-500">ICE: {{ client.ice }}</p>
                    }
                  </div>
                </div>
              </div>

              <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  {{ client.email }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/>
                  </svg>
                  {{ client.invoicesCount ?? 0 }} factures
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  {{ client.phone }}
                </div>
                <div class="flex items-start">
                  <svg class="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="line-clamp-2">{{ client.address }} • {{ client.city }}</span>
                </div>
              </div>

              <div class="flex space-x-2 pt-3 border-t border-gray-200">
                <a [routerLink]="['/clients', client.id]" class="flex-1 btn-secondary text-sm text-center">
                  Voir
                </a>
                <a [routerLink]="['/clients', client.id, 'edit']" class="flex-1 btn-outline text-sm text-center">
                  Modifier
                </a>
                <button (click)="deleteClient(client.id)" class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            } @empty {
            <div class="col-span-full text-center py-12">
              <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <p class="text-gray-500">Aucun client trouvé</p>
            </div>
            }
          }
        </div>
      </div>

      <app-confirm-dialog
        [open]="showDeleteModal()"
        title="Supprimer le client"
        message="Cette action est définitive."
        [busy]="loading()"
        (cancel)="closeDeleteModal()"
        (confirm)="confirmDelete()"
      />
    </div>
  `
})
export class ClientListComponent implements OnInit {
  searchTerm = signal('');
  loading = signal(false);
  error = signal('');
  showDeleteModal = signal(false);
  pendingDeleteId = signal<string | null>(null);

  constructor(private clientService: ClientService) {}

  async ngOnInit() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.clientService.list();
    } catch (err) {
      this.error.set('Impossible de charger les clients');
    } finally {
      this.loading.set(false);
    }
  }

  filteredClients = computed(() => {
    let clients = this.clientService.clients();

    const search = this.searchTerm().toLowerCase();
    if (search) {
      clients = clients.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search)
      );
    }

    return clients.sort((a, b) => a.name.localeCompare(b.name));
  });

  onSearchChange() {
    this.searchTerm.set(this.searchTerm());
  }

  deleteClient(id: string) {
    this.pendingDeleteId.set(id);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
  }

  async confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;
    try {
      await this.clientService.delete(id);
      this.closeDeleteModal();
      await this.clientService.list();
    } catch (err) {
      this.error.set('Impossible de supprimer le client');
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
