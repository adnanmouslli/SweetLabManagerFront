// src/types/items.type.ts
export type ItemType = "production" | "raw";

export interface BaseItem {
  id: number;
  name: string;
  type: ItemType;
  description?: string;
}

export interface ItemUnit {
  unit: string;
  price: number;
  factor: number;
}

export interface Item extends BaseItem {
  units: ItemUnit[];
  defaultUnit: string;
  basePrice?: number;          // السعر الأساسي
  packagingPrice?: number;     // سعر التكييس
  deliveryPrice?: number;      // سعر التوصيل
  price: number;               // السعر النهائي (basePrice + packagingPrice + deliveryPrice)
  productionRate?: number;
  cost?: number;
  groupId?: number;
  group?: ItemGroup;
}

export interface ItemGroup extends BaseItem {
  items: Omit<Item, "group">[];
}

export interface CreateItemDto {
  name: string;
  type: ItemType;
  units: ItemUnit[];
  defaultUnit: string;
  basePrice?: number;
  packagingPrice?: number;
  deliveryPrice?: number;
  price?: number;
  cost?: number;
  productionRate?: number;
  description?: string;
  groupId: number;
}

export interface UpdateItemDto extends Partial<CreateItemDto> {
  id: number;
}

export interface TrayTracking {
  id: number;
  customerId: number;
  totalTrays: number;
  status: "pending" | "returned";
  createdAt: string;
  returnedAt: string | null;
  notes: string;
  invoiceId: number;
  customer: {
    id: number;
    name: string;
    phone: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
  };
}