import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckService, CreateCheckPayload } from '../../core/services/check.service';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-check-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier le chèque' : 'Nouveau chèque' }}
        </h1>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations du chèque</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <select formControlName="clientId" class="input" required>
                <option value="">Sélectionner un client</option>
                @for (client of clients(); track client.id) {
                  <option [value]="client.id">{{ client.name }}</option>
                }
              </select>
              @if (isControlInvalid('clientId')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Montant (MAD) *</label>
              <input type="number" formControlName="amount" class="input" min="0" step="0.01" required />
              @if (isControlInvalid('amount')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date d'échéance *</label>
              <input type="date" formControlName="dueDate" class="input" required />
              @if (isControlInvalid('dueDate')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select formControlName="status" class="input">
                <option value="PENDING">En attente</option>
                <option value="CASHED">Encaissé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">
            Annuler
          </button>
          <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">
            {{ isEdit() ? 'Mettre à jour' : 'Créer le chèque' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class CheckFormComponent implements OnInit {
  isEdit = signal(false);
  clients = this.clientService.clients;
  loading = signal(false);
  error = signal('');

  form: FormGroup;

  constructor(
    private checkService: CheckService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      dueDate: [new Date().toISOString().split('T')[0], Validators.required],
      status: ['PENDING']
    });
  }

  async ngOnInit() {
    await this.clientService.list();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      await this.loadCheck(id);
    }
  }

  async loadCheck(id: string) {
    this.loading.set(true);
    this.error.set('');
    try {
      const check = await this.checkService.getById(id);
      this.form.patchValue({
        clientId: check.clientId,
        amount: check.amount,
        dueDate: new Date(check.dueDate).toISOString().split('T')[0],
        status: check.status
      });
    } catch {
      this.error.set('Impossible de charger le chèque');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    try {
      const payload = this.form.value as CreateCheckPayload;
      if (this.isEdit()) {
        await this.checkService.update(this.route.snapshot.paramMap.get('id')!, payload);
      } else {
        await this.checkService.create(payload);
      }
      this.router.navigate(['/checks']);
    } catch {
      this.error.set('Impossible d’enregistrer le chèque');
    } finally {
      this.loading.set(false);
    }
  }

  isControlInvalid(name: string): boolean {
    const control = this.form.get(name);
    return Boolean(control && control.invalid && control.touched);
  }

  goBack() {
    this.router.navigate(['/checks']);
  }
}
