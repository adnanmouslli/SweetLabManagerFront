// customers.types.ts

// Base interfaces for common properties
interface BaseEntity {
  id: number;
  createdAt: string;
}

// Customer Type enum
export enum CustomerTypeEnum {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER'
}

// Customer Category interface
export interface CustomerCategory {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Customer Information Interface
export interface CustomerInfo {
  id: number;
  name: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customerSince: string;
  categoryId: number | null;
  category: CustomerCategory | null;
  customerType: CustomerTypeEnum;
}

// Financial Summary Interface
export interface FinancialSummary {
  totalSales: number;
  totalPaid: number;
  currentDebts: number;
  paidDebts: number;
  paymentRatio: number;
  pendingAmount: number;
}

// Trays Information Interface
export interface PendingTrayDetail {
  id: number;
  invoiceId: number;
  traysCount: number;
  createdAt: string;
  pendingSince: string;
  notes: string;
}

export interface TraysInfo {
  totalPendingTrays: number;
  pendingTraysDetails: PendingTrayDetail[];
}

// Debts Information Interface
export interface ActiveDebt {
  id: number;
  totalAmount: number;
  remainingAmount: number;
  createdAt: string;
  lastPaymentDate: string | null;
  pendingSince: string;
  notes: string;
  paymentProgress: number;
}

export interface PaidDebt {
  id: number;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  lastPaymentDate: string;
  paidAfter: number;
  notes: string;
}

export interface DebtsInfo {
  activeDebts: ActiveDebt[];
  paidDebts: PaidDebt[];
}

// Invoices Information Interface
export interface InvoiceItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface TrayInfo {
  totalTrays: number;
  status: "pending" | "returned";
  returnedAt: string | null;
}

export interface SummaryInvoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  discount: number;
  netAmount: number;
  paidStatus: boolean;
  createdAt: string;
  paymentDate: string | null;
  notes: string | null;
  isBreak: boolean;
  items: InvoiceItem[];
  trayInfo: TrayInfo | null;
}

export interface InvoicesInfo {
  totalCount: number;
  incomeInvoices: SummaryInvoice[];
  expenseInvoices: SummaryInvoice[];
}

// Analysis Information Interface
export interface PopularItem {
  itemId: number;
  itemName: string;
  totalQuantity: number;
  totalRevenue: number;
  occurrences: number;
}

export interface Transaction {
  date: string;
  amount: number;
  invoiceNumber: string;
  daysSinceLastTransaction?: number;
}

export interface PaymentBehavior {
  prefersPaying: boolean;
  prefersDebt: boolean;
  paymentReliabilityScore: number;
}

export interface AnalysisInfo {
  popularItems: PopularItem[];
  monthlyAverage: number;
  firstTransaction: Transaction;
  lastTransaction: Transaction;
  transactionFrequency: string;
  paymentBehavior: PaymentBehavior;
}

// Main Customer Data Interface
export interface CustomerSummaryData {
  customerInfo: CustomerInfo;
  financialSummary: FinancialSummary;
  traysInfo: TraysInfo;
  debtsInfo: DebtsInfo;
  invoicesInfo: InvoicesInfo;
  analysisInfo: AnalysisInfo;
}

// Unit interfaces
export interface ItemUnit {
  unit: string;
  price: number;
  factor: number;
}

// Item interfaces
export interface Item extends BaseEntity {
  name: string;
  type: "production" | "raw"; // Assuming these are the possible types
  units: ItemUnit[];
  defaultUnit: string;
  cost: number;
  price: number;
  description: string;
  groupId: number;
}

// InvoiceItem interface
export interface DetailedInvoiceItem extends BaseEntity {
  quantity: number;
  unitPrice: number;
  subTotal: number;
  unit: string;
  invoiceId: number;
  itemId: number;
  item: Item;
}

// Invoice interface
export interface AllCustomersInvoice extends BaseEntity {
  invoiceNumber: string;
  invoiceType: "income" | "expense";
  invoiceCategory: "products" | "debt" | "direct";
  customerId: number;
  totalAmount: number;
  discount: number;
  paidStatus: boolean;
  paymentDate: string | null;
  notes: string | null;
  isBreak: boolean;
  fundId: number;
  shiftId: number;
  employeeId: number;
  relatedDebtId: number | null;
  trayCount: number;
  items: DetailedInvoiceItem[];
}

// Tray interface
export interface Tray extends BaseEntity {
  customerId: number;
  totalTrays: number;
  status: "pending" | "returned";
  returnedAt: string | null;
  notes: string;
  invoiceId: number;
}

// Debt interface
export interface Debt extends BaseEntity {
  customerId: number;
  totalAmount: number;
  remainingAmount: number;
  lastPaymentDate: string | null;
  status: "active" | "paid";
  notes: string;
}

// Customer interface
export interface AllCustomerType extends BaseEntity {
  name: string;
  phone: string;
  notes: string | null;
  updatedAt: string;
  categoryId: number | null;
  category: CustomerCategory | null;
  customerType: CustomerTypeEnum;
  supplierBalance: number;
  invoices: AllCustomersInvoice[];
  trays: Tray[];
  debts: Debt[];
}

// Simple customer type for list views
export interface CustomerType {
  id: number;
  name: string;
  phone: string;
  totalDebt: number;
  category: CustomerCategory | null;
  customerType: CustomerTypeEnum;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeAdvances: any;
}

// Request & Response Types for API Operations

// Create Customer
export interface CreateCustomerRequest {
  name: string;
  phone: string;
  notes?: string | null;
  categoryId?: number | null;
  customerType: CustomerTypeEnum;
}

export type CreateCustomerResponse = CustomerInfo;

// Update Customer
export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  notes?: string | null;
  categoryId?: number | null;
  customerType?: CustomerTypeEnum;
}

export type UpdateCustomerResponse = CustomerInfo;

// Delete Customer
export interface DeleteCustomerResponse {
  success: boolean;
  message: string;
  deletedCustomerId: number;
}

// Get Customer Account Statement
export interface CustomerAccountStatementRequest {
  customerId: string;
}

export type CustomerAccountStatementResponse = CustomerSummaryData;

// Get All Customers
export type GetAllCustomersResponse = Array<AllCustomerType>;

// Get Customer List
export type GetCustomersListResponse = Array<CustomerType>;

// Get Customer By ID
export interface GetCustomerByIdRequest {
  customerId: string;
}

export type GetCustomerByIdResponse = AllCustomerType;

// Customer Categories
export interface GetCustomerCategoriesResponse {
  categories: CustomerCategory[];
}

export interface CreateCustomerCategoryRequest {
  name: string;
  description?: string | null;
}

export type CreateCustomerCategoryResponse = CustomerCategory;

export interface UpdateCustomerCategoryRequest {
  name?: string;
  description?: string | null;
}

export type UpdateCustomerCategoryResponse = CustomerCategory;

export interface DeleteCustomerCategoryResponse {
  success: boolean;
  message: string;
  deletedCategoryId: number;
}

// Supplier Payment Types
export interface SupplierPaymentRequest {
  amount: number;
  notes?: string;
}

export interface SupplierPaymentResponse {
  success: boolean;
  message: string;
  paymentId: number;
  newBalance: number;
}

export interface SupplierBalanceResponse {
  balance: number;
  currency: string;
}