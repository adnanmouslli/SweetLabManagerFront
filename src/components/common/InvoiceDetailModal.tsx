import { Invoice } from "@/types/invoice.type";
import { WareHouseInvoice } from "@/types/warehouse.type";
import { formatCurrency, formatDate, getCustomerDisplayName } from "@/utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface InvoiceDetailModalProps {
  invoice: Invoice | WareHouseInvoice;
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceDetailModal = ({
  invoice,
  isOpen,
  onClose,
}: InvoiceDetailModalProps) => {
  // Type guard function to check if the invoice is of type Invoice
  const isInvoiceType = (
    invoice: Invoice | WareHouseInvoice
  ): invoice is Invoice => {
    return "invoiceType" in invoice;
  };

  const path = usePathname()

  console.log("the screen is : ", path);
  console.log("the invoice is : ", invoice);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto ">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-[101] w-[95vw] max-w-3xl max-h-[90vh] bg-slate-800/95 border border-slate-700/50 rounded-lg shadow-xl overflow-y-auto backdrop-blur-sm no-scrollbar"
            dir="rtl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-200">
                  تفاصيل الفاتورة #{invoice.invoiceNumber}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700/50 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-200">
                    معلومات العميل
                  </h3>
                  <div className="space-y-1 text-slate-300">
                    <p>
                      الاسم: {getCustomerDisplayName(invoice.customer, invoice.notes)}
                    </p>
                    <p>
                      الهاتف: {invoice.customer ? invoice.customer.phone : "-"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-200">
                    معلومات الفاتورة
                  </h3>
                  <div className="space-y-1 text-slate-300">
                    <p>
                      النوع: {invoice.invoiceType === "expense" ? "صرف" : "دخل"}
                    </p>
                    <p>
                      التصنيف:{" "}
                      {invoice.invoiceCategory === "debt" ? "دين" : "مباشر"}
                    </p>
                    <p>التاريخ: {formatDate(invoice.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-200">
                  المنتجات
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-right p-2 text-slate-400">
                          المنتج
                        </th>
                        <th className="text-right p-2 text-slate-400">
                          الكمية
                        </th>
                        <th className="text-right p-2 text-slate-400">السعر</th>

                        <th className="text-right p-2 text-slate-400">
                          المجموع
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {invoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2 text-slate-300">
                            {item.item.name}
                          </td>
                          <td className="p-2 text-slate-300">
                            {item.quantity}{" "}
                            {isInvoiceType(invoice)
                              ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              //  @ts-ignore
                              item.unit
                              : ""}
                          </td>
                          <td className="p-2 text-slate-300">
                            {formatCurrency(item.unitPrice)}
                          </td>

                          <td className="p-2 text-slate-300">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-slate-700/50 pt-4 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>المجموع الكلي:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                {invoice.invoiceCategory == "products" && invoice.invoiceType == "income" && <div className="flex justify-between text-slate-300">
                  <span>الفوارغ:</span>
                  <span>{invoice.trayCount}</span>
                </div>}
                <div className="flex justify-between text-slate-300">
                  <span>الخصم:</span>
                  <span>{formatCurrency(invoice.discount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-200">
                  <span>الصافي:</span>
                  <span>
                    {formatCurrency(invoice.totalAmount - invoice.discount)}
                  </span>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-700/50 pt-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-200">
                    معلومات إضافية
                  </h3>
                  <div className="space-y-1 text-slate-300">
                    <p>
                      حالة الدفع: {invoice.paidStatus ? "مدفوع" : "غير مدفوع"}
                    </p>
                    <p>تاريخ الدفع: {formatDate(invoice.paymentDate)}</p>
                    <p>الملاحظات: {invoice.notes}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-200">
                    معلومات النظام
                  </h3>
                  <div className="space-y-1 text-slate-300">
                    <p>الموظف: {invoice.employee.username}</p>

                    <p>الصندوق: {invoice.fund.fundType}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InvoiceDetailModal;
