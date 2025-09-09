import { useState, useCallback } from 'react';
import useSnackbar from '@/hooks/useSnackbar';
import { reportsService } from '@/services/reports.service';
import {
    ReportConfig,
    ReportGenerationResult,
    FilterValues,
    ReportModalState,
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
    EmployeeWithdrawalsReportDTO,
    WorkshopSalariesReportDTO
} from '@/types/reports.type';

export const useReports = () => {
    const { setSnackbarConfig } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const [modalState, setModalState] = useState<ReportModalState>({
        isOpen: false,
        selectedReport: null,
        filters: {},
        isLoading: false
    });

    // Open report modal
    const openReportModal = useCallback((report: ReportConfig) => {
        setModalState({
            isOpen: true,
            selectedReport: report,
            filters: {},
            isLoading: false
        });
    }, []);

    // Close report modal
    const closeReportModal = useCallback(() => {
        setModalState({
            isOpen: false,
            selectedReport: null,
            filters: {},
            isLoading: false
        });
    }, []);

    // Update filters
    const updateFilters = useCallback((filters: FilterValues) => {
        setModalState(prev => ({
            ...prev,
            filters: { ...prev.filters, ...filters }
        }));
    }, []);

    // Generate report based on type
    const generateReport = useCallback(async (reportId: string, filters: FilterValues): Promise<ReportGenerationResult> => {
        setIsLoading(true);
        setModalState(prev => ({ ...prev, isLoading: true }));

        try {
            let result: ReportGenerationResult;

            switch (reportId) {
                case 'orders-inventory':
                    result = await reportsService.generateOrdersInventoryReport(filters as OrdersInventoryReportDTO);
                    break;
                case 'warehouse-inventory-monthly':
                    result = await reportsService.generateWarehouseInventoryReport(filters as WarehouseInventoryReportDTO);
                    break;
                case 'warehouse-comparison':
                    result = await reportsService.generateWarehouseComparisonReport(filters as WarehouseComparisonReportDTO);
                    break;
                case 'booth-inventory':
                    result = await reportsService.generateBoothInventoryReport(filters as BoothInventoryReportDTO);
                    break;
                case 'item-consumption':
                    result = await reportsService.generateItemConsumptionReport(filters as ItemConsumptionReportDTO);
                    break;
                case 'item-purchases':
                    result = await reportsService.generateItemPurchaseReport(filters as ItemPurchaseReportDTO);
                    break;
                case 'debts-inventory':
                    result = await reportsService.generateDebtsInventoryReport(filters as DebtsInventoryReportDTO);
                    break;
                case 'debt-details':
                    result = await reportsService.generateDebtDetailsReport(filters as DebtDetailsReportDTO);
                    break;
                case 'product-sales':
                    result = await reportsService.generateProductSalesReport(filters as ProductSalesReportDTO);
                    break;
                case 'funds-movement':
                    result = await reportsService.generateFundsMovementReport(filters as FundsMovementReportDTO);
                    break;
                case 'shift-summary':
                    result = await reportsService.generateShiftSummaryReport(filters as ShiftSummaryReportDTO);
                    break;
                case 'customer-statement':
                    result = await reportsService.generateCustomerStatementReport(filters as CustomerStatementReportDTO);
                    break;
                case 'sales-report':
                    result = await reportsService.generateSalesReport(filters as SalesReportDTO);
                    break;
                case 'employee-withdrawals':
                    result = await reportsService.generateEmployeeWithdrawalsReport(filters as EmployeeWithdrawalsReportDTO);
                    break;
                case 'workshop-salaries':
                    result = await reportsService.generateWorkshopSalariesReport(filters as WorkshopSalariesReportDTO);
                    break;
                default:
                    throw new Error('Unknown report type');
            }

            if (result.success) {
                setSnackbarConfig({
                    open: true,
                    message: 'تم إنشاء التقرير بنجاح',
                    severity: 'success'
                });
            } else {
                setSnackbarConfig({
                    open: true,
                    message: result.error || 'فشل في إنشاء التقرير',
                    severity: 'error'
                });
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
            setSnackbarConfig({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsLoading(false);
            setModalState(prev => ({ ...prev, isLoading: false }));
        }
    }, [setSnackbarConfig]);

    // Download report
    const downloadReport = useCallback(async (reportId: string, filters: FilterValues) => {
        setIsLoading(true);
        setModalState(prev => ({ ...prev, isLoading: true }));

        try {
            const report = modalState.selectedReport;
            if (!report) {
                throw new Error('No report selected');
            }

            await reportsService.downloadReport(report.endpoint, filters);
            setSnackbarConfig({
                open: true,
                message: 'تم تحميل التقرير بنجاح',
                severity: 'success'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'فشل في تحميل التقرير';
            setSnackbarConfig({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
            setModalState(prev => ({ ...prev, isLoading: false }));
        }
    }, [modalState.selectedReport, setSnackbarConfig]);

    // Preview report (generate without download)
    const previewReport = useCallback(async (reportId: string, filters: FilterValues) => {
        return await generateReport(reportId, filters);
    }, [generateReport]);

    // Validate filters for a report
    const validateFilters = useCallback((report: ReportConfig, filters: FilterValues): boolean => {
        if (!report.requiredFilters) return true;

        return report.requiredFilters.every(filterKey => {
            const value = filters[filterKey];
            return value !== undefined && value !== null && value !== '';
        });
    }, []);

    return {
        // State
        isLoading,
        modalState,

        // Actions
        openReportModal,
        closeReportModal,
        updateFilters,
        generateReport,
        downloadReport,
        previewReport,
        validateFilters
    };
};

export default useReports