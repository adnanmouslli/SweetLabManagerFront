import { apiClient } from "@/utils/axios";
import { AllCustomerType, CreateCustomerRequest, UpdateCustomerRequest } from "@/types/customers.type";

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

export class CustomersService {
  // Get all customers
  static async getAllCustomers(): Promise<AllCustomerType[]> {
    const response = await apiClient.get<AllCustomerType[]>('/customers');
    return response;
  }

  // Create new customer
  static async createCustomer(data: CreateCustomerRequest): Promise<AllCustomerType> {
    const response = await apiClient.post<AllCustomerType>('/customers', data);
    return response;
  }

  // Update customer
  static async updateCustomer(id: number, data: UpdateCustomerRequest): Promise<AllCustomerType> {
    const response = await apiClient.put<AllCustomerType>(`/customers/${id}`, data);
    return response;
  }

  // Delete customer
  static async deleteCustomer(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/customers/${id}`);
    return response;
  }

  // Get supplier balance
  static async getSupplierBalance(supplierId: number): Promise<SupplierBalanceResponse> {
    const response = await apiClient.get<SupplierBalanceResponse>(
      `/customers/${supplierId}/supplier-balance`
    );
    return response;
  }

  // Pay supplier dues (zero out balance)
  static async paySupplierDues(supplierId: number, data: SupplierPaymentRequest): Promise<SupplierPaymentResponse> {
    const response = await apiClient.post<SupplierPaymentResponse>(
      `/customers/${supplierId}/supplier-payment`,
      data
    );
    return response;
  }
}
