import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">FacturePro</h1>
          <p class="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <div class="card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {{ error() }}
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

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                formControlName="password"
                class="input"
                placeholder="••••••••"
              />
              @if (isControlRequired('password')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading() || form.invalid"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span>Connexion...</span>
              } @else {
                <span>Se connecter</span>
              }
            </button>

            <div class="flex items-center justify-between text-sm">
              <a routerLink="/auth/reset-password" class="text-primary-600 hover:text-primary-700 font-medium">
                Mot de passe oublié ?
              </a>
              <a routerLink="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
                Créer un compte
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loading = signal(false);
  error = signal('');
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private authService: AuthService,
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

    try {
      await this.authService.login(
        this.form.value.email || '',
        this.form.value.password || ''
      );
      this.router.navigate(['/dashboard']);
    } catch {
      this.error.set('Identifiants invalides');
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
