/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/shifts/useShifts.ts
import { ShiftSummaryData } from "@/components/common/CloseShiftModal";
import { TransferService } from "@/services/transfer.service";
import {
  CheckPendingTransfersResponse,
  ShiftsInvoices,
} from "@/types/shifts.type";
import { apiClient } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface OpenShiftDTO {
  shiftType: "morning" | "evening";
}
// Define response type based on Postman response
interface CloseShiftResponse {
  message: string;
  shift: {
    id: number;
    shiftType: "morning" | "evening";
    status: "closed";
    openTime: string;
    closeTime: string;
    differenceStatus: "surplus" | "deficit" | null;
    differenceValue: number;
    employeeId: number;
    employee: {
      id: number;
      username: string;
    };
  };
  expectedAmount: number;
  actualAmount: number;
  differenceStatus: "surplus" | "deficit" | null;
  differenceValue: number;
  transfers: {
    boothTransfer: number;
    universityTransfer: number;
    totalTransferred: number;
  };
}
// Input DTO for closing shift
export interface CloseShiftDTO {
  actualAmount: number;
}

// hooks/shifts/useShifts.ts
export const useOpenShift = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OpenShiftDTO) => {
      const response = await apiClient.post("shifts", data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate shift queries
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shiftSummary"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });

      // Opening a shift affects fund tracking
      queryClient.invalidateQueries({ queryKey: ["funds"] });

      // Affects pending transfers
      queryClient.invalidateQueries({ queryKey: ["checkingPendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingTransfers"] });

      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useCloseShift = (options?: {
  onSuccess?: (data: CloseShiftResponse) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<CloseShiftResponse, any, CloseShiftDTO>({
    mutationFn: async (data: CloseShiftDTO) => {
      // Changed to POST request with only actualAmount in the body
      const response = await apiClient.post<CloseShiftResponse>("shifts/close", {
        actualAmount: data.actualAmount
      });
      return response;
    },
    onSuccess: (data) => {
      // Invalidate all shift-related queries
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shiftSummary"] });
      queryClient.invalidateQueries({ queryKey: ["shiftInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });

      // Closing shift affects fund balances
      queryClient.invalidateQueries({ queryKey: ["funds"] });

      // Affects pending transfers
      queryClient.invalidateQueries({ queryKey: ["checkingPendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });

      // Affects invoices as they are tied to shifts
      queryClient.invalidateQueries({ queryKey: ["invoices"] });

      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useCheckPendingTransfers = () => {
  return useQuery<CheckPendingTransfersResponse>({
    queryKey: ["checkingPendingTransfers"],
    queryFn: TransferService.checkPendingTransfers,
  });
};

export const useShiftSummary = () => {
  return useQuery<ShiftSummaryData>({
    queryKey: ["shiftSummary"],
    queryFn: async () => {
      const response = (await apiClient.get(
        "shifts/current/summary"
      )) as ShiftSummaryData;
      return response;
    },
    enabled: false,
  });
};

export const useShiftInvoices = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<ShiftsInvoices>({
    queryKey: ["shiftInvoices", id],
    queryFn: async () => {
      const response = (await apiClient.get(
        `shifts/${id}/invoices-by-fund`
      )) as ShiftsInvoices;
      return response;
    },
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useFetchShiftSummary = (options?: {
  onSuccess?: (data: ShiftSummaryData) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.get(`shifts/${id}/summary`);
      return response as ShiftSummaryData;
    },
    onSuccess: (data, shiftId) => {
      // Update the cache for this specific shift summary
      queryClient.setQueryData(["shiftSummary", shiftId], data);

      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export interface Employee {
  id: number;
  username: string;
}

export interface QueryShiftType {
  id: number;
  shiftType: "morning" | "evening";
  status: "open" | "closed" | "partially_closed";
  openTime: string;
  closeTime: string;
  employeeId: number;
  employee: Employee;
  differenceStatus: "surplus" | "deficit" | null;
  differenceValue: number | null;
}

export const useShifts = () => {
  return useQuery<QueryShiftType[]>({
    queryKey: ["shifts"],
    queryFn: async () => {
      const response = (await apiClient.get("shifts")) as QueryShiftType[];

      return response;
    },
    // enabled: false,
  });
};

export interface PaginatedShiftsResponse {
  data: QueryShiftType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShiftsQueryParams {
  page: number;
  limit: number;
  search?: string;
  shiftType?: "morning" | "evening";
  status?: "open" | "closed" | "partially_closed";
}

/**
 * نسخة مقسّمة على صفحات من قائمة الورديات (بحث/فلترة تتم في الباك)،
 * تُستخدم في شاشة "سجل الورديات" لتفادي تحميل كامل السجل التاريخي دفعة واحدة.
 */
export const useShiftsPaginated = (params: ShiftsQueryParams) => {
  return useQuery<PaginatedShiftsResponse>({
    queryKey: ["shifts", "paginated", params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedShiftsResponse>("shifts", {
        params,
      });
      return response;
    },
  });
};


export const useCloseShiftPartially = (options?: {
  onSuccess?: (data: CloseShiftResponse) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<CloseShiftResponse, any>({
    mutationFn: async () => {
      const response = await apiClient.get<CloseShiftResponse>(`shifts/partial-close`);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shiftSummary"] });
      queryClient.invalidateQueries({ queryKey: ["shiftInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["checkingPendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });

      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};


export const useCompleteClosure = () => {
  const queryClient = useQueryClient();

  return useMutation<CloseShiftResponse, any, { id: number, data: CloseShiftDTO }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.post<CloseShiftResponse>(`shifts/${id}/complete-closure`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shiftSummary"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shiftInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["checkingPendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
