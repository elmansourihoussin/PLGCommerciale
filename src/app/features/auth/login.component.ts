import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">FacturePro</h1>
          <p class="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <div class="card">
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {{ error() }}
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="input"
                placeholder="vous@exemple.com"
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

            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                <span class="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <a routerLink="/auth/reset-password" class="text-sm text-primary-600 hover:text-primary-700">
                Mot de passe oublié?
              </a>
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span>Connexion en cours...</span>
              } @else {
                <span>Se connecter</span>
              }
            </button>

            <p class="text-center text-sm text-gray-600">
              Pas encore de compte?
              <a routerLink="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
                Créer un compte
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set('Email ou mot de passe incorrect');
    } finally {
      this.loading.set(false);
    }
  }
}
