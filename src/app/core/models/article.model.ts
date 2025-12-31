export interface Article {
  id: string;
  name: string;
  sku?: string;
  unitPrice: number;
  taxRate?: number;
  stockQty?: number;
  unit?: string;
  isService: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
