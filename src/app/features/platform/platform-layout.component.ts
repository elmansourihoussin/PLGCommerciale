import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PlatformAuthService } from '../../core/services/platform-auth.service';

@Component({
  selector: 'app-platform-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <span class="inline-flex w-10 h-10 rounded-lg bg-gray-900 text-white items-center justify-center font-semibold">
            PA
          </span>
          <div>
            <p class="text-xs text-gray-500">Platform Admin</p>
            <h1 class="text-sm font-semibold text-gray-900">Console</h1>
          </div>
        </div>
        <button class="btn-secondary" (click)="logout()">Déconnexion</button>
      </header>

      <div class="flex">
        <aside class="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] px-4 py-6">
          <nav class="space-y-2">
            <a routerLink="/platform/tenants" routerLinkActive="bg-gray-900 text-white"
               class="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              Entreprises
            </a>
            <a routerLink="/platform/tenants/new" routerLinkActive="bg-gray-900 text-white"
               class="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              Nouvelle entreprise
            </a>
          </nav>
        </aside>

        <main class="flex-1 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class PlatformLayoutComponent {
  constructor(
    private platformAuthService: PlatformAuthService,
    private router: Router
  ) {}

  logout() {
    this.platformAuthService.logout();
    this.router.navigate(['/platform/login']);
  }
}
