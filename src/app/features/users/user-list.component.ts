import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        @if (isAdmin()) {
          <a routerLink="/users/new" class="mt-4 sm:mt-0 btn-primary">
            <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvel utilisateur
          </a>
        }
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      @if (passwordUser()) {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Changer le mot de passe</h2>
            <button class="text-gray-500 hover:text-gray-700" (click)="cancelPasswordChange()">Annuler</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
              <input type="password" [(ngModel)]="passwordForm.password" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirmation *</label>
              <input type="password" [(ngModel)]="passwordForm.confirm" class="input" />
            </div>
            <div class="flex items-end">
              <button class="btn-primary w-full" (click)="submitPasswordChange()" [disabled]="loading()">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      }

      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                <tr>
                  <td colspan="5" class="text-center text-gray-500 py-8">Chargement...</td>
                </tr>
              } @else {
                @for (user of users(); track user.id) {
                  <tr>
                    <td class="font-medium">{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ getRoleLabel(user.role) }}</td>
                    <td>
                      <span [class]="user.isActive ? 'badge-success' : 'badge-danger'">
                        {{ user.isActive ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center space-x-3">
                        @if (isAdmin()) {
                          <a [routerLink]="['/users', user.id, 'edit']" class="text-gray-600 hover:text-gray-900">
                            Modifier
                          </a>
                          <button class="text-primary-600 hover:text-primary-700" (click)="openPasswordChange(user)">
                            Mot de passe
                          </button>
                          <button class="text-orange-600 hover:text-orange-700" (click)="toggleStatus(user)">
                            {{ user.isActive ? 'Désactiver' : 'Activer' }}
                          </button>
                          <button class="text-red-600 hover:text-red-700" (click)="deleteUser(user)">
                            Supprimer
                          </button>
                        } @else {
                          <span class="text-gray-400">—</span>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center text-gray-500 py-8">Aucun utilisateur</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal('');
  passwordUser = signal<User | null>(null);
  passwordForm = {
    password: '',
    confirm: ''
  };
  isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'owner' || role === 'admin';
  });

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    this.error.set('');
    try {
      const users = await this.userService.list();
      this.users.set(users);
    } catch (err) {
      this.error.set('Impossible de charger les utilisateurs');
    } finally {
      this.loading.set(false);
    }
  }

  getRoleLabel(role: User['role']): string {
    if (role === 'owner') return 'Super administrateur';
    if (role === 'admin') return 'Administrateur';
    return 'Gestionnaire';
  }

  openPasswordChange(user: User) {
    this.passwordUser.set(user);
    this.passwordForm = { password: '', confirm: '' };
  }

  cancelPasswordChange() {
    this.passwordUser.set(null);
    this.passwordForm = { password: '', confirm: '' };
  }

  async submitPasswordChange() {
    const target = this.passwordUser();
    if (!target) return;
    if (!this.passwordForm.password || this.passwordForm.password !== this.passwordForm.confirm) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.userService.updatePassword(target.id, { password: this.passwordForm.password });
      this.cancelPasswordChange();
    } catch (err) {
      this.error.set('Impossible de changer le mot de passe');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus(user: User) {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.userService.updateStatus(user.id, { isActive: !user.isActive });
      this.users.set(this.users().map(u => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
    } catch (err) {
      this.error.set('Impossible de mettre à jour le statut');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteUser(user: User) {
    if (!confirm(`Supprimer l'utilisateur ${user.name} ?`)) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.userService.delete(user.id);
      this.users.set(this.users().filter(u => u.id !== user.id));
    } catch (err) {
      this.error.set('Impossible de supprimer l’utilisateur');
    } finally {
      this.loading.set(false);
    }
  }
}
