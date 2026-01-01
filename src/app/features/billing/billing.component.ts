import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService, Subscription, SubscriptionHistoryEntry } from '../../core/services/billing.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">Abonnement & Facturation</h1>
      @if (planMessage()) {
        <div class="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg">
          <svg class="w-5 h-5 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p>{{ planMessage() }}</p>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <div class="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90">Plan actuel</p>
            <h2 class="text-3xl font-bold mt-1">{{ getPlanName() }}</h2>
            <p class="text-sm mt-2 opacity-90">
              {{ getSubscriptionStatus() }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-4xl font-bold">{{ getPlanPrice() }}</div>
            <p class="text-sm opacity-90">par mois</p>
          </div>
        </div>
        
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div class="card hover:shadow-lg transition-shadow">
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Gratuit</h3>
            <div class="text-3xl font-bold text-gray-900 mb-4">0 MAD</div>
            <ul class="space-y-3 text-sm text-gray-600 mb-6">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                5 devis par mois
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                5 factures par mois
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                10 clients max
              </li>
            </ul>
            <button class="btn-outline w-full" [disabled]="currentPlan() === 'FREE' || loading()" (click)="openPlanModal('FREE')">
              {{ currentPlan() === 'FREE' ? 'Plan actuel' : 'Choisir' }}
            </button>
          </div>
        </div>

        <div class="card hover:shadow-lg transition-shadow border-2 border-primary-500 relative">
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span class="bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
              POPULAIRE
            </span>
          </div>
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
            <div class="text-3xl font-bold text-gray-900 mb-4">199 MAD</div>
            <ul class="space-y-3 text-sm text-gray-600 mb-6">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Devis illimités
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Factures illimitées
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Clients illimités
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Export PDF personnalisé
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Support prioritaire
              </li>
            </ul>
            <button class="btn-primary w-full" [disabled]="currentPlan() === 'PRO' || loading()" (click)="openPlanModal('PRO')">
              {{ currentPlan() === 'PRO' ? 'Plan actuel' : 'Upgrade' }}
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Historique d’abonnement</h2>

        @if (historyError()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ historyError() }}
          </div>
        }

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Statut</th>
                <th>Action</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (historyLoading()) {
                <tr>
                  <td colspan="5" class="text-center text-gray-500 py-8">Chargement...</td>
                </tr>
              } @else {
                @for (entry of history(); track entry.id) {
                  <tr>
                    <td>{{ formatDate(entry.createdAt) }}</td>
                    <td class="font-medium">{{ getPlanLabel(entry.plan) }}</td>
                    <td>{{ getStatusLabel(entry.status) }}</td>
                    <td>{{ entry.action || '—' }}</td>
                    <td>{{ entry.note || '—' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center text-gray-500 py-8">Aucun historique</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between pt-4">
          <p class="text-sm text-gray-600">
            Page {{ historyPage() }} sur {{ historyTotalPages() }}
          </p>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              class="btn-secondary"
              [disabled]="historyPage() <= 1 || historyLoading()"
              (click)="goToHistoryPage(historyPage() - 1)"
            >
              Précédent
            </button>
            <button
              type="button"
              class="btn-secondary"
              [disabled]="historyPage() >= historyTotalPages() || historyLoading()"
              (click)="goToHistoryPage(historyPage() + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      @if (showPlanModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50"></div>
          <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h3 class="text-lg font-semibold text-gray-900">
              Passer au plan {{ getPlanLabel(selectedPlan()) }} ?
            </h3>
            <p class="text-sm text-gray-600 mt-2">
              Confirmez-vous ce changement d’abonnement ?
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button type="button" class="btn-secondary" (click)="closePlanModal()">
                Annuler
              </button>
              <button type="button" class="btn-primary" [disabled]="loading()" (click)="confirmPlanChange()">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BillingComponent implements OnInit {
  subscription = signal<Subscription>({ plan: 'FREE', status: 'INACTIVE' });
  loading = signal(false);
  error = signal('');
  planMessage = signal('');
  history = signal<SubscriptionHistoryEntry[]>([]);
  historyLoading = signal(false);
  historyError = signal('');
  historyPage = signal(1);
  historyPageSize = signal(10);
  historyTotalPages = signal(1);
  showPlanModal = signal(false);
  selectedPlan = signal<Subscription['plan']>('FREE');

  constructor(private billingService: BillingService) {}

  async ngOnInit() {
    await Promise.all([this.loadSubscription(), this.loadHistory()]);
  }

  async loadSubscription() {
    this.loading.set(true);
    this.error.set('');
    try {
      const subscription = await this.billingService.getSubscription();
      this.subscription.set(subscription);
    } catch {
      this.error.set('Impossible de charger l’abonnement');
    } finally {
      this.loading.set(false);
    }
  }

  async changePlan(plan: Subscription['plan']) {
    this.loading.set(true);
    this.error.set('');
    this.planMessage.set('');
    try {
      const response = await this.billingService.updateSubscription({
        plan,
        status: 'ACTIVE'
      });
      this.subscription.set(response.subscription);
      if (response.message || response.note) {
        this.planMessage.set(response.message ?? response.note ?? '');
      }
      await this.loadHistory();
    } catch {
      this.error.set('Impossible de modifier l’abonnement');
    } finally {
      this.loading.set(false);
    }
  }

  currentPlan(): Subscription['plan'] {
    return this.subscription().plan;
  }

  getPlanName(): string {
    const plans: Record<string, string> = {
      FREE: 'Gratuit',
      STARTER: 'Starter',
      PRO: 'Pro',
      ENTERPRISE: 'Entreprise'
    };
    return plans[this.currentPlan()] ?? 'Gratuit';
  }

  getPlanPrice(): string {
    const prices: Record<string, string> = {
      FREE: '0 MAD',
      STARTER: '99 MAD',
      PRO: '199 MAD',
      ENTERPRISE: 'Sur mesure'
    };
    return prices[this.currentPlan()] ?? '0 MAD';
  }

  getSubscriptionStatus(): string {
    const status = this.subscription().status;
    if (status === 'ACTIVE') return 'Abonnement actif';
    if (status === 'CANCELLED') return 'Abonnement annulé';
    return 'Abonnement inactif';
  }

  openPlanModal(plan: Subscription['plan']) {
    this.selectedPlan.set(plan);
    this.showPlanModal.set(true);
  }

  closePlanModal() {
    this.showPlanModal.set(false);
  }

  async confirmPlanChange() {
    const plan = this.selectedPlan();
    this.closePlanModal();
    await this.changePlan(plan);
  }

  async loadHistory() {
    this.historyLoading.set(true);
    this.historyError.set('');
    try {
      const response = await this.billingService.getHistory({
        page: this.historyPage(),
        limit: this.historyPageSize()
      });
      this.history.set(response.entries);
      this.historyTotalPages.set(response.meta?.totalPages ?? 1);
    } catch {
      this.historyError.set('Impossible de charger l’historique');
    } finally {
      this.historyLoading.set(false);
    }
  }

  async goToHistoryPage(page: number) {
    if (page < 1 || page > this.historyTotalPages()) return;
    this.historyPage.set(page);
    await this.loadHistory();
  }

  formatDate(date?: Date): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  getPlanLabel(plan: Subscription['plan']): string {
    return this.getPlanNameFromValue(plan);
  }

  getStatusLabel(status: Subscription['status']): string {
    if (status === 'ACTIVE') return 'Actif';
    if (status === 'CANCELLED') return 'Annulé';
    return 'Inactif';
  }

  private getPlanNameFromValue(plan: Subscription['plan']): string {
    const plans: Record<Subscription['plan'], string> = {
      FREE: 'Gratuit',
      STARTER: 'Starter',
      PRO: 'Pro',
      ENTERPRISE: 'Entreprise'
    };
    return plans[plan] ?? 'Gratuit';
  }
}
