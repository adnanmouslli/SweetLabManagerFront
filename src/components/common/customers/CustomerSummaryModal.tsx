"use client";
import { useSummaryCustomer } from "@/hooks/customers/useCustomers";
import { SummaryInvoice } from "@/types/customers.type";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Package,
  Phone,
  PieChart,
  ShoppingBag,
  X,
} from "lucide-react";
import { useState } from "react";

// Simple date formatter function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  // Arabic month names
  const arabicMonths = [
    "يناير",
    "فبراير",
    "مارس",
    "إبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const day = date.getDate();
  const month = arabicMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

// Format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-SY", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Customer Summary Modal
const CustomerSummaryModal = ({
  isOpen,
  onClose,
  customerId,
}: {
  isOpen: boolean;
  onClose: () => void;
  customerId: number | null;
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "invoices" | "trays" | "debts"
  >("overview");

  // Fetch customer data using the provided hook
  const {
    data: customerData,
    isLoading,
    error,
  } = useSummaryCustomer({
    customerId: customerId?.toString() || "",
  });

  if (!isOpen || !customerId) return null;

  const getStatusIcon = (invoice: SummaryInvoice) => {
    if (invoice.isBreak) {
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    } else if (invoice.paidStatus) {
      return <CreditCard className="h-4 w-4 text-emerald-400" />;
    } else {
      return <Calendar className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusLabel = (invoice: SummaryInvoice) => {
    if (invoice.isBreak) {
      return <span className="text-red-400">كسر</span>;
    } else if (invoice.paidStatus) {
      return <span className="text-emerald-400">مدفوع</span>;
    } else {
      return <span className="text-yellow-400">غير مدفوع</span>;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-slate-800/95 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-400 mb-2">حدث خطأ</h3>
              <p className="text-slate-300">لم نتمكن من تحميل بيانات العميل</p>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold text-slate-100">
                  {customerData?.customerInfo.name}
                </h2>
              </div>

              {/* Customer Card */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 p-6 rounded-xl mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="text-slate-400 text-sm">رقم الهاتف</div>
                    <div className="text-slate-200 font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-400" />
                      <span dir="ltr">{customerData?.customerInfo.phone}</span>
                    </div>
                    <div className="text-slate-400 text-sm mt-3">
                      المستحقات المتبقية
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        customerData &&
                        customerData.financialSummary &&
                        customerData.financialSummary.pendingAmount > 0
                          ? "text-yellow-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {formatCurrency(
                        customerData?.financialSummary.pendingAmount || 0
                      )}{" "}
                      ل.س
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 text-sm">
                      إجمالي المبيعات
                    </div>
                    <div className="text-slate-200 font-bold text-xl">
                      {formatCurrency(
                        customerData?.financialSummary.totalSales || 0
                      )}{" "}
                      ل.س
                    </div>
                    <div className="text-slate-400 text-sm mt-3">
                      نسبة الدفع
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-slate-700/50 rounded-full h-2 mx-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{
                            width: `${
                              customerData?.financialSummary.paymentRatio || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-emerald-400 font-medium">
                        {Math.round(
                          customerData?.financialSummary.paymentRatio || 0
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 text-sm">الديون الحالية</div>
                    <div
                      className={`text-lg font-bold ${
                        customerData &&
                        customerData.financialSummary &&
                        customerData.financialSummary.currentDebts > 0
                          ? "text-yellow-400"
                          : "text-slate-200"
                      }`}
                    >
                      {formatCurrency(
                        customerData?.financialSummary.currentDebts || 0
                      )}{" "}
                      ل.س
                    </div>
                    <div className="text-slate-400 text-sm mt-3">
                      الديون المدفوعة
                    </div>
                    <div className="text-emerald-400 font-bold">
                      {formatCurrency(
                        customerData?.financialSummary.paidDebts || 0
                      )}{" "}
                      ل.س
                    </div>
                    {/* Breakage Amount */}
                    {(() => {
                      const breakageAmount =
                        customerData?.invoicesInfo.incomeInvoices
                          .filter(
                            (invoice) => invoice.isBreak && !invoice.paidStatus
                          )
                          .reduce((sum, invoice) => {
                            // For breakage invoices, calculate remaining amount after initial payment
                            // The netAmount already accounts for discount, so we use it directly
                            return sum + invoice.netAmount;
                          }, 0) || 0;

                      return (
                        breakageAmount > 0 && (
                          <>
                            <div className="text-slate-400 text-sm mt-3">
                              قيمة الكسر
                            </div>
                            <div className="text-red-400 font-bold">
                              {formatCurrency(breakageAmount)} ل.س
                            </div>
                          </>
                        )
                      );
                    })()}
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 text-sm">
                      الصواني المعلقة
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-400" />
                      <span className="text-lg font-bold text-slate-200">
                        {customerData?.traysInfo.totalPendingTrays || 0}
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm mt-3">عميل منذ</div>
                    <div className="text-slate-200">
                      {customerData?.customerInfo.customerSince}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category information */}
              {customerData?.customerInfo.category && (
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10 p-4 rounded-xl mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
                  <div className="relative z-10">
                    <div className="text-slate-400 text-sm">التصنيف</div>
                    <div className="text-slate-200 font-bold text-lg">
                      {customerData.customerInfo.category.name}
                    </div>
                    {customerData.customerInfo.category.description && (
                      <div className="text-slate-300 mt-1">
                        {customerData.customerInfo.category.description}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-slate-700 mb-6 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "overview"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-slate-300 hover:text-slate-200"
                  }`}
                >
                  <PieChart className="h-4 w-4" />
                  نظرة عامة
                </button>
                <button
                  onClick={() => setActiveTab("invoices")}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "invoices"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-slate-300 hover:text-slate-200"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  الفواتير
                </button>
                <button
                  onClick={() => setActiveTab("trays")}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "trays"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-slate-300 hover:text-slate-200"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  الصواني
                </button>
                <button
                  onClick={() => setActiveTab("debts")}
                  className={`px-4 py-3 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "debts"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-slate-300 hover:text-slate-200"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  الديون
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Analysis Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                        <h3 className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-blue-400" />
                          المنتجات الشائعة
                        </h3>
                        {customerData?.analysisInfo.popularItems?.length ? (
                          <ul className="space-y-2">
                            {customerData.analysisInfo.popularItems.map(
                              (item) => (
                                <li
                                  key={item.itemId}
                                  className="flex justify-between"
                                >
                                  <span className="text-slate-300">
                                    {item.itemName}
                                  </span>
                                  <span className="text-slate-400">
                                    {item.totalQuantity} قطعة
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-slate-400 text-sm">
                            لا توجد منتجات
                          </p>
                        )}
                      </div>

                      <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                        <h3 className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          تاريخ المعاملات
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-slate-400">
                              أول معاملة
                            </div>
                            <div className="text-slate-200">
                              {formatDate(
                                customerData?.analysisInfo.firstTransaction
                                  ?.date || ""
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">
                              آخر معاملة
                            </div>
                            <div className="text-slate-200 flex items-center gap-2">
                              {formatDate(
                                customerData?.analysisInfo.lastTransaction
                                  ?.date || ""
                              )}
                              {customerData?.analysisInfo.lastTransaction
                                ?.daysSinceLastTransaction === 0 && (
                                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                                  اليوم
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">
                              التكرار
                            </div>
                            <div className="text-slate-200">
                              {customerData?.analysisInfo.transactionFrequency}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                        <h3 className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-400" />
                          سلوك الدفع
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">
                              درجة الموثوقية
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    (customerData?.analysisInfo.paymentBehavior
                                      .paymentReliabilityScore || 0) > 80
                                      ? "bg-emerald-500"
                                      : (customerData?.analysisInfo
                                          .paymentBehavior
                                          .paymentReliabilityScore || 0) > 60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${
                                      customerData?.analysisInfo.paymentBehavior
                                        .paymentReliabilityScore || 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span
                                className={`font-bold ${
                                  (customerData?.analysisInfo.paymentBehavior
                                    .paymentReliabilityScore || 0) > 80
                                    ? "text-emerald-400"
                                    : (customerData?.analysisInfo
                                        .paymentBehavior
                                        .paymentReliabilityScore || 0) > 60
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {Math.round(
                                  customerData?.analysisInfo.paymentBehavior
                                    .paymentReliabilityScore || 0
                                )}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">
                              يفضل الدفع
                            </span>
                            <span className="text-slate-200">
                              {customerData?.analysisInfo.paymentBehavior
                                .prefersPaying
                                ? "نعم"
                                : "لا"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">
                              يفضل الدين
                            </span>
                            <span className="text-slate-200">
                              {customerData?.analysisInfo.paymentBehavior
                                .prefersDebt
                                ? "نعم"
                                : "لا"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {customerData?.customerInfo.notes && (
                      <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                        <h3 className="text-slate-300 text-sm font-medium mb-2">
                          ملاحظات
                        </h3>
                        <p className="text-slate-400">
                          {customerData.customerInfo.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Invoices Tab */}
                {activeTab === "invoices" && (
                  <div>
                    {customerData?.invoicesInfo.incomeInvoices.length === 0 &&
                    customerData?.invoicesInfo.expenseInvoices.length === 0 ? (
                      <div className="text-center py-10 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg text-slate-300 font-medium">
                          لا توجد فواتير
                        </h3>
                        <p className="text-slate-400 mt-1">
                          لم يتم تسجيل أي فواتير لهذا العميل بعد
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Income Invoices */}
                        {customerData &&
                          customerData.invoicesInfo &&
                          customerData.invoicesInfo.incomeInvoices.length >
                            0 && (
                            <div>
                              <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center gap-2">
                                <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                                فواتير المبيعات
                              </h3>
                              <div className="bg-slate-700/30 rounded-xl overflow-hidden border border-slate-600/30">
                                <table className="w-full">
                                  <thead className="bg-slate-700/50">
                                    <tr>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        رقم الفاتورة
                                      </th>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        التاريخ
                                      </th>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        المبلغ
                                      </th>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        نوع الفاتورة
                                      </th>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        الحالة
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {customerData?.invoicesInfo.incomeInvoices.map(
                                      (invoice) => (
                                        <tr
                                          key={invoice.id}
                                          className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors"
                                        >
                                          <td className="p-3 text-slate-300">
                                            {invoice.invoiceNumber}
                                          </td>
                                          <td className="p-3 text-slate-300">
                                            {formatDate(invoice.createdAt)}
                                          </td>
                                          <td className="p-3 text-slate-300">
                                            {formatCurrency(
                                              invoice.totalAmount
                                            )}{" "}
                                            ل.س
                                          </td>
                                          <td className="p-3 text-slate-300">
                                            {invoice.paidStatus
                                              ? "مدفوعة"
                                              : "غير مدفوعة"}{" "}
                                          </td>
                                          <td className="p-3">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(invoice)}
                                              {getStatusLabel(invoice)}
                                            </div>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        {/* Expense Invoices */}
                        {customerData &&
                          customerData.invoicesInfo &&
                          customerData.invoicesInfo.expenseInvoices.length >
                            0 && (
                            <div>
                              <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center gap-2">
                                <ArrowUpRight className="h-5 w-5 text-blue-400 rotate-180" />
                                فواتير المشتريات
                              </h3>
                              <div className="bg-slate-700/30 rounded-xl overflow-hidden border border-slate-600/30">
                                <table className="w-full">
                                  <thead className="bg-slate-700/50">
                                    <tr>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        رقم الفاتورة
                                      </th>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        التاريخ
                                      </th>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        المبلغ
                                      </th>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        الخصم
                                      </th>
                                      <th className="text-right text-slate-200 p-3 text-sm">
                                        الحالة
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {customerData?.invoicesInfo.expenseInvoices.map(
                                      (invoice) => (
                                        <tr
                                          key={invoice.id}
                                          className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors"
                                        >
                                          <td className="p-3 text-slate-300">
                                            {invoice.invoiceNumber}
                                          </td>
                                          <td className="p-3 text-slate-300">
                                            {formatDate(invoice.createdAt)}
                                          </td>
                                          <td className="p-3 text-slate-300">
                                            {formatCurrency(
                                              invoice.totalAmount
                                            )}{" "}
                                            ل.س
                                          </td>
                                          <td className="p-3 text-slate-300">
                                            {formatCurrency(invoice.discount)}{" "}
                                            ل.س
                                          </td>
                                          <td className="p-3">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(invoice)}
                                              {getStatusLabel(invoice)}
                                            </div>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* Trays Tab */}
                {activeTab === "trays" && (
                  <div>
                    {customerData?.traysInfo.pendingTraysDetails.length ===
                    0 ? (
                      <div className="text-center py-10 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg text-slate-300 font-medium">
                          لا توجد صواني معلقة
                        </h3>
                        <p className="text-slate-400 mt-1">
                          لم يتم تسجيل أي صواني لهذا العميل بعد
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-700/30 rounded-xl overflow-hidden border border-slate-600/30">
                        <table className="w-full">
                          <thead className="bg-slate-700/50">
                            <tr>
                              <th className="text-right text-slate-200 p-3 text-sm">
                                رقم الفاتورة
                              </th>
                              <th className="text-right text-slate-200 p-3 text-sm">
                                عدد الصواني
                              </th>
                              <th className="text-right text-slate-200 p-3 text-sm">
                                التاريخ
                              </th>
                              <th className="text-right text-slate-200 p-3 text-sm">
                                معلقة منذ
                              </th>
                              <th className="text-right text-slate-200 p-3 text-sm">
                                ملاحظات
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerData?.traysInfo.pendingTraysDetails.map(
                              (tray) => (
                                <tr
                                  key={tray.id}
                                  className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors"
                                >
                                  <td className="p-3 text-slate-300">
                                    {tray.invoiceId}
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {tray.traysCount}
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {formatDate(tray.createdAt)}
                                  </td>
                                  <td className="p-3 text-orange-400">
                                    {tray.pendingSince}
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {tray.notes || "-"}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Debts Tab */}
                {activeTab === "debts" && (
                  <div className="space-y-6">
                    {/* Active Debts */}
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        الديون النشطة
                      </h3>

                      {customerData?.debtsInfo.activeDebts.length === 0 ? (
                        <div className="text-center py-8 bg-slate-700/30 rounded-xl border border-slate-600/30">
                          <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                          <h3 className="text-lg text-slate-300 font-medium">
                            لا توجد ديون نشطة
                          </h3>
                          <p className="text-slate-400 mt-1">
                            لا يوجد ديون مستحقة على هذا العميل حالياً
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {customerData?.debtsInfo.activeDebts.map((debt) => (
                            <div
                              key={debt.id}
                              className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30"
                            >
                              <div className="flex justify-between mb-2">
                                <span className="text-slate-300 font-medium">
                                  الدين #{debt.id}
                                </span>
                                <span className="text-yellow-400 font-bold">
                                  {formatCurrency(debt.remainingAmount)} ل.س
                                </span>
                              </div>
                              <div className="flex justify-between text-sm mb-3">
                                <span className="text-slate-400">
                                  المبلغ الأصلي:{" "}
                                  {formatCurrency(debt.totalAmount)} ل.س
                                </span>
                                <span className="text-slate-400">
                                  معلق منذ: {debt.pendingSince}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-400">
                                    نسبة السداد
                                  </span>
                                  <span className="text-slate-300">
                                    {debt.paymentProgress}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full"
                                    style={{
                                      width: `${debt.paymentProgress}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>

                              {/* Notes */}
                              {debt.notes && (
                                <div className="text-sm text-slate-400 border-t border-slate-600/30 pt-3 mt-3">
                                  <span className="text-slate-300">
                                    ملاحظات:
                                  </span>{" "}
                                  {debt.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Paid Debts */}
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-400" />
                        الديون المدفوعة
                      </h3>

                      {customerData?.debtsInfo.paidDebts.length === 0 ? (
                        <div className="text-center py-8 bg-slate-700/30 rounded-xl border border-slate-600/30">
                          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-400 mt-1">
                            لا يوجد سجل للديون المدفوعة مسبقاً
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-700/30 rounded-xl overflow-hidden border border-slate-600/30">
                          <table className="w-full">
                            <thead className="bg-slate-700/50">
                              <tr>
                                <th className="text-right text-slate-200 p-3 text-sm">
                                  رقم
                                </th>
                                <th className="text-right text-slate-200 p-3 text-sm">
                                  المبلغ
                                </th>
                                <th className="text-right text-slate-200 p-3 text-sm">
                                  تاريخ الإنشاء
                                </th>
                                <th className="text-right text-slate-200 p-3 text-sm">
                                  تاريخ السداد
                                </th>
                                <th className="text-right text-slate-200 p-3 text-sm">
                                  مدة السداد
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {customerData?.debtsInfo.paidDebts.map((debt) => (
                                <tr
                                  key={debt.id}
                                  className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors"
                                >
                                  <td className="p-3 text-slate-300">
                                    #{debt.id}
                                  </td>
                                  <td className="p-3 text-emerald-400 font-medium">
                                    {formatCurrency(debt.paidAmount)} ل.س
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {formatDate(debt.createdAt)}
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {formatDate(debt.lastPaymentDate)}
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {debt.paidAfter === 0 ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-md">
                                        في نفس اليوم
                                      </span>
                                    ) : (
                                      `${debt.paidAfter} يوم`
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerSummaryModal;
