import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
      </header>

      <div class="flex">
        <aside class="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] px-4 py-6">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Navigation</div>
          <nav class="space-y-2">
            <a
              routerLink="/platform/tenants"
              routerLinkActive="bg-gray-900 text-white shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700"
            >
              <svg class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M4 21V7a2 2 0 012-2h3m4 0h3a2 2 0 012 2v14M9 21V9m6 12V9"/>
              </svg>
              <span class="text-sm font-medium">Entreprises</span>
            </a>
            <a
              routerLink="/platform/tenants/new"
              routerLinkActive="bg-gray-900 text-white shadow-sm"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700"
            >
              <svg class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"/>
              </svg>
              <span class="text-sm font-medium">Nouvelle entreprise</span>
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
  constructor() {}
}
