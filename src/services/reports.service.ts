import { apiClient } from '@/utils/axios';
import {
    ReportResponse,
    OrdersInventoryReportDTO,
    WarehouseInventoryReportDTO,
    WarehouseComparisonReportDTO,
    BoothInventoryReportDTO,
    ItemConsumptionReportDTO,
    ItemPurchaseReportDTO,
    DebtsInventoryReportDTO,
    DebtDetailsReportDTO,
    ProductSalesReportDTO,
    FundsMovementReportDTO,
    ShiftSummaryReportDTO,
    CustomerStatementReportDTO,
    SalesReportDTO,
    ReportGenerationResult
} from '@/types/reports.type';

class ReportsService {
    /**
     * Generate Orders Inventory Report
     */
    async generateOrdersInventoryReport(filters: OrdersInventoryReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            if (filters.customerName) params.append('customerName', filters.customerName);
            if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
            if (filters.status) params.append('status', filters.status.join(','));
            if (filters.paidStatus !== undefined) params.append('paidStatus', filters.paidStatus.toString());
            if (filters.itemIds) params.append('itemIds', filters.itemIds.join(','));
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/orders/inventory?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `orders-inventory-report-${Date.now()}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Warehouse Inventory Report
     */
    async generateWarehouseInventoryReport(filters: WarehouseInventoryReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            if (filters.year) params.append('year', filters.year.toString());
            if (filters.month) params.append('month', filters.month.toString());
            if (filters.itemGroupId) params.append('itemGroupId', filters.itemGroupId.toString());
            if (filters.itemIds) params.append('itemIds', filters.itemIds.join(','));
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/warehouse/inventory/monthly?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `warehouse-inventory-${filters.year}-${filters.month}-${Date.now()}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Warehouse Comparison Report
     */
    async generateWarehouseComparisonReport(filters: WarehouseComparisonReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            if (filters.year1) params.append('year1', filters.year1.toString());
            if (filters.month1) params.append('month1', filters.month1.toString());
            if (filters.year2) params.append('year2', filters.year2.toString());
            if (filters.month2) params.append('month2', filters.month2.toString());
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/warehouse/inventory/comparison?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `warehouse-comparison-${filters.year1}-${filters.month1}_vs_${filters.year2}-${filters.month2}-${Date.now()}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Booth Inventory Report
     */
    async generateBoothInventoryReport(filters: BoothInventoryReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            params.append('startDate', filters.startDate);
            params.append('endDate', filters.endDate);
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/booth/inventory?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `booth-inventory-${filters.startDate}-to-${filters.endDate}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Item Consumption Report
     */
    async generateItemConsumptionReport(filters: ItemConsumptionReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            params.append('startDate', filters.startDate);
            params.append('endDate', filters.endDate);
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/item/${filters.itemId}/consumption?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `item-consumption-${filters.itemId}-${filters.startDate}-to-${filters.endDate}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Item Purchase Report
     */
    async generateItemPurchaseReport(filters: ItemPurchaseReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            params.append('startDate', filters.startDate);
            params.append('endDate', filters.endDate);
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/item/${filters.itemId}/purchases?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `item-purchases-${filters.itemId}-${filters.startDate}-to-${filters.endDate}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Debts Inventory Report
     */
    async generateDebtsInventoryReport(filters: DebtsInventoryReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
            if (filters.customerIds) params.append('customerIds', filters.customerIds.join(','));
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/debts/inventory?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `debts-inventory-${Date.now()}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Debt Details Report
     */
    async generateDebtDetailsReport(filters: DebtDetailsReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            params.append('startDate', filters.startDate);
            params.append('endDate', filters.endDate);
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/debt/${filters.debtId}/details?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `debt-details-${filters.debtId}-${filters.startDate}-to-${filters.endDate}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Product Sales Report
     */
    async generateProductSalesReport(filters: ProductSalesReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            params.append('itemIds', filters.itemIds.join(','));
            params.append('startDate', filters.startDate);
            params.append('endDate', filters.endDate);
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/products/sales?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `product-sales-${filters.startDate}-to-${filters.endDate}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Funds Movement Report
     */
    async generateFundsMovementReport(filters: FundsMovementReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            params.append('startDate', filters.startDate);
            params.append('endDate', filters.endDate);
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/funds/movement?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `funds-movement-${filters.startDate}-to-${filters.endDate}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Shift Summary Report
     */
    async generateShiftSummaryReport(filters: ShiftSummaryReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            if (filters.shiftId) params.append('shiftId', filters.shiftId.toString());
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/shift/summary?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `shift-summary-${filters.shiftId || 'current'}-${Date.now()}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Customer Statement Report
     */
    async generateCustomerStatementReport(filters: CustomerStatementReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/customer/${filters.customerId}/statement?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `customer-statement-${filters.customerId}-${Date.now()}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate Sales Report
     */
    async generateSalesReport(filters: SalesReportDTO): Promise<ReportGenerationResult> {
        try {
            const params = new URLSearchParams();

            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.download) params.append('download', 'true');

            const response = await apiClient.get<string>(`/reports/sales?${params.toString()}`, {
                headers: {
                    'Accept': 'text/html',
                },
            });

            return {
                success: true,
                content: response,
                filename: `sales-report-${filters.startDate || 'default'}-to-${filters.endDate || 'default'}.html`
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Download report as file
     */
    async downloadReport(endpoint: string, params: Record<string, any>): Promise<void> {
        try {
            console.log('Original endpoint:', endpoint);
            console.log('Original params:', params);

            // Process parameters to handle arrays and convert to proper format
            const processedParams = this.processReportParams(params);
            console.log('Processed params:', processedParams);

            // Replace placeholders in endpoint with actual IDs
            let processedEndpoint = endpoint;

            // Handle different ID types in the correct order
            if (processedEndpoint.includes(':id')) {
                if (processedParams.itemId) {
                    processedEndpoint = processedEndpoint.replace(':id', processedParams.itemId);
                } else if (processedParams.debtId) {
                    processedEndpoint = processedEndpoint.replace(':id', processedParams.debtId);
                } else if (processedParams.customerId) {
                    processedEndpoint = processedEndpoint.replace(':id', processedParams.customerId);
                } else {
                    throw new Error('Endpoint requires an ID parameter but none was provided');
                }
            }

            console.log('Processed endpoint:', processedEndpoint);

            // Remove the ID from params since it's now in the URL
            const { itemId, debtId, customerId, ...queryParams } = processedParams;

            const queryString = new URLSearchParams(queryParams).toString();
            const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://62.171.153.198:4300'}${processedEndpoint}?${queryString}`;

            console.log('Final download URL:', downloadUrl);

            // Get token from cookies
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('access_token='))
                ?.split('=')[1];

            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Fetch the file with proper headers
            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/html',
                },
            });

            if (!response.ok) {
                let errorText = '';
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = 'Could not read error response';
                }
                console.error('Server error response:', errorText);
                console.error('Response headers:', Object.fromEntries(response.headers.entries()));
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${Date.now()}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            throw new Error(`Failed to download report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Process report parameters to handle arrays and convert to proper format
     */
    private processReportParams(params: Record<string, any>): Record<string, any> {
        const processed: Record<string, any> = {};

        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                return; // Skip empty values
            }

            if (Array.isArray(value)) {
                // Handle arrays (for multiselect filters)
                if (value.length > 0) {
                    // Filter out empty values from arrays
                    const filteredArray = value.filter(v => v !== '' && v !== null && v !== undefined);
                    if (filteredArray.length > 0) {
                        processed[key] = filteredArray.join(',');
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                // Handle objects (shouldn't happen with our current setup)
                processed[key] = JSON.stringify(value);
            } else {
                // Handle primitive values - convert to string but handle special cases
                if (typeof value === 'boolean') {
                    processed[key] = value.toString();
                } else if (typeof value === 'number') {
                    processed[key] = value.toString();
                } else {
                    processed[key] = value.toString();
                }
            }
        });

        return processed;
    }
}

export const reportsService = new ReportsService();

// Test function to help debug issues
export const testReportEndpoint = async (endpoint: string, params: Record<string, any>) => {
    console.log('Testing report endpoint:', endpoint);
    console.log('With params:', params);

    try {
        await reportsService.downloadReport(endpoint, params);
        console.log('✅ Report test successful');
    } catch (error) {
        console.error('❌ Report test failed:', error);
        throw error;
    }
};
