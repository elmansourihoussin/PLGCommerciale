import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Client } from '../models/client.model';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';

export interface CreateClientPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  ice?: string;
}

export type UpdateClientPayload = Partial<CreateClientPayload>;

interface ApiClient {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  ice?: string;
  invoicesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ClientResponse {
  data?: ApiClient;
  client?: ApiClient;
}

interface ClientsListResponse {
  data?: ApiClient[];
  clients?: ApiClient[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clientsSignal = signal<Client[]>([]);
  clients = this.clientsSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {
  }

  list(): Promise<Client[]> {
    const url = `${this.configService.apiBaseUrl}/api/clients`;
    return firstValueFrom(this.http.get<ClientsListResponse | ApiClient[]>(url, { headers: this.authHeaders() }))
      .then((response) => {
        const clients = this.normalizeList(response);
        this.clientsSignal.set(clients);
        return clients;
      });
  }

  getById(id: string): Promise<Client> {
    const url = `${this.configService.apiBaseUrl}/api/clients/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.get<ClientResponse | ApiClient>(url, { headers: this.authHeaders() }))
      .then((response) => {
        const fallback: Partial<Client> = {
          name: '',
          email: '',
          phone: '',
          address: '',
          city: ''
        };
        const client = this.normalizeClient(response, fallback);
        this.upsertClient(client);
        return client;
      });
  }

  create(client: CreateClientPayload): Promise<Client> {
    const url = `${this.configService.apiBaseUrl}/api/clients`;
    return firstValueFrom(this.http.post<ClientResponse | ApiClient>(url, client, { headers: this.authHeaders() }))
      .then((response) => {
        const created = this.normalizeClient(response, client);
        this.upsertClient(created);
        return created;
      });
  }

  update(id: string, updates: UpdateClientPayload): Promise<Client> {
    const url = `${this.configService.apiBaseUrl}/api/clients/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.patch<ClientResponse | ApiClient>(url, updates, { headers: this.authHeaders() }))
      .then((response) => {
        const current = this.clientsSignal().find(c => c.id === id);
        const fallback: Partial<Client> = {
          name: current?.name ?? '',
          email: current?.email ?? '',
          phone: current?.phone ?? '',
          address: current?.address ?? '',
          city: current?.city ?? '',
          ice: current?.ice ?? ''
        };
        const updated = this.normalizeClient(response, fallback);
        this.upsertClient(updated);
        return updated;
      });
  }

  delete(id: string): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/clients/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.delete<void>(url, { headers: this.authHeaders() }))
      .then(() => {
        this.clientsSignal.update(clients => clients.filter(c => c.id !== id));
      });
  }

  private normalizeClient(response: ClientResponse | ApiClient, fallback: Partial<Client>): Client {
    const client = this.extractClient(response);
    return {
      id: client.id ?? Date.now().toString(),
      name: client.name ?? fallback.name ?? '',
      email: client.email ?? fallback.email ?? '',
      phone: client.phone ?? fallback.phone ?? '',
      address: client.address ?? fallback.address ?? '',
      city: client.city ?? fallback.city ?? '',
      ice: client.ice ?? fallback.ice,
      invoicesCount: client.invoicesCount ?? fallback.invoicesCount,
      createdAt: client.createdAt ? new Date(client.createdAt) : new Date(),
      updatedAt: client.updatedAt ? new Date(client.updatedAt) : new Date()
    };
  }

  private extractClient(response: ClientResponse | ApiClient): ApiClient {
    if (this.isClientResponse(response)) {
      return response.data ?? response.client ?? {};
    }
    return response;
  }

  private normalizeList(response: ClientsListResponse | ApiClient[]): Client[] {
    const list = Array.isArray(response)
      ? response
      : response.data ?? response.clients ?? [];
    return list.map((client) => {
      const fallback: Partial<Client> = {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: client.city ?? '',
        ice: client.ice,
        invoicesCount: client.invoicesCount
      };
      return this.normalizeClient(client, fallback);
    });
  }

  private upsertClient(client: Client) {
    this.clientsSignal.update((clients) => {
      const index = clients.findIndex(c => c.id === client.id);
      if (index === -1) {
        return [...clients, client];
      }
      const updated = [...clients];
      updated[index] = client;
      return updated;
    });
  }

  private isClientResponse(response: ClientResponse | ApiClient): response is ClientResponse {
    return 'data' in response || 'client' in response;
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  
}
