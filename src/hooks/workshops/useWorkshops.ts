import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { WorkshopService } from '@/services/workshops/workshop.service';
import {
  Workshop,
  CreateWorkshopDTO,
  UpdateWorkshopDTO,
  CreateWorkshopProductionDTO,
  UpdateWorkshopProductionDTO,
  CreateWorkshopHoursDTO,
  UpdateWorkshopHoursDTO,
  CreateWorkshopSettlementDTO,
  WorkshopFinancialSummary,
  WorkshopFinancialSummaryParams,
  WorkshopProduction,
  WorkshopHours,
  WorkshopSettlement
} from '@/types/workshops/workshop.type';

// Query keys
const WORKSHOP_QUERY_KEYS = {
  all: ['workshops'] as const,
  byId: (id: number) => ['workshops', id] as const,
  summary: (id: number, params: WorkshopFinancialSummaryParams) =>
    ['workshops', id, 'summary', params] as const,
};

// Fetch all workshops
export const useWorkshops = (options?: UseQueryOptions<Workshop[], Error>) => {
  return useQuery<Workshop[], Error>({
    queryKey: WORKSHOP_QUERY_KEYS.all,
    queryFn: WorkshopService.getAllWorkshops,
    ...options
  });
};

// Fetch workshop by ID with password
export const useWorkshop = (
  workshopId: number,

  options?: UseQueryOptions<Workshop, Error>
) => {
  return useQuery<Workshop, Error>({
    queryKey: WORKSHOP_QUERY_KEYS.byId(workshopId),
    queryFn: () => WorkshopService.getWorkshopById(workshopId),
    enabled: !!workshopId,
    ...options
  });
};

// Create workshop
export const useCreateWorkshop = (
  options?: UseMutationOptions<Workshop, Error, CreateWorkshopDTO>
) => {
  const queryClient = useQueryClient();

  return useMutation<Workshop, Error, CreateWorkshopDTO>({
    mutationFn: WorkshopService.createWorkshop,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: WORKSHOP_QUERY_KEYS.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Update workshop with password
export const useUpdateWorkshop = (
  options?: UseMutationOptions<Workshop, Error, { id: number; data: UpdateWorkshopDTO; }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Workshop, Error, { id: number; data: UpdateWorkshopDTO; }>({
    mutationFn: ({ id, data }) => WorkshopService.updateWorkshop(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: WORKSHOP_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Add workshop production with password
export const useAddWorkshopProduction = (
  options?: UseMutationOptions<
    WorkshopProduction,
    Error,
    { workshopId: number; data: CreateWorkshopProductionDTO; }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkshopProduction,
    Error,
    { workshopId: number; data: CreateWorkshopProductionDTO; }
  >({
    mutationFn: ({ workshopId, data }) =>
      WorkshopService.addWorkshopProduction(workshopId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Update workshop production
export const useUpdateWorkshopProduction = (
  options?: UseMutationOptions<
    WorkshopProduction,
    Error,
    { workshopId: number; productionRecordId: number; data: UpdateWorkshopProductionDTO; }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkshopProduction,
    Error,
    { workshopId: number; productionRecordId: number; data: UpdateWorkshopProductionDTO; }
  >({
    mutationFn: ({ workshopId, productionRecordId, data }) =>
      WorkshopService.updateWorkshopProduction(workshopId, productionRecordId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      queryClient.invalidateQueries({ queryKey: WORKSHOP_QUERY_KEYS.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Delete workshop production
export const useDeleteWorkshopProduction = (
  options?: UseMutationOptions<
    void,
    Error,
    { workshopId: number; productionRecordId: number; }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { workshopId: number; productionRecordId: number; }
  >({
    mutationFn: ({ workshopId, productionRecordId }) =>
      WorkshopService.deleteWorkshopProduction(workshopId, productionRecordId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      queryClient.invalidateQueries({ queryKey: WORKSHOP_QUERY_KEYS.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Add workshop hours with password
export const useAddWorkshopHours = (
  options?: UseMutationOptions<
    WorkshopHours,
    Error,
    { workshopId: number; data: CreateWorkshopHoursDTO; }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkshopHours,
    Error,
    { workshopId: number; data: CreateWorkshopHoursDTO; }
  >({
    mutationFn: ({ workshopId, data }) =>
      WorkshopService.addWorkshopHours(workshopId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Update workshop hours
export const useUpdateWorkshopHours = (
  options?: UseMutationOptions<
    WorkshopHours,
    Error,
    { workshopId: number; hoursRecordId: number; data: UpdateWorkshopHoursDTO; }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkshopHours,
    Error,
    { workshopId: number; hoursRecordId: number; data: UpdateWorkshopHoursDTO; }
  >({
    mutationFn: ({ workshopId, hoursRecordId, data }) =>
      WorkshopService.updateWorkshopHours(workshopId, hoursRecordId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      queryClient.invalidateQueries({ queryKey: WORKSHOP_QUERY_KEYS.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Delete workshop hours
export const useDeleteWorkshopHours = (
  options?: UseMutationOptions<
    void,
    Error,
    { workshopId: number; hoursRecordId: number; }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { workshopId: number; hoursRecordId: number; }
  >({
    mutationFn: ({ workshopId, hoursRecordId }) =>
      WorkshopService.deleteWorkshopHours(workshopId, hoursRecordId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      queryClient.invalidateQueries({ queryKey: WORKSHOP_QUERY_KEYS.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Create workshop settlement with password
export const useCreateWorkshopSettlement = (
  options?: UseMutationOptions<
    WorkshopSettlement,
    Error,
    { workshopId: number; data: CreateWorkshopSettlementDTO; }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkshopSettlement,
    Error,
    { workshopId: number; data: CreateWorkshopSettlementDTO; }
  >({
    mutationFn: ({ workshopId, data }) =>
      WorkshopService.createWorkshopSettlement(workshopId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      queryClient.invalidateQueries({ queryKey: WORKSHOP_QUERY_KEYS.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Get workshop financial summary with password
export const useWorkshopFinancialSummary = (
  workshopId: number,
  params: WorkshopFinancialSummaryParams,

  options?: UseQueryOptions<WorkshopFinancialSummary, Error>
) => {
  return useQuery<WorkshopFinancialSummary, Error>({
    queryKey: WORKSHOP_QUERY_KEYS.summary(workshopId, params),
    queryFn: () => WorkshopService.getWorkshopFinancialSummary(workshopId, params),
    enabled: !!workshopId && !!params.startDate && !!params.endDate,
    ...options
  });
};

// Add employee to workshop with password
export const useAddEmployeeToWorkshop = (
  options?: UseMutationOptions<void, Error, { workshopId: number; employeeId: number; }>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { workshopId: number; employeeId: number; }>({
    mutationFn: ({ workshopId, employeeId }) =>
      WorkshopService.addEmployeeToWorkshop(workshopId, employeeId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['workshop'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// Remove employee from workshop
export const useRemoveEmployeeFromWorkshop = (
  options?: UseMutationOptions<void, Error, { workshopId: number; employeeId: number; }>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { workshopId: number; employeeId: number; }>({
    mutationFn: ({ workshopId, employeeId }) =>
      WorkshopService.removeEmployeeFromWorkshop(workshopId, employeeId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: WORKSHOP_QUERY_KEYS.byId(variables.workshopId)
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['workshop'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};