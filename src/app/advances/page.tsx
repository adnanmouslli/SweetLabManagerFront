"use client";
import InvoiceForm from "@/components/common/InvoiceForm";
import Navbar from "@/components/common/Navbar";
import PageSpinner from "@/components/common/PageSpinner";
import SplineBackground from "@/components/common/SplineBackground";
import {
  useActiveAdvances,
  useAdvanceDetails,
} from "@/hooks/advances/useAdvances";
import { useFunds } from "@/hooks/funds/useFunds";
import { InvoiceCategory } from "@/types/invoice.type";
import { formatDate } from "@/utils/formatters";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const AdvancesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<number | null>(
    null
  );
  const [showRepayForm, setShowRepayForm] = useState(false);
  const [repayAdvanceId, setRepayAdvanceId] = useState<number | null>(null);
  const [showFundSelection, setShowFundSelection] = useState(false);
  const [selectedFundId, setSelectedFundId] = useState<number | null>(null);

  // Fetch active advances
  const { data: activeAdvances, isLoading: isLoadingAdvances } =
    useActiveAdvances();

  // Fetch selected advance details
  const { data: selectedAdvance, isLoading: isLoadingDetails } =
    useAdvanceDetails(selectedAdvanceId || 0);

  // Fetch funds for selection
  const { data: funds, isLoading: isLoadingFunds } = useFunds();

  // Filter advances based on search term
  const filteredAdvances = activeAdvances?.filter((advance) => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
      advance.customer?.name.toLowerCase().includes(lowerCaseSearch) ||
      advance.notes?.toLowerCase().includes(lowerCaseSearch) ||
      advance.totalAmount.toString().includes(lowerCaseSearch)
    );
  });

  // Handle selecting an advance
  const handleSelectAdvance = (advanceId: number) => {
    setSelectedAdvanceId(advanceId);
  };

  // Back to list
  const handleBackToList = () => {
    setSelectedAdvanceId(null);
  };

  // Open fund selection for repay
  const handleOpenRepayForm = (advanceId: number) => {
    setRepayAdvanceId(advanceId);
    setShowFundSelection(true);
  };

  // Handle fund selection and proceed to repay form
  const handleFundSelected = (fundId: number) => {
    setSelectedFundId(fundId);
    setShowFundSelection(false);
    setShowRepayForm(true);
  };

  // Close repay form
  const handleCloseRepayForm = () => {
    setShowRepayForm(false);
    setRepayAdvanceId(null);
    setSelectedFundId(null);
  };

  // Close fund selection
  const handleCloseFundSelection = () => {
    setShowFundSelection(false);
    setRepayAdvanceId(null);
    setSelectedFundId(null);
  };

  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      {(isLoadingAdvances || isLoadingDetails || isLoadingFunds) && (
        <PageSpinner />
      )}
      <SplineBackground activeTab="advances" />

      <div className="relative z-10">
        <Navbar />

        <main className="py-32 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title Section */}
            <div className="container mx-auto px-4 mb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="text-4xl font-bold text-white mb-4">
                  إدارة السلف
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
              </motion.div>
            </div>

            {/* Advances List View */}
            {!selectedAdvanceId && (
              <div dir="rtl">
                {/* Search Bar */}
                <div className="mb-8" dir="rtl">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="البحث عن سلفة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/30"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Advances List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoadingAdvances ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                      <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                    </div>
                  ) : filteredAdvances?.length === 0 ? (
                    <div className="col-span-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center text-gray-400">
                      لا توجد سلف نشطة
                    </div>
                  ) : (
                    filteredAdvances?.map((advance) => (
                      <motion.div
                        key={advance.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors group"
                      >
                        <div
                          className="p-5 cursor-pointer"
                          onClick={() => handleSelectAdvance(advance.id)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="bg-blue-500/20 text-blue-400 rounded-lg text-xs px-2 py-1">
                              سلفة نشطة
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(advance.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-2 rounded-full">
                              <User className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="font-medium text-white">
                              {advance.customer?.name}
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-3 mb-3">
                            <div className="text-sm text-gray-400 mb-1">
                              قيمة السلفة
                            </div>
                            <div className="text-xl font-semibold text-white">
                              {advance.totalAmount.toLocaleString()} ليرة
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-lg p-3 mb-3">
                            <div className="text-sm text-gray-400 mb-1">
                              المبلغ المتبقي
                            </div>
                            <div className="text-xl font-semibold text-white">
                              {advance.remainingAmount.toLocaleString()} ليرة
                            </div>
                          </div>

                          {advance.notes && (
                            <div className="text-gray-400 text-sm flex items-start gap-2 mt-3">
                              <FileText className="h-4 w-4 mt-0.5" />
                              <div>{advance.notes}</div>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-white/10 flex">
                          <div
                            className="flex-1 p-3 text-sm flex justify-center items-center gap-2 text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            onClick={() => handleSelectAdvance(advance.id)}
                          >
                            عرض التفاصيل
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                          <div
                            className="flex-1 p-3 text-sm flex justify-center items-center gap-2 text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer border-r border-white/10"
                            onClick={() => handleOpenRepayForm(advance.id)}
                          >
                            تسديد دفعة
                            <ArrowDown className="h-4 w-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Advance Details View */}
            {selectedAdvanceId && selectedAdvance && (
              <div dir="rtl">
                <div className="flex flex-wrap justify-between items-center mb-6">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    العودة إلى قائمة السلف
                  </button>

                  <button
                    onClick={() => handleOpenRepayForm(selectedAdvanceId)}
                    className="mt-2 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                    تسديد دفعة من السلفة
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-6 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-white">
                            تفاصيل السلفة
                          </h2>
                          <span className="bg-blue-500/20 text-blue-400 rounded-lg text-xs px-2 py-1">
                            {selectedAdvance.status === "active"
                              ? "نشطة"
                              : "مغلقة"}
                          </span>
                        </div>
                        <div className="text-gray-400 mt-1">
                          رقم السلفة: #{selectedAdvance.id}
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0">
                        <div className="text-sm text-gray-400 mb-1">
                          تاريخ الإنشاء
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          {formatDate(selectedAdvance.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div className="bg-white/5 rounded-lg p-5">
                        <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-white/10">
                          معلومات العميل
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-gray-400 mb-1">
                              اسم العميل
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-400" />
                              <div className="text-white font-medium">
                                {selectedAdvance.customer?.name}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-400 mb-1">
                              رقم الهاتف
                            </div>
                            <div className="text-white">
                              {selectedAdvance.customer?.phone || "غير متوفر"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Advance Info */}
                      <div className="bg-white/5 rounded-lg p-5">
                        <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-white/10">
                          معلومات السلفة
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-400 mb-1">
                              قيمة السلفة
                            </div>
                            <div className="text-white text-xl font-medium">
                              {selectedAdvance.totalAmount.toLocaleString()}{" "}
                              ليرة
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-400 mb-1">
                              المبلغ المتبقي
                            </div>
                            <div className="text-white text-xl font-medium">
                              {selectedAdvance.remainingAmount.toLocaleString()}{" "}
                              ليرة
                            </div>
                          </div>

                          <div className="col-span-2">
                            <div className="text-sm text-gray-400 mb-1">
                              نسبة التسديد
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-4 mt-1">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((selectedAdvance.totalAmount -
                                      selectedAdvance.remainingAmount) /
                                      selectedAdvance.totalAmount) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {Math.round(
                                ((selectedAdvance.totalAmount -
                                  selectedAdvance.remainingAmount) /
                                  selectedAdvance.totalAmount) *
                                  100
                              )}
                              % مكتمل
                            </div>
                          </div>

                          {selectedAdvance.lastPaymentDate && (
                            <div className="col-span-2">
                              <div className="text-sm text-gray-400 mb-1">
                                آخر دفعة
                              </div>
                              <div className="text-white">
                                {formatDate(selectedAdvance.lastPaymentDate)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedAdvance.notes && (
                        <div className="col-span-full bg-white/5 rounded-lg p-5">
                          <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-white/10">
                            ملاحظات
                          </h3>
                          <div className="text-white">
                            {selectedAdvance.notes}
                          </div>
                        </div>
                      )}

                      {/* Related Invoices */}
                      <div className="col-span-full bg-white/5 rounded-lg p-5">
                        <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-white/10">
                          الفواتير المرتبطة
                        </h3>

                        {selectedAdvance.relatedInvoices?.length ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-white/5">
                                  <th className="text-right text-slate-200 p-3">
                                    رقم الفاتورة
                                  </th>
                                  <th className="text-right text-slate-200 p-3">
                                    النوع
                                  </th>
                                  <th className="text-right text-slate-200 p-3">
                                    التاريخ
                                  </th>
                                  <th className="text-right text-slate-200 p-3">
                                    المبلغ
                                  </th>
                                  <th className="text-right text-slate-200 p-3">
                                    ملاحظات
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedAdvance.relatedInvoices.map(
                                  (invoice) => (
                                    <tr
                                      key={invoice.id}
                                      className="border-t border-white/10 hover:bg-white/5"
                                    >
                                      <td className="p-3 text-white">
                                        {invoice.invoiceNumber}
                                      </td>
                                      <td className="p-3">
                                        {invoice.invoiceType === "income" ? (
                                          <span className="text-emerald-400">
                                            إنشاء سلفة
                                          </span>
                                        ) : (
                                          <span className="text-red-400">
                                            تسديد سلفة
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-3 text-gray-400">
                                        {formatDate(invoice.createdAt)}
                                      </td>
                                      <td className="p-3 text-white">
                                        {invoice.totalAmount.toLocaleString()}{" "}
                                        ليرة
                                      </td>
                                      <td className="p-3 text-gray-400">
                                        {invoice.notes || "-"}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 py-4">
                            لا توجد فواتير مرتبطة
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Fund Selection Modal */}
      {showFundSelection && repayAdvanceId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-slate-200">
                اختر الصندوق للسداد
              </h3>
              <button
                onClick={handleCloseFundSelection}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {isLoadingFunds ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  <span className="text-slate-400 mr-2">
                    جاري تحميل الصناديق...
                  </span>
                </div>
              ) : (
                funds?.map((fund) => (
                  <button
                    key={fund.id}
                    onClick={() => handleFundSelected(fund.id)}
                    className="w-full p-4 text-right bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20"
                  >
                    <div className="font-medium">
                      {fund.fundType === "main"
                        ? "الخزنة"
                        : fund.fundType === "booth"
                        ? "بسطة"
                        : fund.fundType === "university"
                        ? "الجامعة"
                        : fund.fundType === "general"
                        ? "عام"
                        : fund.fundType}
                    </div>
                    <div className="text-sm opacity-75">
                      الرصيد: {fund.currentBalance.toLocaleString()} ل.س
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Repay Advance Form */}
      {showRepayForm && repayAdvanceId && selectedFundId && (
        <InvoiceForm
          type={InvoiceCategory.ADVANCE}
          mode="expense"
          fundId={selectedFundId}
          onClose={handleCloseRepayForm}
          customerId={
            selectedAdvanceId
              ? selectedAdvance?.customer?.id
              : activeAdvances?.find((adv) => adv.id === repayAdvanceId)
                  ?.customer?.id
          }
        />
      )}
    </div>
  );
};

export default AdvancesPage;
