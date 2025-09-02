// src/types/invoice.type.ts

export enum InvoiceCategory {
  PRODUCTS = 'products',
  DEBT = 'debt',
  DIRECT = 'direct',
  EMPLOYEE = 'employee',
  ADVANCE = 'advance',
  // Add specific employee operations as separate categories
  EMPLOYEE_DEBT = 'employee_debt',
  EMPLOYEE_WITHDRAWAL = 'employee_withdrawal',
  EMPLOYEE_WITHDRAWAL_RETURN = 'employee_withdrawal_return',
  DAILY_EMPLOYEE_RENT = 'daily_employee_rent'
}

// Define employee operation subtypes
export type EmployeeIncomeOperationType = 'debtPayment' | 'returnWithdrawal';
export type EmployeeExpenseOperationType = 'debt' | 'salary_advance' | 'production' | 'hours' | 'daily_salary';
export type EmployeeOperationType = EmployeeIncomeOperationType | EmployeeExpenseOperationType;

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceType: "expense" | "income";
  invoiceCategory: InvoiceCategory;
  customer?: {
    id: number;
    name: string;
    phone: string;
    notes: string | null;
    categoryId: string;
  };
  totalAmount: number;
  discount: number;
  additionalAmount?: number;
  supplierPaymentAmount?: number;
  paidStatus: boolean;
  paymentDate: string | null;
  createdAt: string;
  notes: string;
  fundId: number;
  shiftId: number;
  employeeId: number;
  items: InvoiceItem[];
  employee: Employee;
  fund: Fund;
  shift: Shift;
  trayCount: number;
  // New fields for breakage type
  isBreak?: boolean;
  firstPayment?: number;
  relatedEmployee?: RelatedEmployee | null;
  relatedEmployeeId?: number | null;
  employeeInvoiceType?: string | null;
}

export interface InvoiceItem {
  id: number;
  quantity: number;
  unitPrice: number;
  unit?: string;
  invoiceId: number;
  itemId: number;
  item: Item;
}

export interface Item {
  id: number;
  name: string;
  type: "raw" | "production";
  unit?: string;
  price?: number;
  defaultUnit?: string;
  description: string;
  groupId: number;
}

export interface Employee {
  username: string;
  name?: string;
}

export interface Fund {
  id: number;
  fundType: "general" | "university" | "booth";
  currentBalance: number;
  lastUpdate: string;
}

export interface Shift {
  id: number;
  shiftType: "morning" | "evening";
  status: "open" | "closed";
  openTime: string;
  closeTime: string;
  employeeId: number;
}

export interface CreateInvoiceItemDTO {
  quantity: number;
  unitPrice: number;
  trayCount?: number;
  itemId: number;
}

export type InvoiceType = "income" | "expense";
export type PaymentType = "paid" | "unpaid" | "breakage";

// Common fields for all DTOs
interface BaseInvoiceDTO {
  fundId: number;
  notes?: string;
}

// DTO for invoice items
export interface CreateInvoiceItemDTO {
  itemId: number;
  quantity: number;
  unitPrice: number;
  trayCount?: number;
}

// Income Products Invoice DTO
export interface IncomeProductsDTO extends BaseInvoiceDTO {
  invoiceType: "income";
  invoiceCategory: "products";
  customerId: number;
  paidStatus: boolean;
  totalAmount: number;
  discount: number;
  items: CreateInvoiceItemDTO[];
  trayCount?: number;
  // New fields for breakage type
  isBreak?: boolean;
  firstPayment?: number;
  additionalAmount: number
}

// Expense Products Invoice DTO
export interface ExpenseProductsDTO extends BaseInvoiceDTO {
  invoiceType: "expense";
  invoiceCategory: "products";
  customerId: number;
  paidStatus: boolean;
  totalAmount: number;
  items: CreateInvoiceItemDTO[];
  supplierPaymentAmount?: number; // المبلغ المدفوع للمورد
}

// Direct/Debt Invoice DTO (for both income and expense)
export interface DirectDebtDTO extends BaseInvoiceDTO {
  invoiceType: InvoiceType;
  invoiceCategory: InvoiceCategory;
  customerId?: number;
  totalAmount: number;
  paidStatus: boolean;
}

export interface SingleFetchedInvoice {
  id: number;
  invoiceNumber: string;
  invoiceType: "expense" | "income";
  invoiceCategory: InvoiceCategory;
  customerId: number; // Direct customerId instead of nested customer object
  totalAmount: number;
  discount: number;
  paidStatus: boolean;
  paymentDate: string | null;
  createdAt: string;
  notes: string | null;
  fundId: number;
  shiftId: number;
  employeeId: number;
  relatedDebtId: number | null;
  trayCount: number;
  // New fields for breakage type
  isBreak?: boolean;
  firstPayment?: number;
  supplierPaymentAmount?: number; // المبلغ المدفوع للمورد
  items: InvoiceItem[];
  employee: Employee;
  fund: Fund;
  shift: {
    id: number;
    shiftType: "morning" | "evening";
    status: "open" | "closed";
    openTime: string;
    closeTime: string | null;
    differenceStatus: string | null;
    differenceValue: number | null;
    employeeId: number;
  };
}

// src/types/product-invoice-item.type.ts

/**
 * Represents a unit configuration for an item
 */
export interface ItemUnit {
  unit: string;
  price: number;
  factor: number;
}

/**
 * Represents an item in inventory
 */
export interface ProductItem {
  id: number;
  name: string;
  type: "raw" | "production";
  units: ItemUnit[];
  defaultUnit: string;
  cost: number;
  price: number;
  description: string;
  groupId: number;
}

/**
 * Represents a product invoice item with its associated item details
 */
export interface ProductInvoiceItem {
  id: number;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  unit: string;
  invoiceId: number;
  itemId: number;
  item: ProductItem;
}

export interface ProductInvoice {
  id: number;
  invoiceNumber: string;
  invoiceType: "expense" | "income";
  invoiceCategory: InvoiceCategory;
  customer?: {
    id: number;
    name: string;
    phone: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
  totalAmount: number;
  discount: number;
  paidStatus: boolean;
  paymentDate: string | null;
  createdAt: string;
  notes: string;
  fundId: number;
  shiftId: number;
  employeeId: number;
  items: ProductInvoiceItem[];
  employee: Employee;
  fund: Fund;
  shift: Shift;
  trayCount: number;
  // New fields for breakage type
  isBreak?: boolean;
  firstPayment?: number;
  supplierPaymentAmount?: number; // المبلغ المدفوع للمورد
}

export interface RelatedEmployee {
  id: number;
  name: string;
  phone?: string;
  workType?: string;
  createdAt?: string;
  updatedAt?: string;
  workshopId?: number;
}