import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-convert-quote-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p class="text-sm text-gray-600 mt-2">Le numéro peut être modifié avant création.</p>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de facture *</label>
            <input
              type="text"
              class="input"
              [(ngModel)]="value"
              (blur)="touched = true"
              placeholder="Ex: FAC-2025-001"
            />
            @if (touched && !value) {
              <p class="text-xs text-red-600 mt-1">Ce champ est obligatoire</p>
            }
          </div>

          @if (error) {
            <p class="text-xs text-red-600 mt-3">{{ error }}</p>
          }

          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn-secondary" (click)="onCancel()" [disabled]="busy">
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="btn-primary"
              (click)="onConfirm()"
              [disabled]="busy || !value"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConvertQuoteDialogComponent {
  @Input() open = false;
  @Input() title = 'Créer une facture';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() busy = false;
  @Input() error = '';

  @Input() set number(value: string | null) {
    this.value = value ?? '';
    this.touched = false;
  }

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  value = '';
  touched = false;

  onCancel() {
    this.touched = false;
    this.cancel.emit();
  }

  onConfirm() {
    this.touched = true;
    if (!this.value) return;
    this.confirm.emit(this.value);
  }
}
