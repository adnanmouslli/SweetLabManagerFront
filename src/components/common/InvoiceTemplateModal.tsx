import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Calendar, User, Package, DollarSign } from "lucide-react";
import { Invoice } from "@/types/invoice.type";
import { formatDate, getCustomerDisplayName } from "@/utils/formatters";

interface InvoiceTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
}

const InvoiceTemplateModal: React.FC<InvoiceTemplateModalProps> = ({
    isOpen,
    onClose,
    invoice,
}) => {
    if (!isOpen || !invoice) return null;

    const formatSYP = (amount: number) => {
        return `${amount.toLocaleString()} ل.س`;
    };

    const getInvoiceTypeColor = (type: string) => {
        return type === "income" ? "text-emerald-400" : "text-red-400";
    };

    const getInvoiceTypeBg = (type: string) => {
        return type === "income" ? "bg-emerald-500/10" : "bg-red-500/10";
    };

    const getInvoiceTypeBorder = (type: string) => {
        return type === "income" ? "border-emerald-500/30" : "border-red-500/30";
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                    dir="rtl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 p-6 rounded-t-xl">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-700/50 rounded-lg">
                                    <FileText className="h-6 w-6 text-slate-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-100">فاتورة</h2>
                                    <p className="text-slate-400 text-sm">{invoice.invoiceNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-700"
                                type="button"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="p-6 space-y-6">
                        {/* Invoice Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Invoice Type & Status */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-400 text-sm">نوع الفاتورة</span>
                                </div>
                                <div className={`px-3 py-2 rounded-lg border ${getInvoiceTypeBg(invoice.invoiceType)} ${getInvoiceTypeBorder(invoice.invoiceType)}`}>
                                    <span className={`font-medium ${getInvoiceTypeColor(invoice.invoiceType)}`}>
                                        {invoice.invoiceType === "income" ? "فاتورة دخل" : "فاتورة مصروف"}
                                    </span>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-400 text-sm">التاريخ</span>
                                </div>
                                <div className="px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                    <span className="text-slate-200 font-medium">
                                        {formatDate(invoice.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-400 text-sm">العميل</span>
                                </div>
                                <div className="px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                    <span className="text-slate-200 font-medium">
                                        {getCustomerDisplayName(invoice.customer, invoice.notes)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        {invoice.items && invoice.items.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-slate-400" />
                                    <h3 className="text-lg font-semibold text-slate-200">تفاصيل العناصر</h3>
                                </div>

                                <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-700/50">
                                                <tr>
                                                    <th className="text-right text-slate-300 p-4 font-medium">اسم العنصر</th>
                                                    <th className="text-right text-slate-300 p-4 font-medium">الكمية</th>
                                                    <th className="text-right text-slate-300 p-4 font-medium">الوحدة</th>
                                                    <th className="text-right text-slate-300 p-4 font-medium">سعر الوحدة</th>
                                                    <th className="text-right text-slate-300 p-4 font-medium">المجموع</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.items.map((item, index) => (
                                                    <motion.tr
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors"
                                                    >
                                                        <td className="p-4 text-slate-200">
                                                            <div>
                                                                <div className="font-medium">{item.item.name}</div>
                                                                {item.item.description && (
                                                                    <div className="text-slate-400 text-sm mt-1">
                                                                        {item.item.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-slate-200 font-medium">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="p-4 text-slate-200">
                                                            {item.unit || item.item.defaultUnit || "وحدة"}
                                                        </td>
                                                        <td className="p-4 text-slate-200">
                                                            {formatSYP(item.unitPrice)}
                                                        </td>
                                                        <td className="p-4 text-slate-200 font-medium">
                                                            {formatSYP(item.quantity * item.unitPrice)}
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invoice Summary */}
                        <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="h-5 w-5 text-slate-400" />
                                <h3 className="text-lg font-semibold text-slate-200">ملخص الفاتورة</h3>
                            </div>

                            <div className="space-y-3">
                                {/* Subtotal */}
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">المجموع الفرعي</span>
                                    <span className="text-slate-200 font-medium">
                                        {formatSYP(invoice.totalAmount)}
                                    </span>
                                </div>

                                {/* Discount */}
                                {invoice.discount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">الخصم</span>
                                        <span className="text-red-400 font-medium">
                                            -{formatSYP(invoice.discount)}
                                        </span>
                                    </div>
                                )}

                                {/* Additional Amount */}
                                {invoice.additionalAmount && invoice.additionalAmount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">مبلغ إضافي</span>
                                        <span className="text-emerald-400 font-medium">
                                            +{formatSYP(invoice.additionalAmount)}
                                        </span>
                                    </div>
                                )}

                                {/* Supplier Payment Amount */}
                                {invoice.supplierPaymentAmount && invoice.supplierPaymentAmount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">المبلغ المدفوع للمورد</span>
                                        <span className="text-blue-400 font-medium">
                                            {formatSYP(invoice.supplierPaymentAmount)}
                                        </span>
                                    </div>
                                )}

                                {/* Tray Count */}
                                {invoice.trayCount && invoice.trayCount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">عدد الصواني</span>
                                        <span className="text-slate-200 font-medium">
                                            {invoice.trayCount}
                                        </span>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t border-slate-600/50 my-3"></div>

                                {/* Total */}
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-200 font-semibold text-lg">المجموع الكلي</span>
                                    <span className={`font-bold text-xl ${getInvoiceTypeColor(invoice.invoiceType)}`}>
                                        {formatSYP(invoice.totalAmount)}
                                    </span>
                                </div>

                                {/* Payment Status */}
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-slate-400">حالة الدفع</span>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${invoice.paidStatus
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                        }`}>
                                        {invoice.paidStatus ? "مدفوع" : "غير مدفوع"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-4">
                                <h4 className="text-slate-300 font-medium mb-2">ملاحظات</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {invoice.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InvoiceTemplateModal;
