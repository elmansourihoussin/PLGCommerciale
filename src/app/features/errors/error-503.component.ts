import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-503',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-lg w-full text-center">
        <h1 class="text-6xl font-bold text-gray-900">503</h1>
        <p class="text-lg text-gray-600 mt-4">Service indisponible</p>
        <p class="text-sm text-gray-500 mt-2">
          L’API est momentanément indisponible. Merci de contacter le support.
        </p>
        <div class="mt-6 space-x-3">
          <a routerLink="/dashboard" class="btn-secondary inline-block">Retour</a>
          <a routerLink="/auth/login" class="btn-primary inline-block">Se reconnecter</a>
        </div>
      </div>
    </div>
  `
})
export class Error503Component {}
