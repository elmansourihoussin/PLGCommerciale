import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserListComponent } from '../users/user-list.component';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { Company } from '../../core/models/company.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, UserListComponent],
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
              @if (isAdmin()) {
                <button
                  (click)="activeTab = 'users'"
                  [class]="activeTab === 'users' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'"
                  class="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 11-8 0 4 4 0 018 0zm0 10c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/>
                  </svg>
                  Utilisateurs
                </button>
              }
            </nav>
          </div>
        </div>

        <div class="lg:col-span-2">
          @if (activeTab === 'company') {
            <form (ngSubmit)="saveCompany()" class="space-y-6">
              @if (companyError()) {
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {{ companyError() }}
                </div>
              }
              @if (companySuccess()) {
                <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {{ companySuccess() }}
                </div>
              }
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
                <button type="submit" class="btn-primary" [disabled]="companyLoading() || !isCompanyFormValid()">
                  @if (companyLoading()) {
                    <span>Enregistrement...</span>
                  } @else {
                    <span>Enregistrer les modifications</span>
                  }
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
                  <button class="btn-outline w-full" (click)="showPasswordForm.set(!showPasswordForm())">
                    @if (showPasswordForm()) {
                      <span>Masquer le mot de passe</span>
                    } @else {
                      <span>Modifier le mot de passe</span>
                    }
                  </button>
                </div>

                @if (showPasswordForm()) {
                  <div class="pt-4">
                    @if (passwordError()) {
                      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {{ passwordError() }}
                      </div>
                    }
                    @if (passwordSuccess()) {
                      <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {{ passwordSuccess() }}
                      </div>
                    }
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                        <input
                          type="password"
                          [(ngModel)]="passwordForm.currentPassword"
                          name="currentPassword"
                          class="input"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                        <input
                          type="password"
                          [(ngModel)]="passwordForm.newPassword"
                          name="newPassword"
                          class="input"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                        <input
                          type="password"
                          [(ngModel)]="passwordForm.confirmPassword"
                          name="confirmPassword"
                          class="input"
                        />
                      </div>
                      <button class="btn-outline w-full" [disabled]="passwordLoading()" (click)="changeMyPassword()">
                        @if (passwordLoading()) {
                          <span>Enregistrement...</span>
                        } @else {
                          <span>Changer le mot de passe</span>
                        }
                      </button>
                    </div>
                  </div>
                }

              </div>
            </div>
          }

          @if (activeTab === 'users' && isAdmin()) {
            <app-user-list />
          }
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  activeTab: 'company' | 'profile' | 'users' = 'company';
  companyData: Partial<Company> = {};
  currentUser = this.authService.currentUser;
  companyLoading = signal(false);
  companyError = signal('');
  companySuccess = signal('');
  passwordLoading = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');
  showPasswordForm = signal(true);
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'owner' || role === 'admin';
  });

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    await this.refreshCompany();
  }

  async saveCompany() {
    if (!this.isCompanyFormValid()) {
      this.companyError.set('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.companyLoading.set(true);
    this.companyError.set('');
    this.companySuccess.set('');
    try {
      const company = await this.companyService.update(this.companyData);
      this.companyData = { ...company };
      this.companySuccess.set('Les informations de l\'entreprise ont été enregistrées');
    } catch (error) {
      this.companyError.set('Impossible d\'enregistrer les informations de l\'entreprise');
    } finally {
      this.companyLoading.set(false);
    }
  }

  private async refreshCompany() {
    this.companyLoading.set(true);
    this.companyError.set('');
    try {
      const company = await this.companyService.refresh();
      if (company) {
        this.companyData = { ...company };
      }
    } catch (error) {
      this.companyError.set('Impossible de charger les informations de l\'entreprise');
    } finally {
      this.companyLoading.set(false);
    }
  }

  isCompanyFormValid(): boolean {
    const requiredFields: Array<keyof Company> = [
      'name',
      'ice',
      'email',
      'phone',
      'address',
      'city',
      'country'
    ];

    return requiredFields.every((field) => {
      const value = this.companyData[field];
      return typeof value === 'string' && value.trim().length > 0;
    });
  }

  getUserInitials(): string {
    const name = this.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    const role = this.currentUser()?.role;
    if (role === 'admin') {
      return 'Administrateur';
    }
    if (role === 'owner') {
      return 'Propriétaire';
    }
    return 'Utilisateur';
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
  }

  async changeMyPassword() {
    if (!this.passwordForm.newPassword || this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.set('Les mots de passe ne correspondent pas');
      return;
    }
    this.passwordLoading.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');
    try {
      await this.userService.changeMyPassword({
        password: this.passwordForm.newPassword,
        currentPassword: this.passwordForm.currentPassword || undefined
      });
      this.passwordSuccess.set('Mot de passe mis à jour');
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (error) {
      this.passwordError.set('Impossible de changer le mot de passe');
    } finally {
      this.passwordLoading.set(false);
    }
  }
}
