// Audit Logs Hooks
import { useQuery } from "@tanstack/react-query";
import { AuditLogsService } from "@/services/audit-logs.service";
import {
  AuditLog,
  AuditLogResponse,
  AuditSummary,
  AuditLogQuery,
} from "@/types/audit-logs.type";

// Main audit logs query hook
export const useAuditLogs = (query?: AuditLogQuery) => {
  return useQuery<AuditLogResponse, Error>({
    queryKey: ["audit-logs", query],
    queryFn: () => AuditLogsService.getAuditLogs(query),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};

// Summary statistics hook
export const useAuditSummary = (startDate?: string, endDate?: string) => {
  return useQuery<AuditSummary[], Error>({
    queryKey: ["audit-logs-summary", startDate, endDate],
    queryFn: () => AuditLogsService.getSummary(startDate, endDate),
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

// Entity history hook
export const useEntityHistory = (
  entity: string,
  entityId: number,
  enabled: boolean = true
) => {
  return useQuery<AuditLog[], Error>({
    queryKey: ["audit-logs-entity", entity, entityId],
    queryFn: () => AuditLogsService.getEntityHistory(entity, entityId),
    enabled: enabled && !!entity && !!entityId,
  });
};

// User activity hook
export const useUserActivity = (
  userId: number,
  limit?: number,
  enabled: boolean = true
) => {
  return useQuery<AuditLog[], Error>({
    queryKey: ["audit-logs-user", userId, limit],
    queryFn: () => AuditLogsService.getUserActivity(userId, limit),
    enabled: enabled && !!userId,
  });
};

// Single audit log detail hook
export const useAuditLogDetail = (
  id: number | null,
  enabled: boolean = true
) => {
  return useQuery<AuditLog, Error>({
    queryKey: ["audit-logs", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required");
      return AuditLogsService.getAuditLogById(id);
    },
    enabled: enabled && !!id,
  });
};
