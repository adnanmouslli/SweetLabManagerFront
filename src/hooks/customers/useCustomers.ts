import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/utils/axios";
import {
  AllCustomerType,
  CustomerSummaryData,
  CustomerType,
  CreateCustomerRequest,
  CreateCustomerResponse,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
  DeleteCustomerResponse,
  GetCustomersListResponse,
  GetAllCustomersResponse,
  CustomerAccountStatementResponse,
  GetCustomerCategoriesResponse,
  CreateCustomerCategoryRequest,
  CreateCustomerCategoryResponse,
  UpdateCustomerCategoryRequest,
  UpdateCustomerCategoryResponse,
  DeleteCustomerCategoryResponse,
  SupplierPaymentResponse,
} from "@/types/customers.type";
import { CustomerCategory } from "@/types/customerCategories.types";

/**
 * Hook for retrieving a simple list of customers with basic information
 */
export const useCustomersList = () => {
  return useQuery<CustomerType[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await apiClient.get<GetCustomersListResponse>(
        "/customers/list"
      );
      return response;
    },
  });
};

/**
 * Hook for retrieving detailed information for all customers
 */
export const useFetchCustomers = () => {
  return useQuery<AllCustomerType[]>({
    queryKey: ["all-customers"],
    queryFn: async () => {
      const response = await apiClient.get<GetAllCustomersResponse>(
        "/customers"
      );
      return response;
    },
  });
};

/**
 * Hook for retrieving a comprehensive account statement for a specific customer
 */
export const useSummaryCustomer = ({
  customerId,
}: {
  customerId: string;
}) => {
  return useQuery<CustomerSummaryData>({
    queryKey: ["customer-summary", customerId],
    queryFn: async () => {
      if (!customerId) {
        throw new Error("Customer ID is required");
      }
      const response = await apiClient.get<CustomerAccountStatementResponse>(
        `/customers/${customerId}/account-statement`
      );
      return response;
    },
    enabled: !!customerId, // Only run the query if we have a customer ID
  });
};

/**
 * Hook for retrieving a list of all customer categories
 */
export const useCustomerCategories = () => {
  return useQuery<CustomerCategory[]>({
    queryKey: ["customer-categories"],
    queryFn: async (): Promise<CustomerCategory[]> => {
      const response = await apiClient.get<GetCustomerCategoriesResponse>(
        "/customers/categories"
      );
      return response.categories;
    },
  });
};

// Function to format API errors
const formatError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyError = error as any;
    const message =
      anyError.response?.data?.message ||
      anyError.message ||
      "An unknown error occurred";
    return new Error(message);
  }

  return new Error("An unknown error occurred");
};

/**
 * Hook for creating a new customer
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateCustomerResponse, Error, CreateCustomerRequest>({
    mutationFn: async (customerData: CreateCustomerRequest) => {
      const response = await apiClient.post<CreateCustomerResponse>(
        "/customers",
        customerData
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate all customer queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });

      // Also invalidate related queries that might show customer information
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["debtsTracking"] });
    },
    onError: (error) => {
      console.error("Error creating customer:", error);
      throw formatError(error);
    },
  });
};

/**
 * Hook for updating an existing customer
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  interface UpdateCustomerParams extends UpdateCustomerRequest {
    id: number;
  }

  return useMutation<UpdateCustomerResponse, Error, UpdateCustomerParams>({
    mutationFn: async (customerData: UpdateCustomerParams) => {
      const { id, ...data } = customerData;
      const response = await apiClient.patch<UpdateCustomerResponse>(
        `/customers/${id}`,
        data
      );
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-summary", variables.id.toString()],
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["debtsTracking"] });
    },
    onError: (error) => {
      console.error("Error updating customer:", error);
      throw formatError(error);
    },
  });
};

/**
 * Hook for deleting a customer
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCustomerResponse, Error, number>({
    mutationFn: async (customerId: number) => {
      const response = await apiClient.delete<DeleteCustomerResponse>(
        `/customers/${customerId}`
      );
      return response;
    },
    onSuccess: (data, customerId) => {
      // Invalidate and refetch all customer queries
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-summary", customerId.toString()],
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["debtsTracking"] });
    },
    onError: (error) => {
      console.error("Error deleting customer:", error);
      throw formatError(error);
    },
  });
};

/**
 * Hook for creating a new customer category
 */
export const useCreateCustomerCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateCustomerCategoryResponse, Error, CreateCustomerCategoryRequest>({
    mutationFn: async (categoryData: CreateCustomerCategoryRequest) => {
      const response = await apiClient.post<CreateCustomerCategoryResponse>(
        "/customers/categories",
        categoryData
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate categories query
      queryClient.invalidateQueries({ queryKey: ["customer-categories"] });

      // Since customers include category info, invalidate customer queries too
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });
    },
    onError: (error) => {
      console.error("Error creating customer category:", error);
      throw formatError(error);
    },
  });
};

/**
 * Hook for updating an existing customer category
 */
export const useUpdateCustomerCategory = () => {
  const queryClient = useQueryClient();

  interface UpdateCustomerCategoryParams extends UpdateCustomerCategoryRequest {
    id: number;
  }

  return useMutation<UpdateCustomerCategoryResponse, Error, UpdateCustomerCategoryParams>({
    mutationFn: async (categoryData: UpdateCustomerCategoryParams) => {
      const { id, ...data } = categoryData;
      const response = await apiClient.patch<UpdateCustomerCategoryResponse>(
        `/customers/categories/${id}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate categories query
      queryClient.invalidateQueries({ queryKey: ["customer-categories"] });

      // Invalidate customer queries as they include category info
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });

      // Invalidate all customer summaries as they might display category info
      queryClient.invalidateQueries({ queryKey: ["customer-summary"] });
    },
    onError: (error) => {
      console.error("Error updating customer category:", error);
      throw formatError(error);
    },
  });
};

/**
 * Hook for deleting a customer category
 */
export const useDeleteCustomerCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCustomerCategoryResponse, Error, number>({
    mutationFn: async (categoryId: number) => {
      const response = await apiClient.delete<DeleteCustomerCategoryResponse>(
        `/customers/categories/${categoryId}`
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate categories query
      queryClient.invalidateQueries({ queryKey: ["customer-categories"] });

      // Invalidate customer queries as they include category info
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });

      // Invalidate all customer summaries as they might display category info
      queryClient.invalidateQueries({ queryKey: ["customer-summary"] });
    },
    onError: (error) => {
      console.error("Error deleting customer category:", error);
      throw formatError(error);
    },
  });
};

/**
 * Hook for paying supplier dues (zero out balance)
 */
export const usePaySupplierDues = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SupplierPaymentResponse,
    Error,
    { supplierId: number; amount: number; notes?: string }
  >({
    mutationFn: async ({ supplierId, amount, notes }) => {
      const response = await apiClient.post<SupplierPaymentResponse>(
        `/customers/${supplierId}/supplier-payment`,
        { amount, notes }
      );
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch customer data
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customers"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-summary", variables.supplierId.toString()],
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["debtsTracking"] });
    },
    onError: (error) => {
      console.error("Error paying supplier dues:", error);
      throw formatError(error);
    },
  });
};

/**
 * Hook for getting supplier balance
 */
export const useSupplierBalance = (supplierId: number | null) => {
  return useQuery<{ balance: number; currency: string }>({
    queryKey: ["supplier-balance", supplierId],
    queryFn: async () => {
      if (!supplierId) {
        throw new Error("Supplier ID is required");
      }
      const response = await apiClient.get<{ balance: number; currency: string }>(
        `/customers/${supplierId}/supplier-balance`
      );
      return response;
    },
    enabled: !!supplierId,
  });
};
