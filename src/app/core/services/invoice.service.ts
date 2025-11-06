import { Injectable, signal } from '@angular/core';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoicesSignal = signal<Invoice[]>([]);
  invoices = this.invoicesSignal.asReadonly();

  constructor() {
    this.loadInvoices();
  }

  private loadInvoices() {
    const stored = localStorage.getItem('invoices');
    if (stored) {
      const invoices = JSON.parse(stored).map((i: any) => ({
        ...i,
        date: new Date(i.date),
        dueDate: new Date(i.dueDate),
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt)
      }));
      this.invoicesSignal.set(invoices);
    } else {
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          number: 'FACT-2025-001',
          clientId: '1',
          clientName: 'Hassan Bennani',
          title: 'Travaux de plomberie',
          date: new Date('2025-10-05'),
          dueDate: new Date('2025-11-05'),
          lines: [
            { id: '1', description: 'Installation sanitaire', quantity: 1, unitPrice: 5000, total: 5000 },
            { id: '2', description: 'Fournitures', quantity: 1, unitPrice: 2000, total: 2000 }
          ],
          subtotal: 7000,
          taxRate: 20,
          taxAmount: 1400,
          total: 8400,
          paidAmount: 8400,
          status: 'paid',
          paymentMethod: 'bank_transfer',
          createdAt: new Date('2025-10-05'),
          updatedAt: new Date('2025-10-05')
        }
      ];
      this.invoicesSignal.set(mockInvoices);
      this.saveInvoices();
    }
  }

  private saveInvoices() {
    localStorage.setItem('invoices', JSON.stringify(this.invoicesSignal()));
  }

  getById(id: string): Invoice | undefined {
    return this.invoicesSignal().find(i => i.id === id);
  }

  create(invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Invoice {
    const number = `FACT-${new Date().getFullYear()}-${String(this.invoicesSignal().length + 1).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      number,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.invoicesSignal.update(invoices => [...invoices, newInvoice]);
    this.saveInvoices();
    return newInvoice;
  }

  update(id: string, updates: Partial<Invoice>): Invoice | undefined {
    const index = this.invoicesSignal().findIndex(i => i.id === id);
    if (index === -1) return undefined;

    const updatedInvoice = {
      ...this.invoicesSignal()[index],
      ...updates,
      updatedAt: new Date()
    };

    this.invoicesSignal.update(invoices => {
      const newInvoices = [...invoices];
      newInvoices[index] = updatedInvoice;
      return newInvoices;
    });
    this.saveInvoices();
    return updatedInvoice;
  }

  delete(id: string): boolean {
    const initialLength = this.invoicesSignal().length;
    this.invoicesSignal.update(invoices => invoices.filter(i => i.id !== id));
    this.saveInvoices();
    return this.invoicesSignal().length < initialLength;
  }
}
