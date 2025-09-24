import { TransferService } from "@/services/transfer.service";
import {
  HandleShiftTransferResponse,
  PendingTransfersResponse,
  TransferHistoryResponse,
} from "@/types/transfer.type";
import { apiClient } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Fund {
  id: number;
  fundType: "main" | "general" | "booth" | "university";
  currentBalance: number;
  lastUpdate: string; // ISO date string
  shiftBalance? : number
}

interface TransferToMainDTO {
  amount: number;
}

export const useFunds = () => {
  return useQuery<Fund[]>({
    queryKey: ["funds"],
    queryFn: async () => {
      const response = (await apiClient.get("/funds")) as Fund[];
      return response;
    },
  });
};

export const useTransferToMain = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TransferToMainDTO) => {
      const response = await apiClient.post("/funds/transfer-to-main", data);
      return response;
    },
    onSuccess: () => {
      // Invalidate fund queries
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      
      // Transfers affect shift summaries
      queryClient.invalidateQueries({ queryKey: ["shiftSummary"] });
      queryClient.invalidateQueries({ queryKey: ["shiftInvoices"] });
      
      // Transfers are tracked in transfer history
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });
      
      // Current invoices might be affected by fund transfers
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
    },
    onError: (error) => {
      console.error("Error transfering funds:", error);
    },
  });
};

export const useTransferToNextShift = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: TransferService.generalToNextShift,
    onSuccess: () => {
      // Invalidate fund queries
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      
      // Affects pending transfers
      queryClient.invalidateQueries({ queryKey: ["pendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["checkingPendingTransfers"] });
      
      // Affects transfer history
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });
      
      // Affects shift summaries
      queryClient.invalidateQueries({ queryKey: ["shiftSummary"] });
      queryClient.invalidateQueries({ queryKey: ["shiftInvoices"] });
    },
    onError: (error) => {
      console.error("Error transfering funds:", error);
    },
  });
};

export const usePendingTransfers = () => {
  return useQuery<PendingTransfersResponse>({
    queryKey: ["pendingTransfers"],
    queryFn: TransferService.getNextShiftPendingTransfers,
  });
};

export const useTransferHistory = (
  status?: "pending" | "accepted" | "rejected"
) => {
  return useQuery<TransferHistoryResponse>({
    queryKey: ["transferHistory", status],
    queryFn: () => TransferService.getTransferHistory(status),
  });
};

export const useHandlePendingTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    HandleShiftTransferResponse,
    Error,
    {
      id: string;
      data: {
        accept: boolean;
        shiftId: number;
        notes: string;
      };
    }
  >({
    mutationFn: ({ id, data }) =>
      TransferService.handlePendingTransfer(id, data),

    onSuccess: () => {
      // Invalidate pending transfers
      queryClient.invalidateQueries({ queryKey: ["pendingTransfers"] });
      queryClient.invalidateQueries({ queryKey: ["checkingPendingTransfers"] });
      
      // Invalidate transfer history
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });
      
      // Handling transfers affects fund balances
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      
      // Affects shift summaries
      queryClient.invalidateQueries({ queryKey: ["shiftSummary"] });
      queryClient.invalidateQueries({ queryKey: ["shiftInvoices"] });
      
      // Affects current invoices as they track fund movements
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
    },

    onError: (error) => {
      console.error("Error handling pending transfer:", error);
    },
  });
};
