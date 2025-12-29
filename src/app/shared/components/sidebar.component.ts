import { Component, computed, effect, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside [class]="'fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ' + (isOpen() ? 'translate-x-0' : '-translate-x-full') + ' ' + (isCollapsed() ? 'w-20' : 'w-64')">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-gray-900" [class.hidden]="isCollapsed()">FacturePro</h1>
            <button (click)="toggleCollapse()" class="text-gray-500 hover:text-gray-700">
              @if (isCollapsed()) {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              } @else {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              }
            </button>
          </div>
          <button (click)="toggle()" class="lg:hidden text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <nav class="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
          <a routerLink="/dashboard" routerLinkActive="bg-primary-50 text-primary-700"
             class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
             [class.justify-center]="isCollapsed()" [class.gap-3]="!isCollapsed()">
            <svg class="w-5 h-5" [class.mr-3]="!isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            @if (!isCollapsed()) {
              <span class="font-medium">Dashboard</span>
            }
          </a>

          <a routerLink="/quotes" routerLinkActive="bg-primary-50 text-primary-700"
             class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
             [class.justify-center]="isCollapsed()" [class.gap-3]="!isCollapsed()">
            <svg class="w-5 h-5" [class.mr-3]="!isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            @if (!isCollapsed()) {
              <span class="font-medium">Devis</span>
            }
          </a>

          <a routerLink="/invoices" routerLinkActive="bg-primary-50 text-primary-700"
             class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
             [class.justify-center]="isCollapsed()" [class.gap-3]="!isCollapsed()">
            <svg class="w-5 h-5" [class.mr-3]="!isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
            </svg>
            @if (!isCollapsed()) {
              <span class="font-medium">Factures</span>
            }
          </a>

          <a routerLink="/clients" routerLinkActive="bg-primary-50 text-primary-700"
             class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
             [class.justify-center]="isCollapsed()" [class.gap-3]="!isCollapsed()">
            <svg class="w-5 h-5" [class.mr-3]="!isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            @if (!isCollapsed()) {
              <span class="font-medium">Clients</span>
            }
          </a>

          <div class="pt-6 mt-6 border-t border-gray-200">
            @if (isAdmin()) {
              <a routerLink="/settings" routerLinkActive="bg-primary-50 text-primary-700"
                 class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                 [class.justify-center]="isCollapsed()" [class.gap-3]="!isCollapsed()">
                <svg class="w-5 h-5" [class.mr-3]="!isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                @if (!isCollapsed()) {
                  <span class="font-medium">Paramètres</span>
                }
              </a>

              <a routerLink="/billing" routerLinkActive="bg-primary-50 text-primary-700"
                 class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                 [class.justify-center]="isCollapsed()" [class.gap-3]="!isCollapsed()">
                <svg class="w-5 h-5" [class.mr-3]="!isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                @if (!isCollapsed()) {
                  <span class="font-medium">Abonnement</span>
                }
              </a>
            }
          </div>
        </nav>
      </div>
    </aside>

    @if (isOpen()) {
      <div (click)="toggle()" class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"></div>
    }
  `
})
export class SidebarComponent {
  isOpen = signal(false);
  isCollapsed = signal(false);
  currentUser = this.authService.currentUser;
  isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'owner' || role === 'admin';
  });

  constructor(private authService: AuthService) {
    this.loadCollapsedState();

    effect(() => {
      const collapsed = this.isCollapsed();
      this.persistCollapsedState(collapsed);
      this.applySidebarWidth(collapsed);
    });

    // Ensure width is applied on init
    this.applySidebarWidth(this.isCollapsed());
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  private loadCollapsedState() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        this.isCollapsed.set(saved === 'true');
      }
    } catch {
      // ignore storage errors
    }
  }

  private persistCollapsedState(value: boolean) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('sidebarCollapsed', String(value));
    } catch {
      // ignore storage errors
    }
  }

  private applySidebarWidth(collapsed: boolean) {
    if (typeof document === 'undefined') return;
    const width = collapsed ? '5rem' : '16rem';
    document.documentElement.style.setProperty('--sidebar-width', width);
  }
}
