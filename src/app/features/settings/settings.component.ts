import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserListComponent } from '../users/user-list.component';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { Company } from '../../core/models/company.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserListComponent],
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
            <form [formGroup]="companyForm" (ngSubmit)="saveCompany()" class="space-y-6">
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
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">Logo de l'entreprise</h2>
                    <p class="text-sm text-gray-600">Ajoutez un logo qui s'affichera au-dessus du menu.</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <input
                      #logoInput
                      type="file"
                      accept="image/*"
                      class="hidden"
                      (change)="onLogoSelected($event)"
                    />
                    <button type="button" class="btn-outline" (click)="logoInput.click()" [disabled]="logoLoading()">
                      @if (logoLoading()) {
                        <span>Envoi...</span>
                      } @else {
                        <span>Ajouter un logo</span>
                      }
                    </button>
                  </div>
                </div>
                @if (logoError()) {
                  <div class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {{ logoError() }}
                  </div>
                }
                @if (logoSuccess()) {
                  <div class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {{ logoSuccess() }}
                  </div>
                }
                <div class="mt-4 flex items-center gap-4">
                  <div class="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    @if (logoPreviewUrl()) {
                      <img [src]="logoPreviewUrl()" alt="Logo de l'entreprise" class="w-full h-full object-contain" />
                    } @else if (company()?.logo) {
                      <img [src]="company()?.logo" alt="Logo de l'entreprise" class="w-full h-full object-contain" />
                    } @else {
                      <span class="text-xs text-gray-400">Aucun logo</span>
                    }
                  </div>
                  <div class="text-sm text-gray-600">
                    Formats supportés : PNG, JPG, SVG.
                  </div>
                </div>
              </div>
              <div class="card">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations de l'entreprise</h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise *</label>
                    <input type="text" formControlName="name" class="input" />
                    @if (isCompanyInvalid('name')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    }
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">ICE *</label>
                    <input type="text" formControlName="ice" class="input" />
                    @if (isCompanyInvalid('ice')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    } @else if (isCompanyError('ice', 'pattern')) {
                      <p class="text-xs text-red-600 mt-1">ICE invalide (15 chiffres)</p>
                    }
                  </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">N° TVA</label>
                      <input type="text" formControlName="taxNumber" class="input" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input type="email" formControlName="email" class="input" />
                    @if (isCompanyInvalid('email')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    } @else if (isCompanyError('email', 'email')) {
                      <p class="text-xs text-red-600 mt-1">Email invalide</p>
                    }
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input type="tel" formControlName="phone" class="input" />
                    @if (isCompanyInvalid('phone')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    } @else if (isCompanyError('phone', 'pattern')) {
                      <p class="text-xs text-red-600 mt-1">Téléphone invalide (format marocain)</p>
                    }
                  </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                    <input type="text" formControlName="address" class="input" />
                    @if (isCompanyInvalid('address')) {
                      <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                    }
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                      <input type="text" formControlName="city" class="input" />
                      @if (isCompanyInvalid('city')) {
                        <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                      }
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Pays *</label>
                      <input type="text" formControlName="country" class="input" />
                      @if (isCompanyInvalid('country')) {
                        <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                      }
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                    <input type="url" formControlName="website" class="input" placeholder="www.monentreprise.ma" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Mentions légales</label>
                    <textarea formControlName="legalText" rows="3" class="input" placeholder="SARL au capital de 100.000 MAD - RC: 123456"></textarea>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button type="submit" class="btn-primary" [disabled]="companyLoading() || companyForm.invalid">
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
                  <input type="text" [value]="currentUser()?.name" readonly class="input bg-gray-50" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" [value]="currentUser()?.email" readonly class="input bg-gray-50" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Membre depuis</label>
                  <input type="text" [value]="formatDate(currentUser()?.createdAt)" readonly class="input bg-gray-50" />
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
                  <form [formGroup]="passwordForm" (ngSubmit)="changeMyPassword()" class="pt-4">
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
                        <input type="password" formControlName="currentPassword" class="input" />
                        @if (isPasswordInvalid('currentPassword')) {
                          <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                        }
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                        <input type="password" formControlName="newPassword" class="input" />
                        @if (isPasswordInvalid('newPassword')) {
                          <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                        }
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                        <input type="password" formControlName="confirmPassword" class="input" />
                        @if (isPasswordInvalid('confirmPassword')) {
                          <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                        } @else if (passwordForm.get('confirmPassword')?.touched && !passwordsMatch()) {
                          <p class="text-xs text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
                        }
                      </div>
                      <button type="submit" class="btn-outline w-full" [disabled]="passwordLoading() || passwordForm.invalid || !passwordsMatch()">
                        @if (passwordLoading()) {
                          <span>Enregistrement...</span>
                        } @else {
                          <span>Changer le mot de passe</span>
                        }
                      </button>
                    </div>
                  </form>
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
export class SettingsComponent implements OnInit, OnDestroy {
  activeTab: 'company' | 'profile' | 'users' = 'company';
  currentUser = this.authService.currentUser;
  company = this.companyService.company;
  companyLoading = signal(false);
  companyError = signal('');
  companySuccess = signal('');
  logoLoading = signal(false);
  logoError = signal('');
  logoSuccess = signal('');
  logoPreviewUrl = signal('');
  passwordLoading = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');
  showPasswordForm = signal(true);

  companyForm: FormGroup;
  passwordForm: FormGroup;

  isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'owner' || role === 'admin';
  });

  private phonePattern = /^(?:\+212|0)[5-7]\d{8}$/;
  private icePattern = /^\d{15}$/;
  private logoObjectUrl: string | null = null;

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      ice: ['', [Validators.required, Validators.pattern(this.icePattern)]],
      taxNumber: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      website: [''],
      legalText: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.refreshCompany();
  }

  ngOnDestroy() {
    this.revokeLogoPreview();
  }

  async saveCompany() {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      this.companyError.set('Veuillez remplir les champs obligatoires');
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    this.companyLoading.set(true);
    this.companyError.set('');
    this.companySuccess.set('');
    try {
      const company = await this.companyService.update(this.companyForm.value);
      this.companyForm.patchValue({ ...company });
      this.companySuccess.set('Les informations de l\'entreprise ont été enregistrées');
    } catch {
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
        this.companyForm.patchValue({ ...company });
      }
    } catch {
      this.companyError.set('Impossible de charger les informations de l\'entreprise');
    } finally {
      this.companyLoading.set(false);
    }
  }


  getUserInitials(): string {
    const name = this.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    const role = this.currentUser()?.role;
    if (role === 'owner') {
      return 'Super administrateur';
    }
    if (role === 'admin') {
      return 'Administrateur';
    }
    return 'Gestionnaire';
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
  }

  async changeMyPassword() {
    if (this.passwordForm.invalid || !this.passwordsMatch()) {
      this.passwordForm.markAllAsTouched();
      this.passwordError.set('Veuillez remplir les champs obligatoires');
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    this.passwordLoading.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');
    try {
      await this.userService.changeMyPassword({
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      });
      this.passwordSuccess.set('Mot de passe mis à jour');
      this.passwordForm.reset();
      alert('Mot de passe modifié. Veuillez vous reconnecter.');
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch {
      this.passwordError.set('Impossible de changer le mot de passe');
    } finally {
      this.passwordLoading.set(false);
    }
  }

  isCompanyInvalid(name: string): boolean {
    const control = this.companyForm.get(name);
    return Boolean(control && control.touched && control.hasError('required'));
  }

  isCompanyError(name: string, error: string): boolean {
    const control = this.companyForm.get(name);
    return Boolean(control && control.touched && control.hasError(error));
  }

  isPasswordInvalid(name: string): boolean {
    const control = this.passwordForm.get(name);
    return Boolean(control && control.invalid && control.touched);
  }

  passwordsMatch(): boolean {
    return this.passwordForm.value.newPassword === this.passwordForm.value.confirmPassword;
  }

  async onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.logoError.set('');
    this.logoSuccess.set('');

    if (!file.type.startsWith('image/')) {
      this.logoError.set('Veuillez sélectionner une image.');
      input.value = '';
      return;
    }

    this.setLogoPreview(file);
    this.logoLoading.set(true);
    try {
      await this.companyService.uploadLogo(file);
      this.logoSuccess.set('Logo mis à jour');
      this.logoPreviewUrl.set('');
      this.revokeLogoPreview();
    } catch {
      this.logoError.set('Impossible de mettre à jour le logo');
    } finally {
      this.logoLoading.set(false);
      input.value = '';
    }
  }

  private setLogoPreview(file: File) {
    this.revokeLogoPreview();
    this.logoObjectUrl = URL.createObjectURL(file);
    this.logoPreviewUrl.set(this.logoObjectUrl);
  }

  private revokeLogoPreview() {
    if (this.logoObjectUrl) {
      URL.revokeObjectURL(this.logoObjectUrl);
      this.logoObjectUrl = null;
    }
  }

}
