"use client";
import { formatSYP } from "@/hooks/invoices/useInvoiceStats";
import { ProductInvoice } from "@/types/invoice.type";
import { formatDate, getCustomerDisplayName } from "@/utils/formatters";
import { motion } from "framer-motion";
import { Phone, User, X } from "lucide-react";
import React, { useEffect } from "react";

interface InvoiceDetailsModalProps {
  invoice: ProductInvoice;
  onClose: () => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  onClose,
}) => {
  const getPaymentStatusBadge = (paidStatus: boolean) => {
    return paidStatus ? "text-emerald-400" : "text-yellow-400";
  };

  // Helper function to get the unit display name
  const getUnitDisplay = (item: any, unitName: string) => {
    if (!item || !item.units) return unitName;

    // Find the matching unit from the units array
    const foundUnit = item.units.find((u: any) => u.unit === unitName);
    return foundUnit ? foundUnit.unit : unitName;
  };

  useEffect(()=> {
    console.log(invoice)
  } , []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">تفاصيل الفاتورة</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6" dir="rtl">
          {/* Invoice Header */}
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-slate-400">رقم الفاتورة</p>
                <p className="text-slate-200 font-semibold">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400">التاريخ</p>
                <p className="text-slate-200">
                  {formatDate(invoice.createdAt)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400">التصنيف</p>
                <p className="text-slate-200">
                  {invoice.invoiceCategory === "products"
                    ? "منتجات"
                    : invoice.invoiceCategory === "direct"
                      ? "مباشر"
                      : invoice.invoiceCategory === "advance"
                        ? "سلفة" : "دين"}
                </p>
              </div>
               <div className="space-y-2">
                <p className="text-slate-400">منشأ الفاتورة</p>
                <p className="text-slate-200">
                  {invoice.employee?.username}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {invoice.customer &&
            (invoice.customer.name || invoice.customer.phone) && (
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">
                  معلومات العميل
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {invoice.customer.name && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm">الاسم</p>
                        <p className="text-slate-200">
                          {getCustomerDisplayName(invoice.customer, invoice.notes)}
                        </p>
                      </div>
                    </div>
                  )}
                  {invoice.customer && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-sm">رقم الهاتف</p>
                        <p className="text-slate-200">
                          {invoice.customer.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Items Table */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                المنتجات
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-right text-slate-400 p-2">المنتج</th>
                      <th className="text-right text-slate-400 p-2">الكمية</th>
                      <th className="text-right text-slate-400 p-2">السعر</th>
                      <th className="text-right text-slate-400 p-2">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-600/50"
                      >
                        <td className="p-2 text-slate-300">
                          {item.item?.name}
                        </td>
                        <td className="p-2 text-slate-300">
                          {item.quantity} {getUnitDisplay(item.item, item.unit)}
                        </td>
                        <td className="p-2 text-slate-300">
                          {formatSYP(item.unitPrice)}
                        </td>
                        <td className="p-2 text-slate-300">
                          {formatSYP(item.subTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {invoice.invoiceCategory == "products" && invoice.invoiceType == "income" && (
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                عدد الفوارغ
              </h3>
              <p className="text-slate-200">{invoice.trayCount}</p>
            </div>
          )}
          {/* Payment Information */}
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">
              معلومات الدفع
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-slate-400">المبلغ الإجمالي</p>
                <p className="text-slate-200">
                  {formatSYP(invoice.totalAmount)}
                </p>
              </div>
              {invoice.discount > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400">الخصم</p>
                  <p className="text-red-400">{formatSYP(invoice.discount)}</p>
                </div>
              )}
              {
              invoice.additionalAmount > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400">الإضافي</p>
                  <p className="text-red-400">{
                  formatSYP(invoice.additionalAmount)}</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-slate-400">طريقة الدفع</p>
                <p className="text-slate-200">
                  {invoice.paidStatus ? "نقدي" : "آجل"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400">حالة الدفع</p>
                <p className={getPaymentStatusBadge(invoice.paidStatus)}>
                  {invoice.paidStatus ? "مدفوع" : "آجل"}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {invoice.notes && (
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                ملاحظات إضافية
              </h3>
              <p className="text-slate-200">{invoice.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};