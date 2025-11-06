import { Injectable, signal } from '@angular/core';
import { Check } from '../models/check.model';

@Injectable({
  providedIn: 'root'
})
export class CheckService {
  private checksSignal = signal<Check[]>([]);
  checks = this.checksSignal.asReadonly();

  constructor() {
    this.loadChecks();
  }

  private loadChecks() {
    const stored = localStorage.getItem('checks');
    if (stored) {
      const checks = JSON.parse(stored).map((c: any) => ({
        ...c,
        date: new Date(c.date),
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
      this.checksSignal.set(checks);
    } else {
      const mockChecks: Check[] = [
        {
          id: '1',
          number: 'CHQ-2025-001',
          clientId: '2',
          clientName: 'Fatima Zahra',
          amount: 5000,
          date: new Date('2025-10-15'),
          beneficiary: 'Fatima Zahra',
          bankName: 'Attijariwafa Bank',
          status: 'printed',
          createdAt: new Date('2025-10-15'),
          updatedAt: new Date('2025-10-15')
        }
      ];
      this.checksSignal.set(mockChecks);
      this.saveChecks();
    }
  }

  private saveChecks() {
    localStorage.setItem('checks', JSON.stringify(this.checksSignal()));
  }

  getById(id: string): Check | undefined {
    return this.checksSignal().find(c => c.id === id);
  }

  create(check: Omit<Check, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Check {
    const number = `CHQ-${new Date().getFullYear()}-${String(this.checksSignal().length + 1).padStart(3, '0')}`;
    const newCheck: Check = {
      ...check,
      id: Date.now().toString(),
      number,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.checksSignal.update(checks => [...checks, newCheck]);
    this.saveChecks();
    return newCheck;
  }

  update(id: string, updates: Partial<Check>): Check | undefined {
    const index = this.checksSignal().findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const updatedCheck = {
      ...this.checksSignal()[index],
      ...updates,
      updatedAt: new Date()
    };

    this.checksSignal.update(checks => {
      const newChecks = [...checks];
      newChecks[index] = updatedCheck;
      return newChecks;
    });
    this.saveChecks();
    return updatedCheck;
  }

  delete(id: string): boolean {
    const initialLength = this.checksSignal().length;
    this.checksSignal.update(checks => checks.filter(c => c.id !== id));
    this.saveChecks();
    return this.checksSignal().length < initialLength;
  }
}
