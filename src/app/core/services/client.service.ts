import { Injectable, signal } from '@angular/core';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clientsSignal = signal<Client[]>([]);
  clients = this.clientsSignal.asReadonly();

  constructor() {
    this.loadClients();
  }

  private loadClients() {
    const stored = localStorage.getItem('clients');
    if (stored) {
      const clients = JSON.parse(stored).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
      this.clientsSignal.set(clients);
    } else {
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'Hassan Bennani',
          email: 'hassan@example.com',
          phone: '+212 6 12 34 56 78',
          address: '12 Rue Mohammed V, Casablanca',
          ice: '000123456000001',
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15')
        },
        {
          id: '2',
          name: 'Fatima Zahra',
          email: 'fatima@example.com',
          phone: '+212 6 98 76 54 32',
          address: '45 Avenue Hassan II, Rabat',
          ice: '000123456000002',
          createdAt: new Date('2025-02-10'),
          updatedAt: new Date('2025-02-10')
        }
      ];
      this.clientsSignal.set(mockClients);
      this.saveClients();
    }
  }

  private saveClients() {
    localStorage.setItem('clients', JSON.stringify(this.clientsSignal()));
  }

  getById(id: string): Client | undefined {
    return this.clientsSignal().find(c => c.id === id);
  }

  create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clientsSignal.update(clients => [...clients, newClient]);
    this.saveClients();
    return newClient;
  }

  update(id: string, updates: Partial<Client>): Client | undefined {
    const index = this.clientsSignal().findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const updatedClient = {
      ...this.clientsSignal()[index],
      ...updates,
      updatedAt: new Date()
    };

    this.clientsSignal.update(clients => {
      const newClients = [...clients];
      newClients[index] = updatedClient;
      return newClients;
    });
    this.saveClients();
    return updatedClient;
  }

  delete(id: string): boolean {
    const initialLength = this.clientsSignal().length;
    this.clientsSignal.update(clients => clients.filter(c => c.id !== id));
    this.saveClients();
    return this.clientsSignal().length < initialLength;
  }
}
