import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">FacturePro</h1>
          <p class="text-gray-600">Créez votre compte</p>
        </div>

        <div class="card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {{ error() }}
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                formControlName="companyName"
                class="input"
                placeholder="Atelier Atlas"
              />
              @if (isControlRequired('companyName')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                formControlName="phone"
                class="input"
                placeholder="0600000000"
              />
              @if (isControlRequired('phone')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              } @else if (isControlError('phone', 'pattern')) {
                <p class="text-xs text-red-600 mt-1">Téléphone invalide (format marocain)</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email de l'entreprise</label>
              <input
                type="email"
                formControlName="companyEmail"
                class="input"
                placeholder="contact@atlas.ma"
              />
              @if (isControlRequired('companyEmail')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              } @else if (isControlError('companyEmail', 'email')) {
                <p class="text-xs text-red-600 mt-1">Email invalide</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                formControlName="fullName"
                class="input"
                placeholder="Owner Atlas"
              />
              @if (isControlRequired('fullName')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
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

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                formControlName="confirmPassword"
                class="input"
                placeholder="••••••••"
              />
              @if (isControlRequired('confirmPassword')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              } @else if (form.get('confirmPassword')?.touched && form.get('confirmPassword')?.value && form.get('password')?.value && form.get('confirmPassword')?.value !== form.get('password')?.value) {
                <p class="text-xs text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading() || form.invalid || !passwordsMatch()"
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
  loading = signal(false);
  error = signal('');
  form: FormGroup;
  private phonePattern = /^(?:\+212|0)[5-7]\d{8}$/;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      companyEmail: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez remplir les champs obligatoires');
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const formValue = this.form.value;
      await this.authService.register({
        companyName: formValue.companyName,
        phone: formValue.phone,
        companyEmail: formValue.companyEmail,
        password: formValue.password,
        fullName: formValue.fullName
      });
      this.router.navigate(['/dashboard']);
    } catch {
      this.error.set('Une erreur est survenue lors de la création du compte');
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

  passwordsMatch(): boolean {
    return Boolean(this.form.get('password')?.value) && this.form.get('password')?.value === this.form.get('confirmPassword')?.value;
  }
}
