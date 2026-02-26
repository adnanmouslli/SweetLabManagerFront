
export interface OrdersCategoriesCreateDto {
    name: string;
    description: string;
}
export interface OrdersCategoriesCreateResponseDto {
    id: number;
    name: string;
    description: string;
}


export interface OrdersCategoriesFetchDto {
    id: number,
    name: string,
    description: string,
    _count: {
        orders: number
    },
    customersCount: number,
    customers: OrderCustomer[]
}


export interface OrdersCreateDto {
    customerId: number,
    totalAmount: number,
    paidStatus: boolean,
    notes: string,
    categoryId: number,
    items: {
        itemId: number,
        quantity: number,
        unitPrice: number,
        unit: string,
        notes: string,
    }[],
    isForToday: boolean,
    /** اختياري: تاريخ تسليم معين (ISO YYYY-MM-DD). إن وُجد يُستخدم بدلاً من اليوم/غداً */
    scheduledFor?: string
}


export interface OrderCategoryUpdateDto {
    "name": string;
    "description": string;
}
// orders.service.ts interfaces

export enum OrderStatus {
    pending = 'pending',
    processing = 'processing',
    ready = 'ready',
    delivered = 'delivered',
    cancelled = 'cancelled'
}

export interface ItemUnit {
    unit: string;
    price: number;
    factor: number;
}

export interface Item {
    id: number;
    name: string;
    type: string;
    units: ItemUnit[];
    defaultUnit: string;
    cost: number;
    price: number;
    description: string;
    groupId: number;
}

export interface OrderItem {
    id?: number;
    orderId?: number;
    itemId: number;
    quantity: number;
    unitPrice: number;
    unit: string;
    subTotal?: number;
    notes?: string;
    item?: Item;
}

export interface OrderCustomer {
    id: number;
    name: string;
    phone: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
    categoryId?: number;
}

export interface Employee {
    id?: number;
    username: string;
}

export interface OrderCategory {
    id?: number;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    customers?: OrderCustomer[]
}

// start
// src/types/order.type.ts


export interface OrderResponseDto {
    id: number;
    orderNumber: string;
    customerId: number;
    totalAmount: number;
    paidStatus: boolean;
    status: OrderStatus;
    createdAt: string; // Changed to string to match ISO date format
    scheduledFor: string; // ISO date string
    deliveryDate: string | null;
    notes: string;
    categoryId: number;
    invoiceId: number | null;
    employeeId: number;
    customer: OrderCustomer;
    category: OrderCategory;
    employee: Employee;
    items: OrderItem[];
    invoice: Invoice; // Added to match the JSON structure
}


// Employee type
export interface Employee {
    username: string;
}


// Product item (item details within order item)
export interface ProductItem {
    id: number;
    name: string;
    type: 'raw' | 'production';
    units: ItemUnit[];
    defaultUnit: string;
    cost: number;
    price: number;
    description: string;
    groupId: number;
}

// Item unit configuration
export interface ItemUnit {
    unit: string;
    price: number;
    factor: number;
}


// end


export interface UpdateOrder {
    customerId?: number;
    totalAmount?: number;
    paidStatus?: boolean;
    status?: OrderStatus;
    scheduledFor?: string;
    deliveryDate?: string;
    notes?: string;
    categoryId?: number;
    employeeId?: number;
    items?: OrderItem[];
}

export interface FilterOrders {
    customerId?: number;
    paidStatus?: boolean;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    forToday?: boolean;
    forTomorrow?: boolean;
}

export interface UpdateOrderCategory {
    name?: string;
    description?: string;
}

export interface InvoiceItem {
    id: number;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    unit: string;
    invoiceId: number;
    itemId: number;
    item?: Item;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    invoiceType: string;
    invoiceCategory: string;
    customerId: number;
    totalAmount: number;
    discount: number;
    additionalAmount: number;
    paidStatus: boolean;
    paymentDate: string;
    createdAt: string;
    notes?: string;
    isBreak: boolean;
    initialPayment?: number | null;
    fundId: number;
    shiftId: number;
    employeeId: number;
    relatedDebtId?: number | null;
    trayCount: number;
    relatedAdvanceId?: number | null;
    items: InvoiceItem[];
    customer?: OrderCustomer;
}

export interface OrderWithInvoice {
    order: OrderResponseDto;
    invoice?: Invoice;
    message?: string;
}

export interface OrdersSummary {
    total: number,
    byStatus: {
        pending: number,
        processing?: number,
        ready?: number,
        delivered?: number,
        cancelled?: number,
    },
    forToday: number,
    forTomorrow: number,
    totalPaidAmount: number
}


