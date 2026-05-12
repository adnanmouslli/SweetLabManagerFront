// src/services/invoiceService.ts
import { InvoiceStatus } from "@/components/common/InvoiceTabs";
import { ShiftData } from "@/hooks/invoices/useInvoice";
import {
  DirectDebtDTO,
  ExpenseProductsDTO,
  IncomeProductsDTO,
  Invoice,
  InvoiceQueryParams,
  PaginatedInvoicesResponse,
  SingleFetchedInvoice,
} from "@/types/invoice.type";
import { apiClient } from "@/utils/axios";

// Interface for the update invoice data
interface UpdateInvoiceDTO {
  customerId?: number;
  discount: number;
  items: {
    itemId: number;
    unitPrice: number;
    quantity: number;
    subTotal: number;
  }[];
  trayCount: number;
}

export class InvoiceService {
  static async fetchInvoices(
    status: InvoiceStatus | "all" = "all"
  ): Promise<Invoice[]> {
    if (status == "all") {
      const response = await apiClient.get<Invoice[]>("/invoices");
      return response;
    } else {
      const response = await apiClient.get<Invoice[]>(
        `/invoices?status=${status}`
      );
      return response;
    }
  }

  static async fetchFundInvoices(fundId: string): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>(
      "/invoices?fundId=" + fundId
    );
    return response;
  }

  static async fetchPaginatedInvoices(params: InvoiceQueryParams): Promise<PaginatedInvoicesResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.fundId) searchParams.set("fundId", params.fundId.toString());
    if (params.type) searchParams.set("type", params.type);
    if (params.category) searchParams.set("category", params.category);
    if (params.status) searchParams.set("status", params.status);
    if (params.startDate) searchParams.set("startDate", params.startDate);
    if (params.endDate) searchParams.set("endDate", params.endDate);
    if (params.paidStatus) searchParams.set("paidStatus", params.paidStatus);
    if (params.search) searchParams.set("search", params.search);

    const response = await apiClient.get<PaginatedInvoicesResponse>(
      `/invoices?${searchParams.toString()}`
    );
    return response;
  }

  static async fetchCurrentInvoices(): Promise<ShiftData | false> {

    try {
      const response = await apiClient.get<ShiftData>("/invoices/current-shift");
      return response;
    } catch (error) {
      return false;
    }
  }

  static async fetchInvoiceById(
    id: number | string
  ): Promise<SingleFetchedInvoice> {
    const response = await apiClient.get<SingleFetchedInvoice>(
      `/invoices/${id}`
    );
    return response;
  }

  // New method for deleting invoices
  static deleteInvoice = async (id: number | string) => {
    const response = await apiClient.delete(`/invoices/${id}`);
    return response;
  };

  static async updateInvoiceStatus(
    invoiceId: number,
    status: "paid" | "debt"
  ): Promise<Invoice> {
    const response = await apiClient.patch<Invoice>(
      `/invoices/${invoiceId}/status`,
      {
        status,
      }
    );
    return response;
  }

  static createIncomeProducts = async (data: IncomeProductsDTO) => {
    const response = await apiClient.post("/invoices", data);
    return response;
  };

  static createExpenseProducts = async (data: ExpenseProductsDTO) => {
    const response = await apiClient.post("/invoices", data);
    return response;
  };

  static createDirectDebt = async (data: DirectDebtDTO) => {
    const response = await apiClient.post("/invoices", data);
    return response;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static markInvoiceAsPaid = async (id: string | number, data: any) => {
    const response = await apiClient.post(`/invoices/${id}/pay`, data);
    return response;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static markInvoiceAsDebt = async (id: string | number, data: any) => {
    const response = await apiClient.post(
      `/invoices/${id}/convert-to-debt`,
      data
    );
    return response;
  };


  static markInvoiceAsBreakage = async (id: string | number, data: {
    "initialPayment": number,
    "notes": string
  }) => {
    const response = await apiClient.post(
      `/invoices/${id}/convert-to-break`,
      data
    );
    return response;
  };

  // New method for updating invoices
  static updateInvoice = async (id: number, data: UpdateInvoiceDTO) => {
    const response = await apiClient.put(`/invoices/${id}`, data);
    return response;
  };
}
