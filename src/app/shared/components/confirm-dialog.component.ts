import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          @if (message) {
            <p class="text-sm text-gray-600 mt-2">{{ message }}</p>
          }
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" (click)="cancel.emit()" [disabled]="busy">
              {{ cancelLabel }}
            </button>
            <button type="button" class="btn-primary" (click)="confirm.emit()" [disabled]="busy">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirmer';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() busy = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
