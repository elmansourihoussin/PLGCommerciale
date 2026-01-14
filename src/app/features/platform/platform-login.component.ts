import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlatformAuthService } from '../../core/services/platform-auth.service';

@Component({
  selector: 'app-platform-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Platform Admin</h1>
          <p class="text-sm text-gray-500 mt-2">Accès réservé à l’administration</p>
        </div>

        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" formControlName="email" class="input" required />
            @if (isControlRequired('email')) {
              <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
            } @else if (isControlError('email', 'email')) {
              <p class="text-xs text-red-600 mt-1">Email invalide</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input type="password" formControlName="password" class="input" required />
            @if (isControlRequired('password')) {
              <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
            }
          </div>
          <button type="submit" class="btn-primary w-full" [disabled]="loading() || form.invalid">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  `
})
export class PlatformLoginComponent {
  loading = signal(false);
  error = signal('');
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private platformAuthService: PlatformAuthService,
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
      await this.platformAuthService.login({
        email: this.form.value.email || '',
        password: this.form.value.password || ''
      });
      this.router.navigate(['/platform/tenants']);
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
