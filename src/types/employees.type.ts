// Work Type enum to match backend
export enum WorkType {
  HOURLY = 'hourly',
  PRODUCTION = 'production'
}

// Workshop type (simplified version for employee references)
export interface Workshop {
  id: number;
  name: string;
  workType: WorkType;
  password?: string;
  createdAt: string;
  updatedAt: string;
}



// Employee Withdrawal type
export interface EmployeeWithdrawal {
  id: number;
  employeeId: number;
  amount: number;
  withdrawalType: string;
  fundId: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Employee types
export interface Employee {
  id: number;
  name: string;
  phone?: string;
  workType: WorkType;
  workshopId?: number;
  workshop?: Workshop;
  createdAt: string;
  updatedAt: string;
  withdrawals?: EmployeeWithdrawal[];
  
  financialSummary?: WorkshopEmployeeFinancialSummary;
  // debts are now handled separately through the EmployeeDebt interface in debts.type.ts
}

export interface WorkshopEmployeeFinancialSummary {
  debtAmount: number;
  hasActiveDebt: boolean;
  lastPaymentDate: string;
  lastWorkshopSettlement: string | null;
  paymentsCount: number;
  periodStart: string;
  totalSalaries: number;
  totalWithdrawals: number;
  withdrawalsCount: number;
}

// Employee Financial Summary
export interface EmployeeFinancialSummary {
  totalWithdrawals: number;
  totalEarnings: number;
  dailySalaries: number;
  debtAmount: number;
  netAmount: number;
}

// Employee Production Record
export interface EmployeeProductionRecord {
  id: number;
  employeeId: number;
  itemId: number;
  item?: any; // Item type from items module
  quantity: number;
  productionRate: number;
  totalAmount: number;
  date: string;
  notes?: string;
}

// Employee Hours Record
export interface EmployeeHoursRecord {
  id: number;
  employeeId: number;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  date: string;
  notes?: string;
}

// Employee Invoice
export interface EmployeeInvoice {
  id: number;
  invoiceNumber: string;
  employeeId: number;
  invoiceType: string;
  invoiceCategory: string;
  employeeInvoiceType?: string;
  customerId?: number;
  paidStatus: boolean;
  totalAmount: number;
  discount?: number;
  additionalAmount?: number;
  notes?: string;
  fundId: number;
  shiftId: number;
  paymentDate?: string;
  isBreak: boolean;
  createdAt: string;
  updatedAt: string;
  items: any[]; // InvoiceItem type from invoices module
}

// Employee Details (extended Employee with additional data)
export interface EmployeeDetails extends Employee {
  productionRecords?: EmployeeProductionRecord[];
  hourRecords?: EmployeeHoursRecord[];
  invoices?: EmployeeInvoice[];
  financialSummary: WorkshopEmployeeFinancialSummary;
  // Employee debts are now referenced from debt.type.ts
}

// DTOs for creating/updating employees
export interface CreateEmployeeDTO {
  name: string;
  phone?: string;
  workType: WorkType;
  workshopId?: number;
}

export interface UpdateEmployeeDTO {
  name?: string;
  phone?: string;
  workType?: WorkType;
  workshopId?: number;
}

// Employee income operations
export type EmployeeIncomeOperationType = 'debtPayment' | 'returnWithdrawal';

// Employee expense operations
export type EmployeeExpenseOperationType = 'debt' | 'salary_advance' | 'production' | 'hours' | 'daily_salary';

// Employee payment (income) DTOs
export interface EmployeePaymentDTO {
  amount: number;
  paymentType: EmployeeIncomeOperationType;
  fundId: number;
  notes?: string;
}

// Employee withdrawal (expense) DTOs
export interface EmployeeWithdrawalDTO {
  amount: number;
  withdrawalType: 'debt' | 'salary_advance';
  fundId: number;
  notes?: string;
}

// Employee production DTOs
export interface EmployeeProductionDTO {
  itemId: number;
  quantity: number;
  productionRate: number;
  notes?: string;
}

// Employee hours DTOs
export interface EmployeeHoursDTO {
  hours: number;
  hourlyRate: number;
  notes?: string;
}

// Employee salary DTO (for daily salary operations)
export interface EmployeeSalaryDTO {
  invoiceType: 'expense';
  invoiceCategory: string;
  relatedEmployeeId: number;
  employeeInvoiceType: 'salary';
  paidStatus: boolean;
  totalAmount: number;
  notes?: string;
  fundId: number;
}

// Financial summary parameters
export interface FinancialSummaryParams {
  startDate: string;
  endDate: string;
}

/**
 * Maps an InvoiceCategory and mode to the corresponding employee operation type
 */
export function getEmployeeOperationFromCategoryAndMode(
  category: string,
  mode: 'income' | 'expense'
): string | null {
  if (mode === 'income') {
    switch (category) {
      case 'EMPLOYEE_DEBT':
        return 'debtPayment';
      case 'EMPLOYEE_WITHDRAWAL_RETURN':
        return 'returnWithdrawal';
      default:
        return null;
    }
  } else {
    switch (category) {
      case 'EMPLOYEE_DEBT':
        return 'debt';
      case 'EMPLOYEE_WITHDRAWAL':
        return 'salary_advance';
      case 'DAILY_EMPLOYEE_RENT':
        return 'daily_salary';
      default:
        return null;
    }
  }
}