import { Injectable, signal } from '@angular/core';
import { Quote } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private quotesSignal = signal<Quote[]>([]);
  quotes = this.quotesSignal.asReadonly();

  constructor() {
    this.loadQuotes();
  }

  private loadQuotes() {
    const stored = localStorage.getItem('quotes');
    if (stored) {
      const quotes = JSON.parse(stored).map((q: any) => ({
        ...q,
        date: new Date(q.date),
        validUntil: new Date(q.validUntil),
        createdAt: new Date(q.createdAt),
        updatedAt: new Date(q.updatedAt)
      }));
      this.quotesSignal.set(quotes);
    } else {
      const mockQuotes: Quote[] = [
        {
          id: '1',
          number: 'DEV-2025-001',
          clientId: '1',
          clientName: 'Hassan Bennani',
          title: 'Travaux de plomberie',
          date: new Date('2025-10-01'),
          validUntil: new Date('2025-10-31'),
          lines: [
            { id: '1', description: 'Installation sanitaire', quantity: 1, unitPrice: 5000, total: 5000 },
            { id: '2', description: 'Fournitures', quantity: 1, unitPrice: 2000, total: 2000 }
          ],
          subtotal: 7000,
          taxRate: 20,
          taxAmount: 1400,
          total: 8400,
          status: 'sent',
          createdAt: new Date('2025-10-01'),
          updatedAt: new Date('2025-10-01')
        }
      ];
      this.quotesSignal.set(mockQuotes);
      this.saveQuotes();
    }
  }

  private saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(this.quotesSignal()));
  }

  getById(id: string): Quote | undefined {
    return this.quotesSignal().find(q => q.id === id);
  }

  create(quote: Omit<Quote, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Quote {
    const number = `DEV-${new Date().getFullYear()}-${String(this.quotesSignal().length + 1).padStart(3, '0')}`;
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      number,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.quotesSignal.update(quotes => [...quotes, newQuote]);
    this.saveQuotes();
    return newQuote;
  }

  update(id: string, updates: Partial<Quote>): Quote | undefined {
    const index = this.quotesSignal().findIndex(q => q.id === id);
    if (index === -1) return undefined;

    const updatedQuote = {
      ...this.quotesSignal()[index],
      ...updates,
      updatedAt: new Date()
    };

    this.quotesSignal.update(quotes => {
      const newQuotes = [...quotes];
      newQuotes[index] = updatedQuote;
      return newQuotes;
    });
    this.saveQuotes();
    return updatedQuote;
  }

  delete(id: string): boolean {
    const initialLength = this.quotesSignal().length;
    this.quotesSignal.update(quotes => quotes.filter(q => q.id !== id));
    this.saveQuotes();
    return this.quotesSignal().length < initialLength;
  }

  convertToInvoice(quoteId: string): any {
    const quote = this.getById(quoteId);
    if (!quote) return null;

    return {
      clientId: quote.clientId,
      title: quote.title,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lines: quote.lines,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      paidAmount: 0,
      status: 'unpaid' as const,
      notes: `Facture créée depuis le devis ${quote.number}`
    };
  }
}
