import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
          <p class="text-gray-600">Entrez votre email pour réinitialiser votre mot de passe</p>
        </div>

        <div class="card">
          @if (success()) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              Un email de réinitialisation a été envoyé à votre adresse
            </div>
            <a routerLink="/auth/login" class="btn-primary w-full block text-center">
              Retour à la connexion
            </a>
          } @else {
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

              <button
                type="submit"
                [disabled]="loading()"
                class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (loading()) {
                  <span>Envoi en cours...</span>
                } @else {
                  <span>Envoyer le lien</span>
                }
              </button>

              <p class="text-center text-sm text-gray-600">
                <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
                  Retour à la connexion
                </a>
              </p>
            </form>
          }
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  email = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email) {
      this.error.set('Veuillez entrer votre email');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.resetPassword(this.email);
      this.success.set(true);
    } catch (err) {
      this.error.set('Une erreur est survenue');
    } finally {
      this.loading.set(false);
    }
  }
}
