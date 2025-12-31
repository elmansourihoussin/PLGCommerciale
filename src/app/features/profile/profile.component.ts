import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">Mon profil</h1>

      <div class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
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
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Mot de passe</h2>
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
              <input type="password" [(ngModel)]="passwordForm.currentPassword" name="currentPassword" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input type="password" [(ngModel)]="passwordForm.newPassword" name="newPassword" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input type="password" [(ngModel)]="passwordForm.confirmPassword" name="confirmPassword" class="input" />
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
      </div>
    </div>
  `
})
export class ProfileComponent {
  currentUser = this.authService.currentUser;
  passwordLoading = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');
  showPasswordForm = signal(true);
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  getUserInitials(): string {
    const name = this.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    const role = this.currentUser()?.role;
    if (role === 'owner') return 'Super administrateur';
    if (role === 'admin') return 'Administrateur';
    return 'Gestionnaire';
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    const parsed = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(parsed);
  }

  async changeMyPassword() {
    if (!this.passwordForm.currentPassword) {
      this.passwordError.set('Le mot de passe actuel est obligatoire');
      return;
    }
    if (!this.passwordForm.newPassword || this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.set('Les mots de passe ne correspondent pas');
      return;
    }
    this.passwordLoading.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');
    try {
      await this.userService.changeMyPassword({
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword
      });
      this.passwordSuccess.set('Mot de passe mis à jour');
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      alert('Mot de passe modifié. Veuillez vous reconnecter.');
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.passwordError.set('Impossible de changer le mot de passe');
    } finally {
      this.passwordLoading.set(false);
    }
  }
}
