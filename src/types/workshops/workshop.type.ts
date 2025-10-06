// Workshop types for the frontend
import { Employee, WorkType } from '../employees.type';
import { Fund } from '../funds.type';
import { Invoice } from '../invoice.type';
import { Item } from '../items.type';

// Base Workshop interface
export interface Workshop {
  id: number;
  name: string;
  workType: WorkType;
  password?: string;
  createdAt: string;
  updatedAt: string;
  employees?: Employee[];
  productionRecords?: WorkshopProduction[];
  settlements?: WorkshopSettlement[];
  financialSummary?: WorkshopFinancialSummary;
  hourRecords?: WorkshopHours[];
}

// Workshop Hours record (kept for compatibility)
export interface WorkshopHours {
  id: number;
  workshopId: number;
  employeeId: number;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Production Item (updated structure to match JSON)
export interface ProductionItem {
  itemId: number;
  itemName: string;
  quantity: number;
  rate: number;
  total: number;
}

// Workshop Production record (updated structure to match JSON)
export interface WorkshopProduction {
  id: number;
  workshopId: number;
  date: string;
  totalProduction: number;
  items: ProductionItem[];
  notes?: string;
}

// Workshop Settlement (new interface based on JSON)
export interface WorkshopSettlement {
  id: number;
  workshopId: number;
  amount: number;
  paidAmount: number;
  date: string;
  totalEarnings : number;
  totalWithdrawals : number;
  fundId: number;
  invoiceId: number;
  notes?: string;
  fund: Fund;
  invoice: Invoice;
}

// Daily Summary Item (for financial summary)
export interface DailySummaryItem {
  rate: number;
  total: number;
  itemId: number;
  itemName: string;
  quantity: number;
}

// Daily Summary Item (for financial summary)
export interface DailySummaryEmployee {
  employeeId: number,
  employeeName: string,
  hours: number,
  hourlyRate: number,
  amount: number
}


// Daily Summary (for financial summary)
export interface DailySummary {
  date: string;
  // for production workshops
  totalProduction?: number;
  items?: DailySummaryItem[];

  // for hourly workshops
  totalHours?: number;
  totalAmount?: number;
  employees?: DailySummaryEmployee[];
}

// Workshop Financial Summary (updated structure to match JSON)
export interface WorkshopFinancialSummary {
  workshopId: number;
  workshopName: string;
  workType: string;
  totalWithdrawals: number;
  totalEarnings: number;
  totalDebt: number;
  netAmount: number;
  period: {
    startDate: string;
    endDate: string;
  };
  dailySummary: DailySummary[];
}


// DTOs for creating/updating workshops
export interface CreateWorkshopDTO {
  name: string;
  workType: WorkType;
  password: string;
  notes?: string;
}

export interface UpdateWorkshopDTO {
  name?: string;
  workType?: WorkType;
  password?: string;
  notes?: string;
}

// Production related DTOs
export interface ProductionItemDTO {
  itemId: number;
  quantity: number;
}

export interface CreateWorkshopProductionDTO {
  date?: string;
  items: ProductionItemDTO[];
  notes?: string;
}

// Hours related DTOs
export interface CreateWorkshopHoursDTO {
  employeeId: number;
  hours: number;
  hourlyRate: number;
  date?: string;
  notes?: string;
}

// Settlement DTO
export interface CreateWorkshopSettlementDTO {
  amount: number;
  fundId: number;
  notes?: string;
  distributionType?: 'manual' | 'automatic';
  manualDistributions?: {
    employeeId: number;
    amount: number;
  }[];
}

// Parameters for fetching financial summary
export interface WorkshopFinancialSummaryParams {
  startDate: string;
  endDate: string;
}
