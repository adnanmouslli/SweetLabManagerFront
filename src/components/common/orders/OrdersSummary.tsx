// components/orders/OrdersSummary.tsx
import React from "react";
import { useOrdersSummary } from "@/hooks/useOrders";
import { ShoppingBag, Clock, Truck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const OrdersSummaryComponent: React.FC = () => {
    const { data: summary, isLoading } = useOrdersSummary();

    if (isLoading || !summary) return <div className="h-24 animate-pulse bg-slate-800/50 rounded-lg"></div>;

    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
            dir="rtl"
        >
            <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50 transform transition-transform hover:scale-105 hover:shadow-lg">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-slate-400" />
                    <p className="text-slate-400 text-sm">إجمالي الطلبات</p>
                </div>
                <p className="text-lg font-semibold text-slate-200 mt-1">
                    {summary.total}
                </p>
            </div>
            <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50 transform transition-transform hover:scale-105 hover:shadow-lg">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <p className="text-slate-400 text-sm">طلبات اليوم</p>
                </div>
                <p className="text-lg font-semibold text-warning mt-1">
                    {summary.forToday}
                </p>
            </div>
            <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50 transform transition-transform hover:scale-105 hover:shadow-lg !text-slate-400">
                <div className="flex items-center gap-2 ">
                    <Truck className="h-4 w-4 text-info" />
                    <p className=" text-sm">طلبات الغد</p>
                </div>
                <p className="text-lg font-semibold text-info mt-1">
                    {summary.forTomorrow}
                </p>
            </div>
            {/* <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50 transform transition-transform hover:scale-105 hover:shadow-lg">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-success" />
                    <p className="text-slate-400 text-sm">إجمالي المبيعات</p>
                </div>
                <p className="text-lg font-semibold text-success mt-1">
                    {formatCurrency(summary.totalPaidAmount)}
                </p>
            </div> */}
        </div>
    );
};

export default OrdersSummaryComponent;