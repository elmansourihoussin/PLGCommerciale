export interface Notification {
  id: string;
  type?: string;
  entityType?: string;
  entityId?: string;
  eventKey?: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt?: Date;
}
