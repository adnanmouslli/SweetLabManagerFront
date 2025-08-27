// components/orders/OrderListByDateView.tsx
import { OrderResponseDto } from "@/types/orders.type";
import { formatCurrency } from "@/utils/formatters";
import { getStatusClass, getStatusText } from "@/utils/orderHelpers";
import { ArrowUpDown, Eye, ShoppingBag, X } from "lucide-react";
import React, { useState } from "react";
import CustomerOrderCard from "./CustomerOrderCard";
import SearchBar from "./SearchBar";
import CancelOrderDialog from "./CancelOrderDialog";
import { useCancelOrder } from "@/hooks/useOrders";
import toast from "react-hot-toast";

interface OrderListByDateViewProps {
    todayOrders: OrderResponseDto[];
    tomorrowOrders: OrderResponseDto[];
    allOrders: OrderResponseDto[];
    isLoading: boolean;
    activeTab: "forToday" | "forTomorrow" | "all";
    onViewOrderDetails: (order: OrderResponseDto) => void;
    onSearchChange: (term: string) => void;
    searchTerm: string;
}

const OrderListByDateView: React.FC<OrderListByDateViewProps> = ({
    todayOrders,
    tomorrowOrders,
    allOrders,
    isLoading,
    activeTab,
    onViewOrderDetails,
    onSearchChange,
    searchTerm,
}) => {
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        today: true,
        tomorrow: true,
        all: true,
    });

    // Cancel order functionality
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<OrderResponseDto | null>(null);

    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

    const handleCancelOrder = (order: OrderResponseDto) => {
        setSelectedOrderForCancel(order);
        setCancelDialogOpen(true);
    };

    const handleConfirmCancel = (reason: string) => {
        if (!selectedOrderForCancel) return;

        cancelOrder(
            { orderId: selectedOrderForCancel.id, reason },
            {
                onSuccess: () => {
                    toast.success('تم إلغاء الطلب بنجاح');
                    setCancelDialogOpen(false);
                    setSelectedOrderForCancel(null);
                },
                onError: (error) => {
                    toast.error('حدث خطأ أثناء إلغاء الطلب');
                    console.error('Error cancelling order:', error);
                }
            }
        );
    };

    const [sortConfig, setSortConfig] = useState<{
        key: keyof OrderResponseDto | "customerName" | "paidStatusText" | "statusText";
        direction: "asc" | "desc" | null;
    }>({
        key: "orderNumber",
        direction: "asc",
    });

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleSort = (
        key: keyof OrderResponseDto | "customerName" | "paidStatusText" | "statusText"
    ) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const sortOrders = (orders: OrderResponseDto[]) => {
        if (!sortConfig.direction) return orders;

        return [...orders].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortConfig.key) {
                case "orderNumber":
                    aValue = a.orderNumber || "";
                    bValue = b.orderNumber || "";
                    break;
                case "createdAt":
                case "scheduledFor":
                    aValue = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
                    bValue = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
                    break;
                case "customerName":
                    aValue = a.customer?.name || "";
                    bValue = b.customer?.name || "";
                    break;
                case "totalAmount":
                    aValue = a.totalAmount || 0;
                    bValue = b.totalAmount || 0;
                    break;
                case "paidStatusText":
                    aValue = a.paidStatus
                        ? "مدفوع"
                        : a.invoice && a.invoice.isBreak
                            ? "كسر"
                            : "غير مدفوع";
                    bValue = b.paidStatus
                        ? "مدفوع"
                        : b.invoice && b.invoice.isBreak
                            ? "كسر"
                            : "غير مدفوع";
                    break;
                case "statusText":
                    aValue = getStatusText(a.status!);
                    bValue = getStatusText(b.status!);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    };

    const groupOrdersByCategory = (orders: OrderResponseDto[]) => {
        const grouped: {
            [key: number]: { categoryName: string; orders: OrderResponseDto[] };
        } = {};

        orders.forEach((order) => {
            if (order.category && order.categoryId) {
                if (!grouped[order.categoryId]) {
                    grouped[order.categoryId] = {
                        categoryName: order.category.name,
                        orders: [],
                    };
                }
                grouped[order.categoryId].orders.push(order);
            }
        });

        return Object.values(grouped).map((group) => ({
            ...group,
            orders: sortOrders(group.orders),
        }));
    };

    const getVisibleSections = () => {
        switch (activeTab) {
            case "forToday":
                return ["today"];
            case "forTomorrow":
                return ["tomorrow"];
            case "all":
                return ["all"];
            default:
                return ["all"];
        }
    };

    const visibleSections = getVisibleSections();

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">جاري تحميل البيانات...</div>
            </div>
        );
    }

    return (
        <div className="space-y-10" dir="rtl">
            <div className="mb-6">
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={onSearchChange}
                    placeholder="البحث عن طريق اسم العميل أو رقم الطلب..."
                />
            </div>

            {visibleSections.includes("today") && (
                <div className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">
                            طلبات اليوم
                        </h3>
                        {todayOrders.length === 0 ? (
                            <div className="text-center p-6 text-slate-400">
                                لا توجد طلبات لليوم
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupOrdersByCategory(todayOrders).map((category, index) => (
                                    <div key={index}>
                                        <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-slate-400" />
                                            {category.categoryName}
                                            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                                                {category.orders.length} طلب
                                            </span>
                                        </h4>
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-sm text-right text-slate-200">
                                                <thead>
                                                    <tr className="border-b border-slate-700/50 bg-slate-700/30">
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("orderNumber")}
                                                            >
                                                                رقم الفاتورة
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("createdAt")}
                                                            >
                                                                التاريخ
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("customerName")}
                                                            >
                                                                اسم العميل
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("totalAmount")}
                                                            >
                                                                المبلغ
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("paidStatusText")}
                                                            >
                                                                حالة الدفع
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("statusText")}
                                                            >
                                                                حالة الطلب
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">الإجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {category.orders.map((order) => (
                                                        <tr
                                                            key={order.id}
                                                            className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                                                        >
                                                            <td className="px-4 py-3">
                                                                {order.orderNumber
                                                                    ? `#${order.orderNumber}`
                                                                    : "غير متوفر"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {order.createdAt
                                                                    ? new Date(order.createdAt).toLocaleDateString(
                                                                        "ar-EG"
                                                                    )
                                                                    : "غير محدد"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {order.customer?.name || "غير معروف"}
                                                            </td>
                                                            <td className="px-4 py-3 text-primary font-semibold">
                                                                {formatCurrency(order.totalAmount)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paidStatus
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : order.invoice && order.invoice.isBreak
                                                                            ? "bg-amber-500/20 text-amber-400"
                                                                            : "bg-red-500/20 text-red-400"
                                                                        }`}
                                                                >
                                                                    {order.paidStatus
                                                                        ? "مدفوع"
                                                                        : order.invoice && order.invoice.isBreak
                                                                            ? "كسر"
                                                                            : "غير مدفوع"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                                                        order.status!
                                                                    )}`}
                                                                >
                                                                    {getStatusText(order.status!)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => onViewOrderDetails(order)}
                                                                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        عرض
                                                                    </button>
                                                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                                        <button
                                                                            onClick={() => handleCancelOrder(order)}
                                                                            className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                                                            title="إلغاء الطلب"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                            إلغاء
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="block md:hidden">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {category.orders.map((order) => (
                                                    <CustomerOrderCard
                                                        key={order.id}
                                                        order={order}
                                                        onViewDetails={onViewOrderDetails}
                                                        onCancelOrder={order.status !== 'delivered' && order.status !== 'cancelled' ? handleCancelOrder : undefined}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {visibleSections.includes("tomorrow") && (
                <div className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">
                            طلبات الغد
                        </h3>
                        {tomorrowOrders.length === 0 ? (
                            <div className="text-center p-6 text-slate-400">
                                لا توجد طلبات للغد
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupOrdersByCategory(tomorrowOrders).map((category, index) => (
                                    <div key={index}>
                                        <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-slate-400" />
                                            {category.categoryName}
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                                                {category.orders.length} طلب
                                            </span>
                                        </h4>
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-sm text-right text-slate-200">
                                                <thead>
                                                    <tr className="border-b border-slate-700/50 bg-slate-700/30">
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("orderNumber")}
                                                            >
                                                                رقم الفاتورة
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("scheduledFor")}
                                                            >
                                                                التاريخ
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("customerName")}
                                                            >
                                                                اسم العميل
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("totalAmount")}
                                                            >
                                                                المبلغ
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("paidStatusText")}
                                                            >
                                                                حالة الدفع
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("statusText")}
                                                            >
                                                                حالة الطلب
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">الإجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {category.orders.map((order) => (
                                                        <tr
                                                            key={order.id}
                                                            className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                                                        >
                                                            <td className="px-4 py-3">
                                                                {order.orderNumber
                                                                    ? `#${order.orderNumber}`
                                                                    : "غير متوفر"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {order.scheduledFor
                                                                    ? new Date(order.scheduledFor).toLocaleDateString(
                                                                        "ar-EG"
                                                                    )
                                                                    : "غير محدد"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {order.customer?.name || "غير معروف"}
                                                            </td>
                                                            <td className="px-4 py-3 text-primary font-semibold">
                                                                {formatCurrency(order.totalAmount)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paidStatus
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : order.invoice && order.invoice.isBreak
                                                                            ? "bg-amber-500/20 text-amber-400"
                                                                            : "bg-red-500/20 text-red-400"
                                                                        }`}
                                                                >
                                                                    {order.paidStatus
                                                                        ? "مدفوع"
                                                                        : order.invoice && order.invoice.isBreak
                                                                            ? "كسر"
                                                                            : "غير مدفوع"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                                                        order.status!
                                                                    )}`}
                                                                >
                                                                    {getStatusText(order.status!)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => onViewOrderDetails(order)}
                                                                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        عرض
                                                                    </button>
                                                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                                        <button
                                                                            onClick={() => handleCancelOrder(order)}
                                                                            className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                                                            title="إلغاء الطلب"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                            إلغاء
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="block md:hidden">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {category.orders.map((order) => (
                                                    <CustomerOrderCard
                                                        key={order.id}
                                                        order={order}
                                                        onViewDetails={onViewOrderDetails}
                                                        onCancelOrder={order.status !== 'delivered' && order.status !== 'cancelled' ? handleCancelOrder : undefined}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {visibleSections.includes("all") && (
                <div className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">
                            جميع الطلبات
                        </h3>
                        {allOrders.length === 0 ? (
                            <div className="text-center p-6 text-slate-400">
                                لا توجد طلبات
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupOrdersByCategory(allOrders).map((category, index) => (
                                    <div key={index}>
                                        <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-slate-400" />
                                            {category.categoryName}
                                            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                                                {category.orders.length} طلب
                                            </span>
                                        </h4>
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-sm text-right text-slate-200">
                                                <thead>
                                                    <tr className="border-b border-slate-700/50 bg-slate-700/30">
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("orderNumber")}
                                                            >
                                                                رقم الفاتورة
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("scheduledFor")}
                                                            >
                                                                التاريخ
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("customerName")}
                                                            >
                                                                اسم العميل
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("totalAmount")}
                                                            >
                                                                المبلغ
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("paidStatusText")}
                                                            >
                                                                حالة الدفع
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            <button
                                                                className="flex items-center gap-1 hover:text-blue-300"
                                                                onClick={() => handleSort("statusText")}
                                                            >
                                                                حالة الطلب
                                                                <ArrowUpDown className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3">الإجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {category.orders.map((order) => (
                                                        <tr
                                                            key={order.id}
                                                            className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                                                        >
                                                            <td className="px-4 py-3">
                                                                {order.orderNumber
                                                                    ? `#${order.orderNumber}`
                                                                    : "غير متوفر"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {order.scheduledFor
                                                                    ? new Date(order.scheduledFor).toLocaleDateString(
                                                                        "ar-EG"
                                                                    )
                                                                    : "غير محدد"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {order.customer?.name || "غير معروف"}
                                                            </td>
                                                            <td className="px-4 py-3 text-primary font-semibold">
                                                                {formatCurrency(order.totalAmount)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paidStatus
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : order.invoice && order.invoice.isBreak
                                                                            ? "bg-amber-500/20 text-amber-400"
                                                                            : "bg-red-500/20 text-red-400"
                                                                        }`}
                                                                >
                                                                    {order.paidStatus
                                                                        ? "مدفوع"
                                                                        : order.invoice && order.invoice.isBreak
                                                                            ? "كسر"
                                                                            : "غير مدفوع"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                                                        order.status!
                                                                    )}`}
                                                                >
                                                                    {getStatusText(order.status!)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => onViewOrderDetails(order)}
                                                                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        عرض
                                                                    </button>
                                                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                                        <button
                                                                            onClick={() => handleCancelOrder(order)}
                                                                            className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                                                            title="إلغاء الطلب"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                            إلغاء
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="block md:hidden">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {category.orders.map((order) => (
                                                    <CustomerOrderCard
                                                        key={order.id}
                                                        order={order}
                                                        onViewDetails={onViewOrderDetails}
                                                        onCancelOrder={order.status !== 'delivered' && order.status !== 'cancelled' ? handleCancelOrder : undefined}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Order Dialog */}
            <CancelOrderDialog
                isOpen={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onConfirm={handleConfirmCancel}
                orderNumber={selectedOrderForCancel?.orderNumber}
                customerName={selectedOrderForCancel?.customer?.name}
                isCancelling={isCancelling}
            />
        </div>
    );
};

export default OrderListByDateView;