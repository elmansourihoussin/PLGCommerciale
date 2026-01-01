import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { Notification } from '../models/notification.model';

export interface CreateNotificationPayload {
  type?: string;
  title: string;
  message?: string;
  userId?: string;
}

interface ApiNotification {
  id?: string;
  type?: string;
  entityType?: string;
  entityId?: string;
  eventKey?: string;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: string;
}

interface NotificationListResponse {
  notifications?: ApiNotification[];
  data?: ApiNotification[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface NotificationResponse {
  data?: ApiNotification;
  notification?: ApiNotification;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  notifications = this.notificationsSignal.asReadonly();
  private totalCountSignal = signal<number | null>(null);
  totalCount = this.totalCountSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {}

  list(params?: { isRead?: boolean; page?: number; limit?: number }): Promise<Notification[]> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/notifications`);
    if (params?.isRead !== undefined) url.searchParams.set('isRead', String(params.isRead));
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    return firstValueFrom(this.http.get<NotificationListResponse | ApiNotification[]>(url.toString(), { headers: this.authHeaders() }))
      .then((response) => {
        const { notifications, total } = this.normalizeList(response);
        this.notificationsSignal.set(notifications);
        if (typeof total === 'number') {
          this.totalCountSignal.set(total);
        }
        return notifications;
      });
  }

  create(payload: CreateNotificationPayload): Promise<Notification> {
    const url = `${this.configService.apiBaseUrl}/api/notifications`;
    return firstValueFrom(this.http.post<NotificationResponse | ApiNotification>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizeNotification(response, payload));
  }

  markRead(id: string): Promise<Notification> {
    const url = `${this.configService.apiBaseUrl}/api/notifications/${encodeURIComponent(id)}/read`;
    return firstValueFrom(this.http.patch<NotificationResponse | ApiNotification>(url, {}, { headers: this.authHeaders() }))
      .then((response) => {
        const updated = this.normalizeNotification(response);
        this.notificationsSignal.update(list => list.map(n => n.id === updated.id ? updated : n));
        return updated;
      });
  }

  markAllRead(): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/notifications/read-all`;
    return firstValueFrom(this.http.patch<void>(url, {}, { headers: this.authHeaders() }))
      .then(() => {
        this.notificationsSignal.update(list => list.map(n => ({ ...n, isRead: true })));
      });
  }

  private normalizeList(response: NotificationListResponse | ApiNotification[]): { notifications: Notification[]; total?: number } {
    if (Array.isArray(response)) {
      return {
        notifications: response.map((notification) => this.normalizeNotification(notification)),
        total: undefined
      };
    }

    const list = response.notifications ?? [];
    const notifications = list.map((notification) => this.normalizeNotification(notification));
    const total = response.meta?.total;
    return { notifications, total };
  }

  private normalizeNotification(response: NotificationResponse | ApiNotification, fallback?: CreateNotificationPayload): Notification {
    const notification = this.extractNotification(response);
    return {
      id: notification.id ?? '',
      type: notification.type ?? fallback?.type,
      entityType: notification.entityType,
      entityId: notification.entityId,
      eventKey: notification.eventKey,
      title: notification.title ?? fallback?.title ?? '',
      message: notification.message ?? fallback?.message,
      isRead: notification.isRead ?? false,
      createdAt: notification.createdAt ? new Date(notification.createdAt) : undefined
    };
  }

  private extractNotification(response: NotificationResponse | ApiNotification): ApiNotification {
    if (this.isNotificationResponse(response)) {
      return response.data ?? response.notification ?? {};
    }
    return response;
  }

  private isNotificationResponse(response: NotificationResponse | ApiNotification): response is NotificationResponse {
    if ('notification' in response) return true;
    if ('data' in response) {
      const data = (response as NotificationResponse).data;
      return this.isApiNotification(data);
    }
    return false;
  }

  private isApiNotification(value: unknown): value is ApiNotification {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as ApiNotification;
    return Boolean(candidate.id || candidate.title || candidate.message);
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
