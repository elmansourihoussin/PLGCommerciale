import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../core/services/client.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Client } from '../../core/models/client.model';
import { Invoice } from '../../core/models/invoice.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Client</h1>
          <p class="text-gray-600">{{ client()?.name }}</p>
        </div>
        <div class="flex items-center space-x-3">
          <a [routerLink]="['/clients', clientId(), 'edit']" class="btn-secondary">Modifier</a>
          <button class="btn-outline" (click)="goBack()">Retour</button>
        </div>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="card lg:col-span-3 space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Informations du client</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-600">Email</p>
              <p class="font-medium">{{ client()?.email || '—' }}</p>
            </div>
            <div>
              <p class="text-gray-600">Téléphone</p>
              <p class="font-medium">{{ client()?.phone || '—' }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-gray-600">Adresse</p>
              <p class="font-medium">{{ client()?.address || '—' }}</p>
            </div>
            <div>
              <p class="text-gray-600">Ville</p>
              <p class="font-medium">{{ client()?.city || '—' }}</p>
            </div>
            <div>
              <p class="text-gray-600">ICE</p>
              <p class="font-medium">{{ client()?.ice || '—' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            Factures du client ({{ client()?.invoicesCount ?? invoices().length }})
          </h2>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Titre</th>
                <th>Échéance</th>
                <th>Montant</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                <tr>
                  <td colspan="6" class="text-center text-gray-500 py-6">Chargement...</td>
                </tr>
              } @else {
                @for (invoice of invoices(); track invoice.id) {
                  <tr>
                    <td class="font-medium">{{ invoice.number }}</td>
                    <td>{{ invoice.title }}</td>
                    <td>{{ formatDate(invoice.dueDate) }}</td>
                    <td class="font-semibold">{{ formatAmount(invoice.total) }} MAD</td>
                    <td>
                      <span [class]="getStatusBadgeClass(invoice.status)">
                        {{ getStatusLabel(invoice.status) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <a [routerLink]="['/invoices', invoice.id]" class="text-primary-600 hover:text-primary-700">
                        Voir
                      </a>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center text-gray-500 py-6">Aucune facture</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  clientId = signal('');
  client = signal<Client | null>(null);
  invoices = signal<Invoice[]>([]);
  loading = signal(false);
  error = signal('');

  constructor(
    private clientService: ClientService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.clientId.set(id);
    await this.loadClient(id);
    await this.loadInvoices(id);
  }

  private async loadClient(id: string) {
    this.error.set('');
    try {
      const client = await this.clientService.getById(id);
      this.client.set(client);
    } catch (err) {
      this.error.set('Impossible de charger le client');
    }
  }

  private async loadInvoices(clientId: string) {
    this.loading.set(true);
    this.error.set('');
    try {
      const invoices = await this.invoiceService.list({ clientId, limit: 50 });
      this.invoices.set(invoices);
    } catch (err) {
      this.error.set('Impossible de charger les factures');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      paid: 'badge-success',
      unpaid: 'badge-warning',
      partially_paid: 'badge-info',
      overdue: 'badge-danger'
    };
    return classes[status] || 'badge-info';
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

  goBack() {
    this.router.navigate(['/clients']);
  }
}
