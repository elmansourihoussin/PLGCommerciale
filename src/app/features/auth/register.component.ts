import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">FacturePro</h1>
          <p class="text-gray-600">Créez votre compte</p>
        </div>

        <div class="card">
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {{ error() }}
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                [(ngModel)]="companyName"
                name="companyName"
                required
                class="input"
                placeholder="Atelier Atlas"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                [(ngModel)]="phone"
                name="phone"
                required
                class="input"
                placeholder="0600000000"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email de l'entreprise</label>
              <input
                type="email"
                [(ngModel)]="companyEmail"
                name="companyEmail"
                required
                class="input"
                placeholder="contact@atlas.ma"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                [(ngModel)]="fullName"
                name="fullName"
                required
                class="input"
                placeholder="Owner Atlas"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                class="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                class="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span>Création en cours...</span>
              } @else {
                <span>Créer mon compte</span>
              }
            </button>

            <p class="text-center text-sm text-gray-600">
              Déjà un compte?
              <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
                Se connecter
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  companyName = '';
  phone = '';
  companyEmail = '';
  fullName = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.companyName || !this.phone || !this.companyEmail || !this.fullName || !this.password || !this.confirmPassword) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.register({
        companyName: this.companyName,
        phone: this.phone,
        companyEmail: this.companyEmail,
        password: this.password,
        fullName: this.fullName
      });
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set('Une erreur est survenue lors de la création du compte');
    } finally {
      this.loading.set(false);
    }
  }
}
