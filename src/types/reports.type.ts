// Reports types for the frontend
export interface ReportFilters {
    // Common filters
    startDate?: string;
    endDate?: string;
    download?: boolean;

    // Orders inventory filters
    customerName?: string;
    categoryId?: number;
    status?: string[];
    paidStatus?: boolean | 'all';
    itemIds?: number[];

    // Warehouse inventory filters
    year?: number;
    month?: number;
    itemGroupId?: number;

    // Comparison filters
    year1?: number;
    month1?: number;
    year2?: number;
    month2?: number;

    // Debts inventory filters
    customerIds?: number[];

    // Shift summary filters
    shiftId?: number;
}

// Report configuration interface
export interface ReportConfig {
    id: string;
    title: string;
    description: string;
    category: ReportCategory;
    icon: string;
    endpoint: string;
    filters: ReportFilterConfig[];
    requiredFilters?: string[];
}

// Report categories
export enum ReportCategory {
    ORDERS = 'orders',
    WAREHOUSE = 'warehouse',
    BOOTH = 'booth',
    ITEMS = 'items',
    DEBTS = 'debts',
    PRODUCTS = 'products',
    FUNDS = 'funds',
    SHIFTS = 'shifts',
    CUSTOMERS = 'customers',
    SALES = 'sales'
}

// Individual filter configuration
export interface ReportFilterConfig {
    key: string;
    label: string;
    type: FilterType;
    placeholder?: string;
    options?: FilterOption[];
    required?: boolean;
    multiple?: boolean;
    min?: number;
    max?: number;
    step?: number;
}

// Filter types
export enum FilterType {
    TEXT = 'text',
    NUMBER = 'number',
    DATE = 'date',
    SELECT = 'select',
    MULTISELECT = 'multiselect',
    BOOLEAN = 'boolean'
}

// Filter option for select/multiselect
export interface FilterOption {
    value: string | number;
    label: string;
}

// Report response interface
export interface ReportResponse {
    success: boolean;
    data?: string; // HTML content
    message?: string;
    period?: {
        startDate?: string;
        endDate?: string;
        year?: number;
        month?: number;
    };
    periods?: {
        period1: { year: number; month: number };
        period2: { year: number; month: number };
    };
}

// Specific report DTOs
export interface OrdersInventoryReportDTO {
    customerName?: string;
    categoryId?: number;
    status?: string[];
    paidStatus?: boolean;
    itemIds?: number[];
    startDate?: string;
    endDate?: string;
    download?: boolean;
}

export interface WarehouseInventoryReportDTO {
    year?: number;
    month?: number;
    itemGroupId?: number;
    itemIds?: number[];
    download?: boolean;
}

export interface WarehouseComparisonReportDTO {
    year1?: number;
    month1?: number;
    year2?: number;
    month2?: number;
    download?: boolean;
}

export interface BoothInventoryReportDTO {
    startDate: string;
    endDate: string;
    download?: boolean;
}

export interface ItemConsumptionReportDTO {
    itemId: number;
    startDate: string;
    endDate: string;
    download?: boolean;
}

export interface ItemPurchaseReportDTO {
    itemId: number;
    startDate: string;
    endDate: string;
    download?: boolean;
}

export interface DebtsInventoryReportDTO {
    categoryId?: number;
    customerIds?: number[];
    download?: boolean;
}

export interface DebtDetailsReportDTO {
    debtId: number;
    startDate: string;
    endDate: string;
    download?: boolean;
}

export interface ProductSalesReportDTO {
    itemIds: number[];
    startDate: string;
    endDate: string;
    download?: boolean;
}

export interface FundsMovementReportDTO {
    startDate: string;
    endDate: string;
    download?: boolean;
}

export interface ShiftSummaryReportDTO {
    shiftId?: number;
    download?: boolean;
}

export interface CustomerStatementReportDTO {
    customerId: number;
    download?: boolean;
}

export interface SalesReportDTO {
    startDate?: string;
    endDate?: string;
    download?: boolean;
}

// Report generation result
export interface ReportGenerationResult {
    success: boolean;
    filename?: string;
    content?: string;
    error?: string;
}

// Filter values state
export interface FilterValues {
    [key: string]: any;
}

// Report modal state
export interface ReportModalState {
    isOpen: boolean;
    selectedReport: ReportConfig | null;
    filters: FilterValues;
    isLoading: boolean;
}
