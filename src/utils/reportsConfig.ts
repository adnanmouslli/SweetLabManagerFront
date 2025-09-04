import { ReportConfig, ReportCategory, FilterType } from '@/types/reports.type';

// Predefined filter options
export const ORDER_STATUS_OPTIONS = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'processing', label: 'قيد المعالجة' },
    { value: 'ready', label: 'جاهز' },
    { value: 'delivered', label: 'مسلم' },
    { value: 'cancelled', label: 'ملغي' }
];

export const PAID_STATUS_OPTIONS = [
    { value: 'true', label: 'مدفوع' },
    { value: 'false', label: 'غير مدفوع' },
    { value: 'all', label: 'الكل' }
];

export const MONTH_OPTIONS = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' }
];

// Generate year options (current year ± 5 years)
const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
    value: currentYear - 5 + i,
    label: (currentYear - 5 + i).toString()
}));

// Function to generate reports configuration with real data
export const generateReportsConfig = (data: {
    customerOptions: Array<{ value: number; label: string }>;
    customerCategoryOptions: Array<{ value: number; label: string }>;
    itemOptions: Array<{ value: number; label: string }>;
    itemGroupOptions: Array<{ value: number; label: string }>;
    debtOptions: Array<{ value: number; label: string }>;
    shiftOptions: Array<{ value: number; label: string }>;
}): ReportConfig[] => [
        // Orders Reports
        {
            id: 'orders-inventory',
            title: 'تقرير جرد الطلبيات',
            description: 'عرض جميع الطلبيات مع إمكانية الفلترة حسب العميل، التصنيف، الحالة، ومواد معينة',
            category: ReportCategory.ORDERS,
            icon: '📋',
            endpoint: '/reports/orders/inventory',
            filters: [
                {
                    key: 'customerName',
                    label: 'اسم العميل',
                    type: FilterType.TEXT,
                    placeholder: 'ابحث بالاسم...'
                },
                {
                    key: 'categoryId',
                    label: 'تصنيف الطلبيات',
                    type: FilterType.SELECT,
                    options: data.customerCategoryOptions
                },
                {
                    key: 'status',
                    label: 'حالة الطلبية',
                    type: FilterType.MULTISELECT,
                    options: ORDER_STATUS_OPTIONS,
                    multiple: true
                },
                {
                    key: 'paidStatus',
                    label: 'حالة الدفع',
                    type: FilterType.SELECT,
                    options: PAID_STATUS_OPTIONS
                },
                {
                    key: 'itemIds',
                    label: 'مواد معينة',
                    type: FilterType.MULTISELECT,
                    options: data.itemOptions,
                    multiple: true
                },
                {
                    key: 'startDate',
                    label: 'تاريخ البداية',
                    type: FilterType.DATE,
                    required: true
                },
                {
                    key: 'endDate',
                    label: 'تاريخ النهاية',
                    type: FilterType.DATE,
                    required: true
                }
            ],
            requiredFilters: ['startDate', 'endDate']
        },

        // Warehouse Reports
        {
            id: 'warehouse-inventory-monthly',
            title: 'تقرير جرد المستودع الشهري',
            description: 'تقرير شامل لجرد المستودع لشهر محدد مع إمكانية الفلترة حسب مجموعة المواد',
            category: ReportCategory.WAREHOUSE,
            icon: '🏪',
            endpoint: '/reports/warehouse/inventory/monthly',
            filters: [
                {
                    key: 'year',
                    label: 'السنة',
                    type: FilterType.SELECT,
                    options: YEAR_OPTIONS,
                    required: true
                },
                {
                    key: 'month',
                    label: 'الشهر',
                    type: FilterType.SELECT,
                    options: MONTH_OPTIONS,
                    required: true
                },
                {
                    key: 'itemGroupId',
                    label: 'مجموعة المواد',
                    type: FilterType.SELECT,
                    options: data.itemGroupOptions
                },
                {
                    key: 'itemIds',
                    label: 'مواد محددة',
                    type: FilterType.MULTISELECT,
                    options: data.itemOptions,
                    multiple: true
                }
            ],
            requiredFilters: ['year', 'month']
        },

        {
            id: 'warehouse-comparison',
            title: 'تقرير مقارنة الاستهلاك الشهري',
            description: 'مقارنة استهلاك المواد بين شهرين مختلفين',
            category: ReportCategory.WAREHOUSE,
            icon: '📊',
            endpoint: '/reports/warehouse/inventory/comparison',
            filters: [
                {
                    key: 'year1',
                    label: 'سنة الفترة الأولى',
                    type: FilterType.SELECT,
                    options: YEAR_OPTIONS,
                    required: true
                },
                {
                    key: 'month1',
                    label: 'شهر الفترة الأولى',
                    type: FilterType.SELECT,
                    options: MONTH_OPTIONS,
                    required: true
                },
                {
                    key: 'year2',
                    label: 'سنة الفترة الثانية',
                    type: FilterType.SELECT,
                    options: YEAR_OPTIONS,
                    required: true
                },
                {
                    key: 'month2',
                    label: 'شهر الفترة الثانية',
                    type: FilterType.SELECT,
                    options: MONTH_OPTIONS,
                    required: true
                }
            ],
            requiredFilters: ['year1', 'month1', 'year2', 'month2']
        },

        // Booth Reports
        {
            id: 'booth-inventory',
            title: 'تقرير جرد البسطة',
            description: 'تقرير شامل لجميع فواتير البسطة (دخل/صرف) في فترة زمنية مع حساب صافي الدخل',
            category: ReportCategory.BOOTH,
            icon: '🏪',
            endpoint: '/reports/booth/inventory',
            filters: [
                {
                    key: 'startDate',
                    label: 'تاريخ البداية',
                    type: FilterType.DATE,
                    required: true
                },
                {
                    key: 'endDate',
                    label: 'تاريخ النهاية',
                    type: FilterType.DATE,
                    required: true
                }
            ],
            requiredFilters: ['startDate', 'endDate']
        },

        // Items Reports
        {
            id: 'item-consumption',
            title: 'تقرير جرد استهلاك مادة معينة',
            description: 'حساب استهلاك مادة محددة خلال فترة زمنية (الاستهلاك = رصيد البداية + المشتريات - رصيد النهاية)',
            category: ReportCategory.ITEMS,
            icon: '📦',
            endpoint: '/reports/item/:id/consumption',
            filters: [
                {
                    key: 'itemId',
                    label: 'معرف المادة',
                    type: FilterType.SELECT,
                    options: data.itemOptions,
                    required: true
                },
                {
                    key: 'startDate',
                    label: 'تاريخ البداية',
                    type: FilterType.DATE,
                    required: true
                },
                {
                    key: 'endDate',
                    label: 'تاريخ النهاية',
                    type: FilterType.DATE,
                    required: true
                }
            ],
            requiredFilters: ['itemId', 'startDate', 'endDate']
        },

        {
            id: 'item-purchases',
            title: 'تقرير جرد شراء مادة معينة',
            description: 'تقرير شامل لجميع مشتريات مادة محددة من فواتير الصرف مع تفاصيل كل عملية شراء',
            category: ReportCategory.ITEMS,
            icon: '🛒',
            endpoint: '/reports/item/:id/purchases',
            filters: [
                {
                    key: 'itemId',
                    label: 'معرف المادة',
                    type: FilterType.SELECT,
                    options: data.itemOptions,
                    required: true
                },
                {
                    key: 'startDate',
                    label: 'تاريخ البداية',
                    type: FilterType.DATE,
                    required: true
                },
                {
                    key: 'endDate',
                    label: 'تاريخ النهاية',
                    type: FilterType.DATE,
                    required: true
                }
            ],
            requiredFilters: ['itemId', 'startDate', 'endDate']
        },

        // Debts Reports
        {
            id: 'debts-inventory',
            title: 'تقرير جرد الديون',
            description: 'عرض جميع الديون النشطة مجمعة حسب تصنيف العملاء مع إمكانية الفلترة',
            category: ReportCategory.DEBTS,
            icon: '💰',
            endpoint: '/reports/debts/inventory',
            filters: [
                {
                    key: 'categoryId',
                    label: 'تصنيف العملاء',
                    type: FilterType.SELECT,
                    options: data.customerCategoryOptions
                },
                {
                    key: 'customerIds',
                    label: 'عملاء محددين',
                    type: FilterType.MULTISELECT,
                    options: data.customerOptions,
                    multiple: true
                }
            ]
        },

        {
            id: 'debt-details',
            title: 'تقرير تفاصيل دين معين',
            description: 'تفاصيل دين محدد خلال فترة زمنية مع عرض إجمالي الديون المتبقية والمسددة',
            category: ReportCategory.DEBTS,
            icon: '📄',
            endpoint: '/reports/debt/:id/details',
            filters: [
                {
                    key: 'debtId',
                    label: 'معرف الدين',
                    type: FilterType.SELECT,
                    options: data.debtOptions,
                    required: true
                },
                {
                    key: 'startDate',
                    label: 'تاريخ البداية',
                    type: FilterType.DATE,
                    required: true
                },
                {
                    key: 'endDate',
                    label: 'تاريخ النهاية',
                    type: FilterType.DATE,
                    required: true
                }
            ],
            requiredFilters: ['debtId', 'startDate', 'endDate']
        },

        // Products Reports
        {
            id: 'product-sales',
            title: 'تقرير جرد مبيعات منتج معين',
            description: 'عرض مبيعات منتجات محددة خلال فترة زمنية من فواتير الدخل المدفوعة',
            category: ReportCategory.PRODUCTS,
            icon: '📈',
            endpoint: '/reports/products/sales',
            filters: [
                {
                    key: 'itemIds',
                    label: 'معرفات المنتجات',
                    type: FilterType.MULTISELECT,
                    options: data.itemOptions,
                    multiple: true,
                    required: true
                },
                {
                    key: 'startDate',
                    label: 'تاريخ البداية',
                    type: FilterType.DATE,
                    required: true
                },
                {
                    key: 'endDate',
                    label: 'تاريخ النهاية',
                    type: FilterType.DATE,
                    required: true
                }
            ],
            requiredFilters: ['itemIds', 'startDate', 'endDate']
        },

        // Funds Reports
        {
            id: 'funds-movement',
            title: 'تقرير حركة الصناديق',
            description: 'عرض المدخولات والمصروفات لكل نوع صندوق مع حساب صافي الحركة',
            category: ReportCategory.FUNDS,
            icon: '🏦',
            endpoint: '/reports/funds/movement',
            filters: [
                {
                    key: 'startDate',
                    label: 'تاريخ البداية',
                    type: FilterType.DATE,
                    required: true
                },
                {
                    key: 'endDate',
                    label: 'تاريخ النهاية',
                    type: FilterType.DATE,
                    required: true
                }
            ],
            requiredFilters: ['startDate', 'endDate']
        },

        // Shifts Reports
        {
            id: 'shift-summary',
            title: 'تقرير ملخص الواردية',
            description: 'ملخص الواردية الحالية أو واردية محددة مع إجماليات كل صندوق',
            category: ReportCategory.SHIFTS,
            icon: '⏰',
            endpoint: '/reports/shift/summary',
            filters: [
                {
                    key: 'shiftId',
                    label: 'معرف الواردية',
                    type: FilterType.SELECT,
                    options: [{ value: '', label: 'الواردية الحالية' }, ...data.shiftOptions]
                }
            ]
        },

        // Customers Reports
        {
            id: 'customer-statement',
            title: 'كشف حساب عميل',
            description: 'كشف حساب شامل لعميل محدد مع جميع المعاملات',
            category: ReportCategory.CUSTOMERS,
            icon: '👤',
            endpoint: '/reports/customer/:id/statement',
            filters: [
                {
                    key: 'customerId',
                    label: 'معرف العميل',
                    type: FilterType.SELECT,
                    options: data.customerOptions,
                    required: true
                }
            ],
            requiredFilters: ['customerId']
        },

        // Sales Reports
        {
            id: 'sales-report',
            title: 'تقرير المبيعات',
            description: 'تقرير شامل للمبيعات خلال فترة زمنية محددة',
            category: ReportCategory.SALES,
            icon: '💼',
            endpoint: '/reports/sales',
            filters: [
                {
                    key: 'startDate',
                    label: 'تاريخ البداية',
                    type: FilterType.DATE,
                    placeholder: 'تاريخ البداية (اختياري)'
                },
                {
                    key: 'endDate',
                    label: 'تاريخ النهاية',
                    type: FilterType.DATE,
                    placeholder: 'تاريخ النهاية (اختياري)'
                }
            ]
        }
    ];

// Static reports configuration (fallback when data is not available)
export const REPORTS: ReportConfig[] = generateReportsConfig({
    customerOptions: [],
    customerCategoryOptions: [],
    itemOptions: [],
    itemGroupOptions: [],
    debtOptions: [],
    shiftOptions: []
});

// Categories configuration
export const CATEGORIES = [
    {
        id: ReportCategory.ORDERS,
        name: 'تقارير الطلبيات',
        icon: '📋',
        color: 'from-blue-500/10 to-blue-900/10'
    },
    {
        id: ReportCategory.WAREHOUSE,
        name: 'تقارير المستودع',
        icon: '🏪',
        color: 'from-green-500/10 to-green-900/10'
    },
    {
        id: ReportCategory.BOOTH,
        name: 'تقارير البسطة',
        icon: '🏪',
        color: 'from-purple-500/10 to-purple-900/10'
    },
    {
        id: ReportCategory.ITEMS,
        name: 'تقارير المواد',
        icon: '📦',
        color: 'from-orange-500/10 to-orange-900/10'
    },
    {
        id: ReportCategory.DEBTS,
        name: 'تقارير الديون',
        icon: '💰',
        color: 'from-red-500/10 to-red-900/10'
    },
    {
        id: ReportCategory.PRODUCTS,
        name: 'تقارير المنتجات',
        icon: '📈',
        color: 'from-cyan-500/10 to-cyan-900/10'
    },
    {
        id: ReportCategory.FUNDS,
        name: 'تقارير الصناديق',
        icon: '🏦',
        color: 'from-yellow-500/10 to-yellow-900/10'
    },
    {
        id: ReportCategory.SHIFTS,
        name: 'تقارير الوارديات',
        icon: '⏰',
        color: 'from-indigo-500/10 to-indigo-900/10'
    },
    {
        id: ReportCategory.CUSTOMERS,
        name: 'تقارير العملاء',
        icon: '👤',
        color: 'from-pink-500/10 to-pink-900/10'
    },
    {
        id: ReportCategory.SALES,
        name: 'تقارير المبيعات',
        icon: '💼',
        color: 'from-emerald-500/10 to-emerald-900/10'
    }
];

// Helper function to get reports by category
export const getReportsByCategory = (category: ReportCategory, reportsList: ReportConfig[] = REPORTS) => {
    return reportsList.filter(report => report.category === category);
};

// Helper function to get report by ID
export const getReportById = (id: string) => {
    return REPORTS.find(report => report.id === id);
};

// Helper function to get category by ID
export const getCategoryById = (id: ReportCategory) => {
    return CATEGORIES.find(category => category.id === id);
};
