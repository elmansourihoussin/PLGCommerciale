import { Component, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <button (click)="menuToggle.emit()" class="lg:hidden text-gray-700 hover:text-gray-900">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <div class="hidden lg:block"></div>

      <div class="flex items-center space-x-4">
        <div class="relative">
          <button class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100" (click)="toggleNotifications()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            @if (hasUnread()) {
              <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            }
          </button>

          @if (showNotifications()) {
            <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div class="px-4 pb-2 flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-800">Notifications</span>
                <button class="text-xs text-primary-600 hover:underline" (click)="markAllRead()">Tout marquer lu</button>
              </div>
              <div class="max-h-64 overflow-y-auto">
                @if (notifications().length === 0) {
                  <div class="px-4 py-6 text-sm text-gray-500 text-center">Aucune notification</div>
                } @else {
                  @for (notif of notifications(); track notif.id) {
                    <div class="px-4 py-3 hover:bg-gray-50 border-t border-gray-100 first:border-t-0">
                      <div class="flex items-start gap-2">
                        <span class="mt-0.5 w-2.5 h-2.5 rounded-full" [class.bg-red-500]="!notif.read" [class.bg-gray-300]="notif.read"></span>
                        <div class="flex-1">
                          <p class="text-sm text-gray-800">{{ notif.title }}</p>
                          @if (notif.description) {
                            <p class="text-xs text-gray-500 mt-1">{{ notif.description }}</p>
                          }
                          <p class="text-[11px] text-gray-400 mt-1">{{ notif.time }}</p>
                        </div>
                        <button class="text-xs text-primary-600 hover:underline" (click)="markRead(notif.id)">Lu</button>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <div class="relative">
          <button (click)="toggleDropdown()" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
            <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
              {{ getUserInitials() }}
            </div>
            <span class="hidden md:block text-sm font-medium text-gray-700">{{ getUserName() }}</span>
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          @if (showDropdown) {
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <a (click)="navigateTo('/settings')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Mon profil
              </a>
              <a (click)="navigateTo('/billing')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Abonnement
              </a>
              <div class="border-t border-gray-200 my-1"></div>
              <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                Déconnexion
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  menuToggle = output<void>();
  showDropdown = false;
  showNotifications = signal(false);
  notifications = signal([
    { id: 1, title: 'Nouvelle facture validée', description: 'Facture #2024-118', time: 'Il y a 2h', read: false },
    { id: 2, title: 'Client ajouté', description: 'Société Alpha', time: 'Il y a 1j', read: false },
    { id: 3, title: 'Rappel de paiement', description: 'Devis #2024-104', time: 'Il y a 3j', read: true }
  ]);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    if (this.showDropdown) this.showDropdown = false;
  }

  getUserName(): string {
    return this.authService.currentUser()?.name || 'Utilisateur';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  navigateTo(path: string) {
    this.showDropdown = false;
    this.router.navigate([path]);
  }

  logout() {
    this.showDropdown = false;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  hasUnread() {
    return this.notifications().some(n => !n.read);
  }

  markRead(id: number) {
    this.notifications.update(list => list.map(n => n.id === id ? { ...n, read: true } : n));
  }

  markAllRead() {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }
}
