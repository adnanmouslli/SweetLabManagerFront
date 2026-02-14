import {
  CreateWorkshopDTO,
  CreateWorkshopHoursDTO,
  CreateWorkshopProductionDTO,
  CreateWorkshopSettlementDTO,
  UpdateWorkshopDTO,
  UpdateWorkshopProductionDTO,
  UpdateWorkshopHoursDTO,
  Workshop,
  WorkshopFinancialSummary,
  WorkshopFinancialSummaryParams,
  WorkshopHours,
  WorkshopProduction,
  WorkshopSettlement
} from '@/types/workshops/workshop.type';
import { apiClient } from '@/utils/axios';

export class WorkshopService {
  // Base workshop operations
  static async getAllWorkshops(): Promise<Workshop[]> {
    const response = await apiClient.get<Workshop[]>('/workshops');
    return response;
  }

  static async getWorkshopById(id: number, password?: string): Promise<Workshop> {
    const response = await apiClient.get<Workshop>(`/workshops/${id}`,);
    return response;
  }

  static async createWorkshop(data: CreateWorkshopDTO): Promise<Workshop> {
    const response = await apiClient.post<Workshop>('/workshops', data);
    return response;
  }

  static async updateWorkshop(id: number, data: UpdateWorkshopDTO, password?: string): Promise<Workshop> {
    const response = await apiClient.put<Workshop>(`/workshops/${id}`, data,);
    return response;
  }

  // Production operations
  static async addWorkshopProduction(
    workshopId: number,
    data: CreateWorkshopProductionDTO,
  ): Promise<WorkshopProduction> {
    const response = await apiClient.post<WorkshopProduction>(
      `/workshops/${workshopId}/production`,
      data,
    );
    return response;
  }

  // Update production
  static async updateWorkshopProduction(
    workshopId: number,
    productionRecordId: number,
    data: UpdateWorkshopProductionDTO,
  ): Promise<WorkshopProduction> {
    const response = await apiClient.patch<WorkshopProduction>(
      `/workshops/${workshopId}/production/${productionRecordId}`,
      data,
    );
    return response;
  }

  // Delete production
  static async deleteWorkshopProduction(
    workshopId: number,
    productionRecordId: number,
  ): Promise<void> {
    await apiClient.delete(`/workshops/${workshopId}/production/${productionRecordId}`);
  }

  // Hours operations
  static async addWorkshopHours(
    workshopId: number,
    data: CreateWorkshopHoursDTO,
  ): Promise<WorkshopHours> {
    const response = await apiClient.post<WorkshopHours>(
      `/workshops/${workshopId}/hours`,
      data,
    );
    return response;
  }

  // Update hours
  static async updateWorkshopHours(
    workshopId: number,
    hoursRecordId: number,
    data: UpdateWorkshopHoursDTO,
  ): Promise<WorkshopHours> {
    const response = await apiClient.patch<WorkshopHours>(
      `/workshops/${workshopId}/hours/${hoursRecordId}`,
      data,
    );
    return response;
  }

  // Delete hours
  static async deleteWorkshopHours(
    workshopId: number,
    hoursRecordId: number,
  ): Promise<void> {
    await apiClient.delete(`/workshops/${workshopId}/hours/${hoursRecordId}`);
  }

  // Settlement operations
  static async createWorkshopSettlement(
    workshopId: number,
    data: CreateWorkshopSettlementDTO,
  ): Promise<WorkshopSettlement> {
    const response = await apiClient.post<WorkshopSettlement>(
      `/workshops/${workshopId}/settlement`,
      data,
    );
    return response;
  }

  // Financial summary
  static async getWorkshopFinancialSummary(
    workshopId: number,
    params: WorkshopFinancialSummaryParams,
  ): Promise<WorkshopFinancialSummary> {
    const response = await apiClient.get<WorkshopFinancialSummary>(
      `/workshops/${workshopId}/summary`,
      {
        params,
      }
    );
    return response;
  }

  // Additional employee management operations
  static async addEmployeeToWorkshop(
    workshopId: number,
    employeeId: number,

  ): Promise<void> {
    await apiClient.post(`/workshops/${workshopId}/employees/${employeeId}`,);
  }

  static async removeEmployeeFromWorkshop(
    workshopId: number,
    employeeId: number,

  ): Promise<void> {
    await apiClient.delete(`/workshops/${workshopId}/employees/${employeeId}`,);
  }
}
