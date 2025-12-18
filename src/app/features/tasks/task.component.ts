import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TaskProgress = {
  name: string;
  status: Record<string, boolean>;
};

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tâches</h1>
          <p class="text-sm text-gray-500">Cochez les tâches complétées pour chaque jour.</p>
        </div>
      </div>

      <div class="card space-y-4">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Suivez l'avancement des tâches quotidiennes.</span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-2">
            <button class="btn-outline px-3 py-2 flex items-center justify-center" (click)="changeMonth(-1)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800">
              {{ currentMonthYearLabel() }}
            </div>
            <button class="btn-outline px-3 py-2 flex items-center justify-center" (click)="changeMonth(1)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm text-gray-600">Semaines :</span>
            @for (week of weeks; track week) {
              <button
                class="px-3 py-1 rounded-lg border text-sm transition-colors"
                [class.bg-primary-600]="week === selectedWeek()"
                [class.text-white]="week === selectedWeek()"
                [class.border-primary-600]="week === selectedWeek()"
                [class.bg-white]="week !== selectedWeek()"
                [class.text-gray-700]="week !== selectedWeek()"
                (click)="setWeek(week)"
              >
                S{{ week }}
              </button>
            }
          </div>
        </div>

        <div class="table-wrapper">
          <table class="table min-w-[960px]">
            <thead>
              <tr>
                <th class="w-48 sticky left-0 bg-gray-50 z-20">Tâche</th>
                @for (day of days; track day) {
                  <th class="text-center" [class.bg-primary-50]="isCurrentDay(day)">
                    <div class="flex flex-col items-center gap-1">
                      <span class="font-medium" [class.text-primary-700]="isCurrentDay(day)">{{ day }}</span>
                      <span class="text-xs text-gray-500" [class.text-primary-700]="isCurrentDay(day)">{{ dayCompletion(day) }}%</span>
                      @if (isCurrentDay(day)) {
                        <span class="text-[10px] font-semibold text-primary-700 uppercase tracking-wide">Aujourd'hui</span>
                      }
                    </div>
                  </th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (task of tasks(); track task.name; let taskIndex = $index) {
                <tr>
                  <td class="font-medium text-gray-900 sticky left-0 bg-white z-10">{{ task.name }}</td>
                  @for (day of days; track day) {
                    <td class="text-center" [class.bg-primary-50]="isCurrentDay(day)">
                      <label class="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          class="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          [checked]="task.status[day]"
                          (change)="toggleTask(taskIndex, day)"
                        />
                      </label>
                    </td>
                  }
                </tr>
              }
              <tr>
                <td [attr.colspan]="days.length + 1" class="p-4 bg-gray-50">
                  <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input
                      type="text"
                      [(ngModel)]="newTaskName"
                      (keyup.enter)="addTask()"
                      placeholder="Ajouter une nouvelle tâche"
                      class="input flex-1"
                    />
                    <button (click)="addTask()" class="btn-primary whitespace-nowrap">Ajouter</button>
                  </div>
                  @if (formError()) {
                    <div class="text-sm text-red-600 mt-2">{{ formError() }}</div>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Progression globale</span>
              <span class="text-sm font-semibold text-gray-900">{{ completionRate() }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-600 transition-all duration-300"
                [style.width.%]="completionRate()"
              ></div>
            </div>
          </div>
          <div class="text-sm text-gray-700">
            {{ tasksDoneCount() }} / {{ totalTasksCount() }} cases cochées
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskComponent {
  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  weeks = [1, 2, 3, 4, 5];

  tasks = signal<TaskProgress[]>([
    { name: 'Prospection', status: this.createEmptyStatus() },
    { name: 'Relance clients', status: this.createEmptyStatus({ Lundi: true, Mercredi: true }) },
    { name: 'Préparation des devis', status: this.createEmptyStatus({ Mardi: true }) },
    { name: 'Suivi des factures', status: this.createEmptyStatus({ Jeudi: true }) },
    { name: 'Analyse hebdomadaire', status: this.createEmptyStatus({ Vendredi: true }) }
  ]);
  newTaskName = '';
  formError = signal('');
  currentDay = this.getToday();
  selectedMonth = signal(new Date().getMonth());
  selectedYear = signal(new Date().getFullYear());
  selectedWeek = signal(this.getWeekOfMonth(new Date()));

  currentMonthYearLabel = computed(() => `${this.months[this.selectedMonth()]} ${this.selectedYear()}`);

  completionRate = computed(() => {
    const total = this.totalTasksCount();
    if (total === 0) return 0;
    return Math.round((this.tasksDoneCount() / total) * 100);
  });

  tasksDoneCount = computed(() => {
    return this.tasks().reduce((sum, task) => {
      return sum + this.days.filter(day => task.status[day]).length;
    }, 0);
  });

  totalTasksCount = computed(() => this.tasks().length * this.days.length);

  dayCompletion(day: string): number {
    const totalTasks = this.tasks().length;
    if (totalTasks === 0) return 0;
    const done = this.tasks().filter(task => task.status[day]).length;
    return Math.round((done / totalTasks) * 100);
  }

  toggleTask(taskIndex: number, day: string) {
    this.tasks.update(tasks =>
      tasks.map((task, index) =>
        index === taskIndex
          ? {
              ...task,
              status: { ...task.status, [day]: !task.status[day] }
            }
          : task
      )
    );
  }

  isCurrentDay(day: string) {
    return day === this.currentDay;
  }

  setWeek(week: number) {
    this.selectedWeek.set(week);
  }

  changeMonth(delta: number) {
    this.selectedMonth.update(current => {
      let next = current + delta;
      if (next < 0) {
        this.selectedYear.update(y => y - 1);
        next = 11;
      } else if (next > 11) {
        this.selectedYear.update(y => y + 1);
        next = 0;
      }
      return next;
    });
  }

  addTask() {
    const name = this.newTaskName.trim();
    if (!name) {
      this.formError.set('Le nom de la tâche est requis.');
      return;
    }

    this.tasks.update(tasks => [...tasks, { name, status: this.createEmptyStatus() }]);
    this.newTaskName = '';
    this.formError.set('');
  }

  private createEmptyStatus(prechecked: Partial<Record<string, boolean>> = {}) {
    return this.days.reduce<Record<string, boolean>>((status, day) => {
      status[day] = prechecked[day] ?? false;
      return status;
    }, {});
  }

  private getToday(): string {
    const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date());
    return today.charAt(0).toUpperCase() + today.slice(1);
  }

  private getWeekOfMonth(date: Date) {
    const day = date.getDate();
    return Math.min(5, Math.max(1, Math.ceil(day / 7)));
  }
}
