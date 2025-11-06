import { Component, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-sidebar #sidebar />

      <div class="lg:pl-64">
        <app-header (menuToggle)="toggleSidebar()" />

        <main class="p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  sidebar = viewChild.required<SidebarComponent>('sidebar');

  toggleSidebar() {
    this.sidebar().toggle();
  }
}
