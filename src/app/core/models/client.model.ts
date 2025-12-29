export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  ice?: string;
  invoicesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
