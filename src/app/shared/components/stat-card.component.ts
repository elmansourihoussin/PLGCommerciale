import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ title() }}</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ value() }}</p>
          @if (change()) {
            <p class="mt-2 text-sm" [class]="changeColor()">
              {{ change() }}
            </p>
          }
        </div>
        <div [class]="iconBgColor() + ' p-3 rounded-lg'">
          <svg class="w-8 h-8" [class]="iconColor()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="iconPath()"/>
          </svg>
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  change = input<string>();
  icon = input.required<'document' | 'invoice' | 'check' | 'users' | 'trending'>();

  iconPath() {
    const paths = {
      document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      invoice: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
      check: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    };
    return paths[this.icon()];
  }

  iconColor() {
    const colors = {
      document: 'text-blue-600',
      invoice: 'text-green-600',
      check: 'text-purple-600',
      users: 'text-orange-600',
      trending: 'text-teal-600'
    };
    return colors[this.icon()];
  }

  iconBgColor() {
    const colors = {
      document: 'bg-blue-100',
      invoice: 'bg-green-100',
      check: 'bg-purple-100',
      users: 'bg-orange-100',
      trending: 'bg-teal-100'
    };
    return colors[this.icon()];
  }

  changeColor() {
    if (!this.change()) return '';
    return this.change()!.startsWith('+') ? 'text-green-600' : 'text-red-600';
  }
}
