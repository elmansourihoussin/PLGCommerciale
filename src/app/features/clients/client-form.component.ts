import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier le client' : 'Nouveau client' }}
        </h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error() }}
          </div>
        }
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations du client</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
              <input
                type="text"
                formControlName="name"
                class="input"
                placeholder="Hassan Bennani"
              />
              @if (isControlRequired('name')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                formControlName="email"
                class="input"
                placeholder="hassan@example.com"
              />
              @if (isControlRequired('email')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              } @else if (isControlError('email', 'email')) {
                <p class="text-xs text-red-600 mt-1">Email invalide</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
              <input
                type="tel"
                formControlName="phone"
                class="input"
                placeholder="+212 6 12 34 56 78"
              />
              @if (isControlRequired('phone')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              } @else if (isControlError('phone', 'pattern')) {
                <p class="text-xs text-red-600 mt-1">Téléphone invalide (format marocain)</p>
              }
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
              <input
                type="text"
                formControlName="address"
                class="input"
                placeholder="12 Rue Mohammed V, Casablanca"
              />
              @if (isControlRequired('address')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
              <input
                type="text"
                formControlName="city"
                class="input"
                placeholder="Casablanca"
              />
              @if (isControlRequired('city')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ICE</label>
              <input
                type="text"
                formControlName="ice"
                class="input"
                placeholder="000123456000001"
              />
              @if (isControlError('ice', 'pattern')) {
                <p class="text-xs text-red-600 mt-1">ICE invalide (15 chiffres)</p>
              }
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">
            Annuler
          </button>
          <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">
            @if (loading()) {
              <span>Enregistrement...</span>
            } @else {
              <span>{{ isEdit() ? 'Mettre à jour' : 'Créer le client' }}</span>
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  error = signal('');

  form: FormGroup;

  private phonePattern = /^(?:\+212|0)[5-7]\d{8}$/;
  private icePattern = /^\d{15}$/;

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      ice: ['', Validators.pattern(this.icePattern)]
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      await this.loadClient(id);
    }
  }

  async loadClient(id: string) {
    this.loading.set(true);
    this.error.set('');
    try {
      const client = await this.clientService.getById(id);
      this.form.patchValue({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        ice: client.ice ?? ''
      });
    } catch {
      this.error.set('Impossible de charger le client');
    } finally {
      this.loading.set(false);
    }
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
      if (this.isEdit()) {
        await this.clientService.update(this.route.snapshot.paramMap.get('id')!, this.form.value);
      } else {
        await this.clientService.create(this.form.value);
      }
      this.router.navigate(['/clients']);
    } catch {
      this.error.set(this.isEdit() ? 'Impossible de mettre à jour le client' : 'Impossible de créer le client');
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

  goBack() {
    this.router.navigate(['/clients']);
  }
}
