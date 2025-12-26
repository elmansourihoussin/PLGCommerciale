import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckService } from '../../core/services/check.service';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-check-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier le chèque' : 'Nouveau chèque' }}
        </h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations du chèque</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <select [(ngModel)]="formData.clientId" name="clientId" class="input">
                <option value="">Sélectionner un client</option>
                @for (client of clients(); track client.id) {
                  <option [value]="client.id">{{ client.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bénéficiaire *</label>
              <input
                type="text"
                [(ngModel)]="formData.beneficiary"
                name="beneficiary"
                required
                class="input"
                placeholder="Nom du bénéficiaire"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Montant (MAD) *</label>
              <input
                type="number"
                [(ngModel)]="formData.amount"
                name="amount"
                required
                class="input"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                [(ngModel)]="formData.date"
                name="date"
                required
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom de la banque</label>
              <input
                type="text"
                [(ngModel)]="formData.bankName"
                name="bankName"
                class="input"
                placeholder="Ex: Attijariwafa Bank"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select [(ngModel)]="formData.status" name="status" class="input">
                <option value="pending">En attente</option>
                <option value="printed">Imprimé</option>
                <option value="cashed">Encaissé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              [(ngModel)]="formData.notes"
              name="notes"
              rows="3"
              class="input"
              placeholder="Notes additionnelles..."
            ></textarea>
          </div>
        </div>

        <div class="card bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Aperçu du chèque</h3>
          <div class="bg-white border-2 border-gray-300 rounded-lg p-6 font-mono">
            <div class="flex justify-between items-start mb-6">
              <div>
                <p class="text-xs text-gray-500">BANQUE</p>
                <p class="font-semibold">{{ formData.bankName || 'Nom de la banque' }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">DATE</p>
                <p class="font-semibold">{{ formatDate(formData.date) }}</p>
              </div>
            </div>

            <div class="mb-6">
              <p class="text-xs text-gray-500 mb-2">PAYEZ CONTRE CE CHÈQUE À L'ORDRE DE</p>
              <p class="text-lg font-bold border-b-2 border-gray-300 pb-2">
                {{ formData.beneficiary || '________________________' }}
              </p>
            </div>

            <div class="mb-6">
              <p class="text-xs text-gray-500 mb-2">LA SOMME DE</p>
              <p class="text-2xl font-bold border-b-2 border-gray-300 pb-2">
                {{ formData.amount ? formData.amount.toLocaleString() + ' MAD' : '____________ MAD' }}
              </p>
            </div>

            <div class="flex justify-end">
              <div class="text-center">
                <div class="border-t-2 border-gray-300 pt-2 px-8">
                  <p class="text-xs text-gray-500">SIGNATURE</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">
            Annuler
          </button>
          <button type="submit" class="btn-primary">
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

  formData: any = {
    clientId: '',
    beneficiary: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    bankName: '',
    status: 'pending',
    notes: ''
  };

  constructor(
    private checkService: CheckService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loadCheck(id);
    }
  }

  loadCheck(id: string) {
    const check = this.checkService.getById(id);
    if (check) {
      this.formData = {
        ...check,
        date: new Date(check.date).toISOString().split('T')[0]
      };
    }
  }

  async onSubmit() {
    if (!this.formData.beneficiary || !this.formData.amount) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    const client = this.formData.clientId
      ? await this.clientService.getById(this.formData.clientId)
      : null;
    const checkData = {
      clientId: this.formData.clientId,
      clientName: client?.name,
      beneficiary: this.formData.beneficiary,
      amount: this.formData.amount,
      date: new Date(this.formData.date),
      bankName: this.formData.bankName,
      status: this.formData.status,
      notes: this.formData.notes
    };

    if (this.isEdit()) {
      this.checkService.update(this.route.snapshot.paramMap.get('id')!, checkData);
    } else {
      this.checkService.create(checkData as any);
    }

    this.router.navigate(['/checks']);
  }

  goBack() {
    this.router.navigate(['/checks']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('fr-FR').format(new Date(dateString));
  }
}
