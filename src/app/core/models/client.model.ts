export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  ice?: string;
  createdAt: Date;
  updatedAt: Date;
}
