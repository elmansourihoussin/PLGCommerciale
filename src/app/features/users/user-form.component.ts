import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, CreateUserPayload, UpdateUserPayload } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
              <input type="text" formControlName="fullName" class="input" required />
              @if (isControlRequired('fullName')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" formControlName="email" class="input" required />
              @if (isControlRequired('email')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              } @else if (isControlError('email', 'email')) {
                <p class="text-xs text-red-600 mt-1">Email invalide</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
              <select formControlName="role" class="input" required>
                <option value="OWNER">Super administrateur</option>
                <option value="ADMIN">Administrateur</option>
                <option value="AGENT">Gestionnaire</option>
              </select>
              @if (isControlRequired('role')) {
                <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
              }
            </div>
            @if (!isEdit()) {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                <input type="password" formControlName="password" class="input" required />
                @if (isControlRequired('password')) {
                  <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
                }
              </div>
            }
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">
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

  form: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['AGENT', Validators.required],
      password: ['']
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      await this.loadUser(id);
    } else {
      this.form.get('password')?.setValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
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
      this.form.patchValue({
        fullName: user.name,
        email: user.email,
        role: this.mapRoleToApi(user.role)
      });
    } catch {
      this.error.set('Impossible de charger l’utilisateur');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (!this.isAdmin()) {
      this.error.set('Action non autorisée');
      return;
    }
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
        const payload: UpdateUserPayload = {
          fullName: this.form.value.fullName,
          email: this.form.value.email,
          role: this.form.value.role
        };
        await this.userService.update(this.route.snapshot.paramMap.get('id')!, payload);
      } else {
        await this.userService.create(this.form.value as CreateUserPayload);
      }
      this.router.navigate(['/users']);
    } catch {
      this.error.set('Impossible d’enregistrer l’utilisateur');
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

  mapRoleToApi(role: User['role']): CreateUserPayload['role'] {
    if (role === 'owner') return 'OWNER';
    if (role === 'admin') return 'ADMIN';
    return 'AGENT';
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
