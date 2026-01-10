import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService, CreateUserPayload, UpdateUserPayload } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? 'Modifier l’utilisateur' : 'Nouvel utilisateur' }}
        </h1>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
              <input type="text" [(ngModel)]="formData.fullName" name="fullName" class="input" required #fullNameRef="ngModel" />
              @if (fullNameRef.invalid && fullNameRef.touched) {
                <p class="text-xs text-red-600 mt-1">Champ obligatoire</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" [(ngModel)]="formData.email" name="email" class="input" required #emailRef="ngModel" />
              @if (emailRef.invalid && emailRef.touched) {
                <p class="text-xs text-red-600 mt-1">Champ obligatoire</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
              <select [(ngModel)]="formData.role" name="role" class="input" required #roleRef="ngModel">
                <option value="OWNER">Super administrateur</option>
                <option value="ADMIN">Administrateur</option>
                <option value="AGENT">Gestionnaire</option>
              </select>
              @if (roleRef.invalid && roleRef.touched) {
                <p class="text-xs text-red-600 mt-1">Champ obligatoire</p>
              }
            </div>
            @if (!isEdit()) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                <input type="password" [(ngModel)]="formData.password" name="password" class="input" required #passwordRef="ngModel" />
                @if (passwordRef.invalid && passwordRef.touched) {
                  <p class="text-xs text-red-600 mt-1">Champ obligatoire</p>
                }
              </div>
            }
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="loading() || userForm.invalid">
            {{ isEdit() ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class UserFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  error = signal('');
  isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'owner' || role === 'admin';
  });

  formData: CreateUserPayload = {
    fullName: '',
    email: '',
    role: 'AGENT',
    password: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      await this.loadUser(id);
    }
  }

  async loadUser(id: string) {
    this.loading.set(true);
    this.error.set('');
    try {
      const users = await this.userService.list();
      const user = users.find(u => u.id === id);
      if (!user) {
        this.error.set('Utilisateur introuvable');
        return;
      }
      this.formData = {
        fullName: user.name,
        email: user.email,
        role: this.mapRoleToApi(user.role),
        password: ''
      };
    } catch (err) {
      this.error.set('Impossible de charger l’utilisateur');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(form: NgForm) {
    if (!this.isAdmin()) {
      this.error.set('Action non autorisée');
      return;
    }
    if (form.invalid) {
      form.form.markAllAsTouched();
      this.error.set('Veuillez remplir tous les champs obligatoires');
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.isEdit()) {
        const payload: UpdateUserPayload = {
          fullName: this.formData.fullName,
          email: this.formData.email,
          role: this.formData.role
        };
        await this.userService.update(this.route.snapshot.paramMap.get('id')!, payload);
      } else {
        await this.userService.create(this.formData);
      }
      this.router.navigate(['/users']);
    } catch (err) {
      this.error.set('Impossible d’enregistrer l’utilisateur');
    } finally {
      this.loading.set(false);
    }
  }

  mapRoleToApi(role: User['role']): CreateUserPayload['role'] {
    if (role === 'owner') return 'OWNER';
    if (role === 'admin') return 'ADMIN';
    return 'AGENT';
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
