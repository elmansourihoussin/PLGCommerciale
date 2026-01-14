import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface StatusOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-status-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>

          @if (currentLabel) {
            <p class="text-sm text-gray-600 mt-2">
              Statut actuel: <span class="font-medium text-gray-900">{{ currentLabel }}</span>
            </p>
          }

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau statut *</label>
            <select
              class="input"
              [(ngModel)]="selected"
              (blur)="touched = true"
            >
              @for (option of options; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
            @if (touched && !selected) {
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
              [disabled]="busy || !selected"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class StatusDialogComponent {
  @Input() open = false;
  @Input() title = 'Modifier le statut';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() busy = false;
  @Input() error = '';
  @Input() options: StatusOption[] = [];

  @Input() set currentValue(value: string | null) {
    this.selected = value ?? '';
    this.touched = false;
  }

  @Input() currentLabel = '';

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  selected = '';
  touched = false;

  onCancel() {
    this.touched = false;
    this.cancel.emit();
  }

  onConfirm() {
    this.touched = true;
    if (!this.selected) return;
    this.confirm.emit(this.selected);
  }
}
