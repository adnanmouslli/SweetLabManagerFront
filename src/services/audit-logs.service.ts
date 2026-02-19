// Audit Logs Service
import { apiClient } from "@/utils/axios";
import {
  AuditLog,
  AuditLogResponse,
  AuditSummary,
  AuditLogQuery,
} from "@/types/audit-logs.type";

export class AuditLogsService {
  // Get audit logs with filters and pagination
  static async getAuditLogs(
    query?: AuditLogQuery
  ): Promise<AuditLogResponse> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.userId) params.append("userId", query.userId.toString());
    if (query?.action) params.append("action", query.action);
    if (query?.entity) params.append("entity", query.entity);
    if (query?.entityId) params.append("entityId", query.entityId.toString());
    if (query?.method) params.append("method", query.method);
    if (query?.startDate) params.append("startDate", query.startDate);
    if (query?.endDate) params.append("endDate", query.endDate);
    if (query?.search) params.append("search", query.search);
    if (query?.customerName) params.append("customerName", query.customerName);
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const url = `/audit-logs${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get<AuditLogResponse>(url);
    return response;
  }

  // Get summary statistics
  static async getSummary(
    startDate?: string,
    endDate?: string
  ): Promise<AuditSummary[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const url = `/audit-logs/summary${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get<AuditSummary[]>(url);
    return response;
  }

  // Get entity history
  static async getEntityHistory(
    entity: string,
    entityId: number
  ): Promise<AuditLog[]> {
    const response = await apiClient.get<AuditLog[]>(
      `/audit-logs/entity/${entity}/${entityId}`
    );
    return response;
  }

  // Get user activity
  static async getUserActivity(
    userId: number,
    limit?: number
  ): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    const url = `/audit-logs/user/${userId}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get<AuditLog[]>(url);
    return response;
  }

  // Get single audit log detail
  static async getAuditLogById(id: number): Promise<AuditLog> {
    const response = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
    return response;
  }
}
