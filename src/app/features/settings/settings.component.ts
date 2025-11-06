import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { Company } from '../../core/models/company.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">Paramètres</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div class="card sticky top-6">
            <nav class="space-y-1">
              <button
                (click)="activeTab = 'company'"
                [class]="activeTab === 'company' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'"
                class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Entreprise
              </button>
              <button
                (click)="activeTab = 'profile'"
                [class]="activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'"
                class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Mon profil
              </button>
            </nav>
          </div>
        </div>

        <div class="lg:col-span-2">
          @if (activeTab === 'company') {
            <form (ngSubmit)="saveCompany()" class="space-y-6">
              <div class="card">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations de l'entreprise</h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      [(ngModel)]="companyData.name"
                      name="companyName"
                      required
                      class="input"
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">ICE *</label>
                      <input
                        type="text"
                        [(ngModel)]="companyData.ice"
                        name="ice"
                        required
                        class="input"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">N° TVA</label>
                      <input
                        type="text"
                        [(ngModel)]="companyData.taxNumber"
                        name="taxNumber"
                        class="input"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        [(ngModel)]="companyData.email"
                        name="companyEmail"
                        required
                        class="input"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                      <input
                        type="tel"
                        [(ngModel)]="companyData.phone"
                        name="companyPhone"
                        required
                        class="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                    <input
                      type="text"
                      [(ngModel)]="companyData.address"
                      name="address"
                      required
                      class="input"
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                      <input
                        type="text"
                        [(ngModel)]="companyData.city"
                        name="city"
                        required
                        class="input"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Pays *</label>
                      <input
                        type="text"
                        [(ngModel)]="companyData.country"
                        name="country"
                        required
                        class="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                    <input
                      type="url"
                      [(ngModel)]="companyData.website"
                      name="website"
                      class="input"
                      placeholder="www.monentreprise.ma"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Mentions légales</label>
                    <textarea
                      [(ngModel)]="companyData.legalText"
                      name="legalText"
                      rows="3"
                      class="input"
                      placeholder="SARL au capital de 100.000 MAD - RC: 123456"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button type="submit" class="btn-primary">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          }

          @if (activeTab === 'profile') {
            <div class="card">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Mon profil</h2>
              <div class="space-y-4">
                <div class="flex items-center space-x-4 pb-6 border-b border-gray-200">
                  <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {{ getUserInitials() }}
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ currentUser()?.name }}</h3>
                    <p class="text-sm text-gray-600">{{ currentUser()?.email }}</p>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
                      {{ getRoleLabel() }}
                    </span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    [value]="currentUser()?.name"
                    readonly
                    class="input bg-gray-50"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    [value]="currentUser()?.email"
                    readonly
                    class="input bg-gray-50"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Membre depuis</label>
                  <input
                    type="text"
                    [value]="formatDate(currentUser()?.createdAt)"
                    readonly
                    class="input bg-gray-50"
                  />
                </div>

                <div class="pt-4">
                  <button class="btn-outline w-full">
                    Modifier le mot de passe
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  activeTab: 'company' | 'profile' = 'company';
  companyData: Partial<Company> = {};
  currentUser = this.authService.currentUser;

  constructor(
    private companyService: CompanyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const company = this.companyService.company();
    if (company) {
      this.companyData = { ...company };
    }
  }

  saveCompany() {
    this.companyService.update(this.companyData);
    alert('Les informations de l\'entreprise ont été enregistrées');
  }

  getUserInitials(): string {
    const name = this.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    const role = this.currentUser()?.role;
    return role === 'admin' ? 'Administrateur' : 'Utilisateur';
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
  }
}
