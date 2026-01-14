import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-404',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-lg w-full text-center">
        <h1 class="text-6xl font-bold text-gray-900">404</h1>
        <p class="text-lg text-gray-600 mt-4">Page introuvable</p>
        <p class="text-sm text-gray-500 mt-2">
          La ressource demandée n’existe pas ou a été déplacée.
        </p>
        <div class="mt-6">
          <a routerLink="/dashboard" class="btn-primary inline-block">Retour au tableau de bord</a>
        </div>
      </div>
    </div>
  `
})
export class Error404Component {}
