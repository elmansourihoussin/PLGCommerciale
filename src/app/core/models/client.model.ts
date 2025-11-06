export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ice?: string;
  createdAt: Date;
  updatedAt: Date;
}
