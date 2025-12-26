import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TaskProgress = {
  name: string;
  status: Record<string, boolean>;
};

type WeekDay = {
  label: string;
  dayNumber: number | null;
  dateKey: string | null;
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
            @for (week of weeksList(); track week) {
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
                @for (day of weekDays(); track day.dateKey ?? day.label) {
                  <th class="text-center" [class.bg-primary-50]="isCurrentDay(day)">
                    <div class="flex flex-col items-center gap-1">
                      <span class="font-medium" [class.text-primary-700]="isCurrentDay(day)">{{ day.label }}</span>
                      <span class="text-xs text-gray-500" [class.text-primary-700]="isCurrentDay(day)">
                        {{ day.dayNumber ?? '-' }}
                      </span>
                      <span class="text-[10px] text-gray-500">
                        {{ dayCompletion(day) }}%
                      </span>
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
                  @for (day of weekDays(); track day.dateKey ?? day.label) {
                    <td class="text-center" [class.bg-primary-50]="isCurrentDay(day)">
                      <label class="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          class="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          [checked]="isTaskChecked(task, day.dateKey)"
                          [disabled]="!day.dateKey"
                          (change)="toggleTask(taskIndex, day.dateKey)"
                        />
                      </label>
                    </td>
                  }
                </tr>
              }
              <tr>
                <td [attr.colspan]="weekDays().length + 1" class="p-4 bg-gray-50">
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
              <span class="text-sm text-gray-600">État global — semaine sélectionnée</span>
              <span class="text-sm font-semibold text-gray-900">{{ weekCompletion() }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-600 transition-all duration-300"
                [style.width.%]="weekCompletion()"
              ></div>
            </div>
          </div>
          <div class="text-sm text-gray-700">
            {{ weekTasksDoneCount() }} / {{ weekTotalTasksCount() }} cases cochées
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">État global — mois sélectionné</span>
              <span class="text-sm font-semibold text-gray-900">{{ monthCompletion() }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-600 transition-all duration-300"
                [style.width.%]="monthCompletion()"
              ></div>
            </div>
          </div>
          <div class="text-sm text-gray-700">
            {{ monthTasksDoneCount() }} / {{ monthTotalTasksCount() }} cases cochées
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskComponent {
  private readonly dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  todayKey = this.formatDateKey(new Date());
  selectedMonth = signal(new Date().getMonth());
  selectedYear = signal(new Date().getFullYear());
  selectedWeek = signal(this.getWeekOfMonth(new Date()));

  weeksCount = computed(() => this.computeWeeksInMonth(this.selectedYear(), this.selectedMonth()));
  weeksList = computed(() => Array.from({ length: this.weeksCount() }, (_, i) => i + 1));
  weekDays = computed(() => this.computeWeekDays(this.selectedYear(), this.selectedMonth(), this.selectedWeek()));

  tasks = signal<TaskProgress[]>([
    { name: 'Prospection', status: this.createEmptyStatus() },
    { name: 'Relance clients', status: this.createEmptyStatus({ Lundi: true, Mercredi: true }) },
    { name: 'Préparation des devis', status: this.createEmptyStatus({ Mardi: true }) },
    { name: 'Suivi des factures', status: this.createEmptyStatus({ Jeudi: true }) },
    { name: 'Analyse hebdomadaire', status: this.createEmptyStatus({ Vendredi: true }) }
  ]);
  newTaskName = '';
  formError = signal('');

  currentMonthYearLabel = computed(() => `${this.months[this.selectedMonth()]} ${this.selectedYear()}`);

  weekCompletion = computed(() => {
    const total = this.weekTotalTasksCount();
    if (total === 0) return 0;
    return Math.round((this.weekTasksDoneCount() / total) * 100);
  });

  weekTasksDoneCount = computed(() => {
    const validDays = this.weekDays().filter(d => d.dateKey);
    return this.tasks().reduce((sum, task) => {
      return sum + validDays.filter(day => day.dateKey && task.status[day.dateKey]).length;
    }, 0);
  });

  weekTotalTasksCount = computed(() => {
    const validDays = this.weekDays().filter(d => d.dateKey);
    return this.tasks().length * validDays.length;
  });

  monthTasksDoneCount = computed(() => {
    const daysInMonth = this.getDaysInMonth(this.selectedYear(), this.selectedMonth());
    return this.tasks().reduce((sum, task) => {
      let taskSum = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const key = this.formatDateKey(new Date(this.selectedYear(), this.selectedMonth(), day));
        if (task.status[key]) taskSum++;
      }
      return sum + taskSum;
    }, 0);
  });

  monthTotalTasksCount = computed(() => this.tasks().length * this.getDaysInMonth(this.selectedYear(), this.selectedMonth()));

  monthCompletion = computed(() => {
    const total = this.monthTotalTasksCount();
    if (total === 0) return 0;
    return Math.round((this.monthTasksDoneCount() / total) * 100);
  });

  dayCompletion(day: WeekDay): number {
    if (!day.dateKey) return 0;
    const totalTasks = this.tasks().length;
    if (totalTasks === 0) return 0;
    const done = this.tasks().filter(task => task.status[day.dateKey as string]).length;
    return Math.round((done / totalTasks) * 100);
  }

  toggleTask(taskIndex: number, dateKey: string | null) {
    if (!dateKey) return;
    this.tasks.update(tasks =>
      tasks.map((task, index) =>
        index === taskIndex
          ? {
              ...task,
              status: { ...task.status, [dateKey]: !task.status[dateKey] }
            }
          : task
      )
    );
  }

  isCurrentDay(day: WeekDay) {
    return day.dateKey === this.todayKey;
  }

  isTaskChecked(task: TaskProgress, dateKey: string | null) {
    if (!dateKey) return false;
    return !!task.status[dateKey];
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
    this.ensureWeekInRange();
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
    const status: Record<string, boolean> = {};
    const currentWeek = this.weekDays();

    currentWeek.forEach(day => {
      if (day.dateKey) {
        status[day.dateKey] = false;
      }
    });

    Object.entries(prechecked).forEach(([label, value]) => {
      const match = currentWeek.find(d => d.label === label);
      if (match?.dateKey) {
        status[match.dateKey] = value ?? false;
      }
    });

    return status;
  }

  private ensureWeekInRange() {
    const maxWeek = this.weeksCount();
    if (this.selectedWeek() > maxWeek) {
      this.selectedWeek.set(maxWeek);
    }
  }

  private computeWeekDays(year: number, month: number, weekNumber: number): WeekDay[] {
    const firstOfMonth = new Date(year, month, 1);
    const isoDay = firstOfMonth.getDay() === 0 ? 7 : firstOfMonth.getDay(); // 1 (Mon) - 7 (Sun)
    const firstMonday = new Date(firstOfMonth);
    firstMonday.setDate(firstOfMonth.getDate() - (isoDay - 1));

    const start = new Date(firstMonday);
    start.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const inMonth = date.getMonth() === month;
      return {
        label: this.dayLabels[date.getDay()],
        dayNumber: inMonth ? date.getDate() : null,
        dateKey: inMonth ? this.formatDateKey(date) : null
      };
    });
  }

  private computeWeeksInMonth(year: number, month: number): number {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const isoStart = firstOfMonth.getDay() === 0 ? 7 : firstOfMonth.getDay();
    const isoEnd = lastOfMonth.getDay() === 0 ? 7 : lastOfMonth.getDay();

    const leadingDays = isoStart - 1;
    const trailingDays = 7 - isoEnd;
    const daysShown = leadingDays + lastOfMonth.getDate() + trailingDays;

    return Math.ceil(daysShown / 7);
  }

  private getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  private formatDateKey(date: Date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private getWeekOfMonth(date: Date) {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const isoStart = firstOfMonth.getDay() === 0 ? 7 : firstOfMonth.getDay();
    const offset = isoStart - 1;
    return Math.ceil((date.getDate() + offset) / 7);
  }
}
