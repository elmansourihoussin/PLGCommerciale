import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlatformTenantService } from '../../core/services/platform-tenant.service';

@Component({
  selector: 'app-platform-tenant-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Créer une entreprise</h1>
        <p class="text-sm text-gray-500 mt-1">Création d’un tenant sans utilisateur</p>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
          <input type="text" formControlName="name" class="input" required />
          @if (isControlRequired('name')) {
            <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
          }
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" formControlName="email" class="input" />
          @if (isControlError('email', 'email')) {
            <p class="text-xs text-red-600 mt-1">Email invalide</p>
          }
        </div>
        <div class="flex justify-end gap-3">
          <button type="button" class="btn-secondary" (click)="cancel()">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">Créer</button>
        </div>
      </form>
    </div>
  `
})
export class PlatformTenantCreateComponent {
  loading = signal(false);
  error = signal('');
  form: FormGroup;

  constructor(
    private platformTenantService: PlatformTenantService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email]
    });
  }

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
      const tenant = await this.platformTenantService.create({
        name: this.form.value.name,
        email: this.form.value.email || undefined
      });
      this.router.navigate(['/platform/tenants', tenant.id]);
    } catch {
      this.error.set('Impossible de créer l’entreprise');
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

  cancel() {
    this.router.navigate(['/platform/tenants']);
  }
}
