import {
    ConvertToInvoiceRequest,
    OrdersService
} from "@/services/orders.service";
import {
    FilterOrders,
    OrderResponseDto,
    OrderStatus,
    OrdersCategoriesCreateDto,
    OrdersCategoriesFetchDto,
    OrdersSummary,
    UpdateOrder,
    OrderCategoryUpdateDto,
    OrdersCreateDto
} from "@/types/orders.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Order Categories Hooks
export const useOrderCategories = (params?: Partial<FilterOrders>) => {
    return useQuery<OrdersCategoriesFetchDto[], Error>({
        queryKey: ["orderCategories", params],
        queryFn: () => OrdersService.fetchOrderCategoriesWithCustomers(params),
    });
};

export const useCreateOrderCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: OrdersCategoriesCreateDto) => OrdersService.createOrderCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orderCategories"] });
        },
    });
};

export const useUpdateOrderCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderCategoryId,
            data
        }: {
            orderCategoryId: number,
            data: OrderCategoryUpdateDto
        }) => OrdersService.updateOrderCategory(orderCategoryId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orderCategories"] });
        },
    });
};

export const useDeleteOrderCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderCategoryId: number) => OrdersService.deleteOrderCategory(orderCategoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orderCategories"] });
        },
    });
};

// Orders Hooks
export const useOrders = (params?: FilterOrders) => {
    return useQuery<OrderResponseDto[], Error>({
        queryKey: ["orders", params],
        queryFn: () => OrdersService.getOrders(params),
    });
};

export const useOrderById = (orderId: number) => {
    return useQuery<OrderResponseDto, Error>({
        queryKey: ["order", orderId],
        queryFn: () => OrdersService.getOrderById(orderId),
        enabled: !!orderId,
    });
};

// Hook to get the last order for a specific customer
export const useLastOrderForCustomer = (customerId: number | null) => {
    return useQuery<OrderResponseDto | null, Error>({
        queryKey: ["lastOrder", customerId],
        queryFn: () => customerId ? OrdersService.getLastOrderForCustomer(customerId) : null,
        enabled: !!customerId,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};

export const useOrdersSummary = () => {
    return useQuery<OrdersSummary, Error>({
        queryKey: ["ordersSummary"],
        queryFn: OrdersService.getOrdersSummary,
    });
};

export const useOrdersForPreparation = () => {
    return useQuery<OrderResponseDto[], Error>({
        queryKey: ["ordersForPreparation"],
        queryFn: OrdersService.getOrdersForPreparation,
    });
};

export const useOrdersForDeliveryToday = () => {
    return useQuery<OrderResponseDto[], Error>({
        queryKey: ["ordersForDeliveryToday"],
        queryFn: OrdersService.getOrdersForDeliveryToday,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: OrdersCreateDto) => OrdersService.createOrder(data),
        onSuccess: () => {
            // Invalidate queries affected by a new order
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["ordersSummary"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForPreparation"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForDeliveryToday"] });
        },
    });
};

export const useUpdateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number, data: UpdateOrder }) =>
            OrdersService.updateOrder(orderId, data),
        onSuccess: (_, { orderId }) => {
            // Invalidate specific order and related lists
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["ordersSummary"] });
            // Conditionally invalidate based on order changes (e.g., isForToday, status)
            queryClient.invalidateQueries({ queryKey: ["ordersForPreparation"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForDeliveryToday"] });
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            status,
            notes
        }: {
            orderId: number,
            status: OrderStatus,
            notes?: string
        }) => OrdersService.updateOrderStatus(orderId, status, notes),
        onSuccess: (_, { orderId, status }) => {
            // Invalidate specific order and related lists
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["ordersSummary"] });
            // Conditionally invalidate based on status
            if (status === OrderStatus.ready || status === OrderStatus.processing) {
                queryClient.invalidateQueries({ queryKey: ["ordersForPreparation"] });
            }
            if (status === OrderStatus.delivered) {
                queryClient.invalidateQueries({ queryKey: ["ordersForDeliveryToday"] });
            }
        },
    });
};

export const useConvertOrderToInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            data
        }: {
            orderId: number,
            data?: ConvertToInvoiceRequest
        }) => OrdersService.convertOrderToInvoice(orderId, data),
        onSuccess: (_, { orderId }) => {
            // Invalidate specific order and related lists
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["ordersSummary"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForPreparation"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForDeliveryToday"] });
        },
    });
};

export const useDeleteOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: number) => OrdersService.deleteOrder(orderId),
        onSuccess: (_, orderId) => {
            // Invalidate specific order and related lists
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["ordersSummary"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForPreparation"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForDeliveryToday"] });
        },
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) =>
            OrdersService.cancelOrder(orderId, reason),
        onSuccess: (_, { orderId }) => {
            // Invalidate specific order and related lists
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["ordersSummary"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForPreparation"] });
            queryClient.invalidateQueries({ queryKey: ["ordersForDeliveryToday"] });
        },
    });
};

// Queue System Hooks
export const useQueueStatus = () => {
    return useQuery<{ date: string; currentNumber: number }, Error>({
        queryKey: ["queueStatus"],
        queryFn: OrdersService.getQueueStatus,
        refetchInterval: 30000,
    });
};