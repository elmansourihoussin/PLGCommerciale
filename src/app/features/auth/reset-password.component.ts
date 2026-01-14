import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Réinitialiser le mot de passe</h1>
          <p class="text-gray-600">Recevez un lien de réinitialisation par email</p>
        </div>

        <div class="card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {{ error() }}
              </div>
            }

            @if (success()) {
              <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {{ success() }}
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                class="input"
                placeholder="owner@atlas.ma"
              />
              @if (isControlRequired('email')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              } @else if (isControlError('email', 'email')) {
                <p class="text-xs text-red-600 mt-1">Email invalide</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading() || form.invalid"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span>Envoi en cours...</span>
              } @else {
                <span>Envoyer le lien</span>
              }
            </button>

            <a routerLink="/auth/login" class="btn-primary w-full block text-center">
              Retour à la connexion
            </a>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  loading = signal(false);
  error = signal('');
  success = signal('');
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {}

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez remplir les champs obligatoires');
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    try {
      this.success.set('Un email de réinitialisation a été envoyé');
    } catch {
      this.error.set('Impossible d\'envoyer l\'email');
    } finally {
      this.loading.set(false);
    }
  }

  isControlRequired(name: string): boolean {
    const control = this.form.get(name);
    return Boolean(control && control.touched && control.hasError('required'));
  }

  isControlError(name: string, error: string): boolean {
    const control = this.form.get(name);
    return Boolean(control && control.touched && control.hasError(error));
  }
}
