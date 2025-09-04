interface Fund {
  id: number;
  fundType: string;
  currentBalance: number;
  lastUpdate: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  notes: string;
  customerType: string;
  supplierBalance: number;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
}

interface Employee {
  id: number;
  username: string;
  password: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id: number;
  title: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  unit: string;
  invoiceId: number;
  itemId: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceType: string;
  invoiceCategory: string;
  customerId: number | null;
  totalAmount: number;
  discount: number;
  additionalAmount: number;
  supplierPaymentAmount: number;
  paidStatus: boolean;
  paymentDate: string | null;
  createdAt: string;
  notes: string | null;
  isBreak: boolean;
  fundId: number;
  shiftId: number;
  employeeId: number;
  relatedDebtId: number | null;
  trayCount: number;
  relatedAdvanceId: number | null;
  employeeInvoiceType: string | null;
  relatedEmployeeId: number | null;
  relatedEmployeeDebtId: number | null;
  fund: Fund;
  customer: Customer | null;
  employee: Employee;
  items: InvoiceItem[];
}

export interface ShiftsInvoices {
  boothInvoices: Invoice[];
  generalInvoices: Invoice[];
  universityInvoices: Invoice[];
}

export interface CheckPendingTransfersResponse {
  hasPendingTransfers: boolean;
}
