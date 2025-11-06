import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">Abonnement & Facturation</h1>

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

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <button class="btn-outline w-full" [disabled]="currentPlan() === 'free'">
              {{ currentPlan() === 'free' ? 'Plan actuel' : 'Choisir' }}
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
            <button class="btn-primary w-full" [disabled]="currentPlan() === 'pro'">
              {{ currentPlan() === 'pro' ? 'Plan actuel' : 'Upgrade' }}
            </button>
          </div>
        </div>

        <div class="card hover:shadow-lg transition-shadow">
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Entreprise</h3>
            <div class="text-3xl font-bold text-gray-900 mb-4">Sur mesure</div>
            <ul class="space-y-3 text-sm text-gray-600 mb-6">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Tout du plan Pro
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Multi-utilisateurs
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                API personnalisée
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Support dédié
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Formation incluse
              </li>
            </ul>
            <button class="btn-outline w-full">
              Nous contacter
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Historique de facturation</h2>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td>01/11/2025</td>
                <td>Plan Pro - Novembre 2025</td>
                <td class="font-semibold">199 MAD</td>
                <td><span class="badge-success">Payé</span></td>
                <td>
                  <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Télécharger
                  </button>
                </td>
              </tr>
              <tr>
                <td>01/10/2025</td>
                <td>Plan Pro - Octobre 2025</td>
                <td class="font-semibold">199 MAD</td>
                <td><span class="badge-success">Payé</span></td>
                <td>
                  <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Télécharger
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class BillingComponent {
  currentUser = this.authService.currentUser;

  constructor(private authService: AuthService) {}

  currentPlan(): string {
    return this.currentUser()?.subscription?.plan || 'free';
  }

  getPlanName(): string {
    const plans: Record<string, string> = {
      free: 'Gratuit',
      starter: 'Starter',
      pro: 'Pro',
      enterprise: 'Entreprise'
    };
    return plans[this.currentPlan()] || 'Gratuit';
  }

  getPlanPrice(): string {
    const prices: Record<string, string> = {
      free: '0 MAD',
      starter: '99 MAD',
      pro: '199 MAD',
      enterprise: 'Sur mesure'
    };
    return prices[this.currentPlan()] || '0 MAD';
  }

  getSubscriptionStatus(): string {
    const subscription = this.currentUser()?.subscription;
    if (!subscription) return 'Pas d\'abonnement actif';

    if (subscription.status === 'active') {
      if (subscription.expiresAt) {
        const expiresDate = new Date(subscription.expiresAt);
        return `Actif jusqu'au ${new Intl.DateTimeFormat('fr-FR').format(expiresDate)}`;
      }
      return 'Abonnement actif';
    }

    return 'Abonnement inactif';
  }
}
