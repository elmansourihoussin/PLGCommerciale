import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier le client' : 'Nouveau client' }}
        </h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations du client</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                required
                class="input"
                placeholder="Hassan Bennani"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                name="email"
                required
                class="input"
                placeholder="hassan@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
              <input
                type="tel"
                [(ngModel)]="formData.phone"
                name="phone"
                required
                class="input"
                placeholder="+212 6 12 34 56 78"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
              <input
                type="text"
                [(ngModel)]="formData.address"
                name="address"
                required
                class="input"
                placeholder="12 Rue Mohammed V, Casablanca"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ICE</label>
              <input
                type="text"
                [(ngModel)]="formData.ice"
                name="ice"
                class="input"
                placeholder="000123456000001"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">
            Annuler
          </button>
          <button type="submit" class="btn-primary">
            {{ isEdit() ? 'Mettre à jour' : 'Créer le client' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  isEdit = signal(false);

  formData: any = {
    name: '',
    email: '',
    phone: '',
    address: '',
    ice: ''
  };

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loadClient(id);
    }
  }

  loadClient(id: string) {
    const client = this.clientService.getById(id);
    if (client) {
      this.formData = { ...client };
    }
  }

  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.phone || !this.formData.address) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    if (this.isEdit()) {
      this.clientService.update(this.route.snapshot.paramMap.get('id')!, this.formData);
    } else {
      this.clientService.create(this.formData);
    }

    this.router.navigate(['/clients']);
  }

  goBack() {
    this.router.navigate(['/clients']);
  }
}
