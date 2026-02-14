// components/orders/CustomerOrderCard.tsx
import React, { useState } from "react";
import { ShoppingBag, Calendar, EyeIcon, Clock, CheckCircle, CheckCircle2, AlertCircle, RefreshCcw, BellDot, X, Printer } from "lucide-react";
import { OrderResponseDto, OrderStatus } from "@/types/orders.type";
import { formatCurrency, getCustomerDisplayName } from "@/utils/formatters";
import { getStatusClass, getStatusText } from "@/utils/orderHelpers";

interface CustomerOrderCardProps {
    order: OrderResponseDto;
    onViewDetails?: (order: OrderResponseDto) => void;
    onCancelOrder?: (order: OrderResponseDto) => void;
    onPrintQueueTicket?: (orderId: number) => void;
}

// Helper function to directly get the status icon component
const getStatusIconComponent = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.pending:
            return <Clock className="h-4 w-4 text-warning" />;
        case OrderStatus.processing:
            return <RefreshCcw className="h-4 w-4 text-blue-400" />;
        case OrderStatus.ready:
            return <CheckCircle className="h-4 w-4 text-info" />;
        case OrderStatus.delivered:
            return <CheckCircle2 className="h-4 w-4 text-success" />;
        case OrderStatus.cancelled:
            return <AlertCircle className="h-4 w-4 text-danger" />;
        default:
            return <Clock className="h-4 w-4 text-warning" />;
    }
};

const CustomerOrderCard: React.FC<CustomerOrderCardProps> = ({ order, onViewDetails, onCancelOrder, onPrintQueueTicket }) => {
    const [showDetails, setShowDetails] = useState(false);

    const handleViewClick = () => {
        if (onViewDetails) {
            onViewDetails(order);
        } else {
            setShowDetails(!showDetails);
        }
    };

    return (
        <div className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden transform transition-all hover:bg-slate-800/50">
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-slate-200 font-medium">#{order.orderNumber}</h3>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status!)}`}>
                        {getStatusIconComponent(order.status!)}
                        <span className="mx-1">{getStatusText(order.status!)}</span>
                    </div>
                </div>

                {/* Customer Name */}
                <div className="mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <p className="text-slate-100 font-medium">{getCustomerDisplayName(order.customer, order.notes, 'غير معروف')}</p>
                    </div>
                </div>

                <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-300">{order.category?.name || 'غير معروف'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-300">
                            {order.scheduledFor ? new Date(order.scheduledFor).toLocaleDateString('ar-EG') : 'غير محدد'}
                        </p>
                    </div>
                    {order.notes && <div className="flex items-center gap-2">
                        <BellDot className="h-4 w-4 text-red-500" />

                    </div>}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-700/30">
                    <p className="text-primary font-semibold">{formatCurrency(order.totalAmount)}</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleViewClick}
                            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors text-sm"
                        >
                            <EyeIcon className="h-4 w-4 mx-1" />
                            {onViewDetails ? 'عرض التفاصيل' : (showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل')}
                        </button>
                        {onPrintQueueTicket && (
                            <button
                                onClick={() => onPrintQueueTicket(order.id)}
                                className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors text-sm"
                                title="طباعة تذكرة الدور"
                            >
                                <Printer className="h-4 w-4 mx-1" />
                                دور
                            </button>
                        )}
                        {onCancelOrder && order.status !== 'cancelled' && (
                            <button
                                onClick={() => onCancelOrder(order)}
                                className="inline-flex items-center text-red-400 hover:text-red-300 transition-colors text-sm"
                                title="إلغاء الطلب"
                            >
                                <X className="h-4 w-4 mx-1" />
                                إلغاء
                            </button>
                        )}
                    </div>
                </div>

                {!onViewDetails && showDetails && (
                    <div className="mt-3 pt-3 border-t border-slate-700/30">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">تفاصيل الطلب:</h4>
                        {order.items && order.items.length > 0 ? (
                            <div className="space-y-2">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <div className="text-slate-300">
                                            {item.quantity} x {item.item?.name || `المنتج #${item.itemId}`} ({item.unit})
                                        </div>
                                        <div className="text-slate-400">{formatCurrency(item.unitPrice * item.quantity)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">لا توجد عناصر في هذا الطلب</p>
                        )}

                        {order.notes && (
                            <div className="mt-3">
                                <h4 className="text-sm font-medium text-slate-300 mb-1">ملاحظات:</h4>
                                <p className="text-sm text-slate-400 bg-slate-800/50 p-2 rounded">{order.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOrderCard;