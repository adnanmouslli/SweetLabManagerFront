"use client";
import ActionButton from "@/components/common/ActionButtons";
import EditInvoiceModal from "@/components/common/EditInvoiceModal";
import HomeInvoiceTable from "@/components/common/HomeInvoiceTable";
import { InvoiceDetailsModal } from "@/components/common/InvoiceDetailsModal";
import InvoiceForm from "@/components/common/InvoiceForm";
import DeleteConfirmationModal from "@/components/common/invoices/DeleteConfirmationModal";
import Navbar from "@/components/common/Navbar";
import PageSpinner from "@/components/common/PageSpinner";
import SplineBackground from "@/components/common/SplineBackground";
import TransactionTypeModal from "@/components/common/TransactionTypeModal";
import { useMokkBar } from "@/components/providers/MokkBarContext";
import { useDeleteInvoice, useFundInvoices } from "@/hooks/invoices/useInvoice";
import {
  useMainTransferHistory,
  useTransferConfirmation,
} from "@/hooks/invoices/useTransfers";
import { Role, useRoles } from "@/hooks/users/useRoles";
import { Invoice, InvoiceCategory, ProductInvoice } from "@/types/invoice.type";
import { InvoiceType } from "@/types/types";
import { getFundId } from "@/utils/fund_id";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BellDot,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Search,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";



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

// Rejection Modal Component
const RejectionModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) => {
  const [rejectionReason, setRejectionReason] = useState("");


  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h2 className="text-xl font-bold text-white mb-4">سبب الرفض</h2>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white min-h-[100px] mb-4"
          placeholder="أدخل سبب رفض التحويل..."
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              if (rejectionReason.trim()) {
                onConfirm(rejectionReason);
              }
            }}
            disabled={!rejectionReason.trim()}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            تأكيد الرفض
          </button>
        </div>
      </div>
    </div>
  );
};

// Modified Case component with support for all invoice types
const Case = () => {
  // State
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<ProductInvoice | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionMode, setTransactionMode] = useState<InvoiceType>(
    InvoiceType.income
  );
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoiceCategory, setSelectedInvoiceCategory] =
    useState<InvoiceCategory | null>(null);

  const handleAddTransaction = (mode: InvoiceType) => {
    setTransactionMode(mode);
    setShowTransactionModal(true);
  };

  const { setSnackbarConfig } = useMokkBar();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"invoices" | "transfers">(
    "invoices"
  );
  const [transferStatus, setTransferStatus] = useState<
    "pending" | "confirmed" | "rejected"
  >("pending");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(
    null
  );

  // New state for invoice form
  const [selectedMethod, setSelectedMethod] = useState<
    "income" | "expense" | null
  >(null);
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<
    InvoiceCategory | null
  >(null);


      const [selectedSubType, setSelectedSubType] = useState<string | undefined>(undefined);

      
  const itemsPerPage = 10;

  const { hasAnyRole } = useRoles();

  // Queries
  const { data: transactions, isLoading: isInvoicesLoading } =
    useFundInvoices("1");
  const { data: pendingTransfers, isLoading: isPendingLoading } =
    useMainTransferHistory("pending");

  const { data: transferHistory, isLoading: isHistoryLoading } =
    useMainTransferHistory(transferStatus);

  // Mutations
  const { mutateAsync: confirmTransfer, isPending: isConfirming } =
    useTransferConfirmation({
      onSuccess: () => {
        setSnackbarConfig({
          open: true,
          severity: "success",
          message: "تم تأكيد/رفض التحويل بنجاح",
        });
      },
      onError: (error) => {
        setSnackbarConfig({
          open: true,
          severity: "error",
          message:
            error?.response?.data?.message || "حدث خطأ أثناء تأكيد/رفض التحويل",
        });
      },
    });

  const deleteInvoice = useDeleteInvoice({
    onSuccess: () => {
      setInvoiceToDelete(null);
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم حذف الفاتورة بنجاح",
      });
    },
    onError: (error) => {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: error?.response?.data?.message || "فشل في حذف الفاتورة",
      });
    },
  });

  const handleConfirmDelete = async () => {
    if (invoiceToDelete) {
      await deleteInvoice.mutateAsync(invoiceToDelete.id);
    }
  };

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, activeTab, transferStatus]);

  // Filter transactions
  const filteredTransactions = transactions
    ? transactions.filter((transaction) => {
      // Apply search filter
      const searchMatch =
        transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.employee.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.totalAmount.toString().includes(searchTerm);

      // Apply type filter
      const typeMatch =
        filterType === "all" || transaction.invoiceType === filterType;

      return searchMatch && typeMatch;
    })
    : [];

  // Pagination for invoices
  const totalInvoicePages = Math.ceil(
    (filteredTransactions?.length || 0) / itemsPerPage
  );
  const paginatedTransactions =
    filteredTransactions?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ) || [];

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.invoiceType === "income")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.invoiceType === "expense")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const balance = totalIncome - totalExpense;

  // Handle invoice form modal opener
  const openInvoiceForm = (
    method: "income" | "expense",
    type: InvoiceCategory
  ) => {
    setSelectedMethod(method);
    setSelectedInvoiceType(type);
  };

  // Handle transfer confirmation or rejection
  const handleTransferAction = async (
    transferId: string,
    confirm: boolean,
    rejectionReason?: string
  ) => {
    try {
      await confirmTransfer({
        transferId,
        confirm,
        rejectionReason,
      });

      setSelectedTransferId(null);
      setShowRejectionModal(false);
    } catch (error) {
      console.error("Error confirming/rejecting transfer:", error);
    }
  };

  // Handle rejection confirmation
  const handleConfirmRejection = (reason: string) => {
    if (selectedTransferId) {
      handleTransferAction(selectedTransferId, false, reason);
    }
  };

  const isLoading =
    isInvoicesLoading || isPendingLoading || isHistoryLoading || isConfirming;

  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      {isLoading && <PageSpinner />}
      <SplineBackground activeTab="case" />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={handleConfirmRejection}
      />

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
                <h1 className="text-4xl font-bold text-white mb-4">الخزينة</h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
              </motion.div>
            </div>

            {/* Main Tabs */}
            <div className="mb-8 flex border-b border-white/10" dir="rtl">
              <button
                onClick={() => setActiveTab("invoices")}
                className={`px-4 py-3 font-medium transition-colors ${activeTab === "invoices"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-white hover:text-blue-200"
                  }`}
              >
                فواتير الخزينة
              </button>
              <button
                onClick={() => setActiveTab("transfers")}
                className={`px-4 py-3 flex items-center gap-5 font-medium transition-colors ${activeTab === "transfers"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-white hover:text-blue-200"
                  }`}
              >
                سجل التحويلات
                {
                  Array.isArray(pendingTransfers) &&
                  pendingTransfers.length > 0 && <div className="text-red-500 p-1  bg-red-500/20 rounded-full" >{pendingTransfers.length}</div>}
              </button>
            </div>

            {/* Invoices Tab Content */}
            {activeTab === "invoices" && (
              <>
                {/* Totals Dashboard */}
                <div
                  className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 px-4"
                  dir="rtl"
                >
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <ArrowUpCircle className="w-8 h-8 text-emerald-400" />
                      <div>
                        <div className="text-sm text-gray-400">
                          إجمالي الدخل
                        </div>
                        <div className="text-xl font-semibold text-emerald-400">
                          {totalIncome} ليرة
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <ArrowDownCircle className="w-8 h-8 text-red-400" />
                      <div>
                        <div className="text-sm text-gray-400">
                          إجمالي المصروفات
                        </div>
                        <div className="text-xl font-semibold text-red-400">
                          {totalExpense} ليرة
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-8 h-8 text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-400">الرصيد</div>
                        <div
                          className={`text-xl font-semibold ${balance >= 0 ? "text-blue-400" : "text-red-400"
                            }`}
                        >
                          {balance} ليرة
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Action Buttons for Adding Invoices */}
                {hasAnyRole([Role.ADMIN, Role.TreasuryManager]) && (
                  <div className="mb-8 px-4" dir="rtl">
                    {/* Filter Toggle (Mobile Only) */}
                    <div className="sm:hidden flex gap-3">


                      {/* Action Buttons (Mobile) */}
                      {hasAnyRole([Role.ADMIN, Role.ShiftManager]) && (
                        <div className="flex gap-2 flex-1">
                          <ActionButton
                            icon={<ArrowDownCircle className="h-5 w-5" />}
                            onClick={() => {
                              handleAddTransaction(InvoiceType.income)
                            }}
                            variant="income"
                            className="flex-1"
                            label="إضافة دخل"
                          />
                          <ActionButton
                            icon={<ArrowUpCircle className="h-5 w-5" />}
                            onClick={() => {
                              handleAddTransaction(InvoiceType.expense)
                            }}
                            variant="expense"
                            className="flex-1"
                            label="إضافة صرف"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons (Desktop) */}
                    {hasAnyRole([Role.ADMIN, Role.ShiftManager]) && (
                      <motion.div
                        className="hidden sm:flex items-center gap-3"
                      >
                        <ActionButton
                          icon={<ArrowDownCircle className="h-5 w-5" />}
                          label="اضافة دخل"
                          onClick={() => {
                            handleAddTransaction(InvoiceType.income)
                          }}
                          variant="income"
                        />
                        <ActionButton
                          icon={<ArrowUpCircle className="h-5 w-5" />}
                          label="اضافة مصروف"
                          onClick={() => {
                            handleAddTransaction(InvoiceType.expense)
                          }}
                          variant="expense"
                        />
                      </motion.div>
                    )}
                  </div>
                )}


                {/* Search and Filters */}
                <div
                  className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 px-4"
                  dir="rtl"
                >
                  {/* Search */}
                  <div className="relative md:col-span-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="بحث في السجلات..."
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

                  {/* Type Filter */}
                  <div>
                    <select
                      value={filterType}
                      onChange={(e) =>
                        setFilterType(
                          e.target.value as "all" | "income" | "expense"
                        )
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      <option value="all">جميع العمليات</option>
                      <option value="income">الدخل فقط</option>
                      <option value="expense">المصروفات فقط</option>
                    </select>
                  </div>
                </div>

                {/* Transactions Table */}
                {/* <div className="container mx-auto px-4" dir="rtl">
                  {isInvoicesLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                    </div>
                  ) : paginatedTransactions.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center text-gray-400">
                      لا توجد عمليات لعرضها
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="text-right text-slate-200 p-4">
                                التاريخ
                              </th>
                              <th className="text-right text-slate-200 p-4">
                                النوع
                              </th>
                              <th className="text-right text-slate-200 p-4">
                                الفئة
                              </th>
                              <th className="text-right text-slate-200 p-4">
                                المبلغ
                              </th>
                              <th className="text-right text-slate-200 p-4">
                                الملاحظات
                              </th>
                              <th className="text-right text-slate-200 p-4">
                                الموظف
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedTransactions.map((transaction, index) => (
                              <motion.tr
                                key={transaction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-t border-white/10 hover:bg-white/5 transition-colors"
                              >
                                <td className="p-4 text-slate-300">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {formatDate(transaction.createdAt)}
                                  </div>
                                </td>
                                <td className="p-4">
                                  {transaction.invoiceType === "income" ? (
                                    <div className="flex items-center gap-2 text-emerald-400">
                                      <ArrowUpCircle className="h-4 w-4" />
                                      <span>دخل</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-red-400">
                                      <ArrowDownCircle className="h-4 w-4" />
                                      <span>مصروف</span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-4 text-slate-300">
                                  {transaction.invoiceCategory === "direct" &&
                                    "مباشر"}
                                  {transaction.invoiceCategory === "products" &&
                                    "منتجات"}
                                  {transaction.invoiceCategory === "debt" &&
                                    "دين"}
                                  {transaction.invoiceCategory === "advance" &&
                                    "سلفة"}
                                </td>
                                <td className="p-4 text-slate-300">
                                  <div
                                    className={`font-medium ${transaction.invoiceType === "income"
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                      }`}
                                  >
                                    {transaction.totalAmount} ليرة
                                  </div>
                                </td>
                                <td className="p-4 text-slate-300">
                                  {transaction.notes || "-"}
                                </td>
                                <td className="p-4 text-slate-300">
                                  {transaction.employee.username}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div> */}
                <HomeInvoiceTable
                  data={paginatedTransactions}
                  // @ts-ignore
                  onViewDetails={(invoice) => setSelectedInvoice(invoice)}
                  onEditInvoice={(invoice) => setInvoiceToEdit(invoice)}
                  onDeleteInvoice={(invoice) => setInvoiceToDelete(invoice)}
                />


                {/* Pagination for Invoices */}
                {totalInvoicePages > 1 && (
                  <div
                    className="mt-8 flex justify-center items-center gap-4"
                    dir="rtl"
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                    >
                      السابق
                    </button>

                    <div className="flex items-center gap-2" dir="rtl">
                      <span className="text-white">الصفحة</span>
                      <select
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg text-white px-2 py-1"
                      >
                        {[...Array(totalInvoicePages)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <span className="text-white">من {totalInvoicePages}</span>
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(totalInvoicePages, p + 1)
                        )
                      }
                      disabled={
                        currentPage === totalInvoicePages ||
                        totalInvoicePages === 0
                      }
                      className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                    >
                      التالي
                    </button>
                  </div>
                )}

                {/* Results count */}
                <div className="mt-4 text-center text-gray-400">
                  إجمالي النتائج: {filteredTransactions.length}
                </div>
              </>
            )}

            {/* Transfers Tab Content */}
            {activeTab === "transfers" && (
              <div dir="rtl">
                {/* Transfers Filter */}
                <div className="mb-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => setTransferStatus("pending")}
                    className={`px-4 py-2 rounded-lg transition-colors ${transferStatus === "pending"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      }`}
                  >
                    <Clock className="h-4 w-4 inline-block mx-2" />
                    التحويلات المعلقة
                  </button>
                  <button
                    onClick={() => setTransferStatus("confirmed")}
                    className={`px-4 py-2 rounded-lg transition-colors ${transferStatus === "confirmed"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      }`}
                  >
                    <CheckCircle className="h-4 w-4 inline-block mx-2" />
                    التحويلات المؤكدة
                  </button>
                  <button
                    onClick={() => setTransferStatus("rejected")}
                    className={`px-4 py-2 rounded-lg transition-colors ${transferStatus === "rejected"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      }`}
                  >
                    <XCircle className="h-4 w-4 inline-block mx-2" />
                    التحويلات المرفوضة
                  </button>
                </div>

                {/* Transfers Table */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                  {transferStatus === "pending" ? (
                    // Pending Transfers Table
                    isPendingLoading ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                      </div>
                    ) : pendingTransfers ? (
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="text-right text-slate-200 p-4">
                              التاريخ
                            </th>
                            <th className="text-right text-slate-200 p-4">
                              المبلغ
                            </th>
                            <th className="text-right text-slate-200 p-4">
                              الملاحظات
                            </th>
                            <th className="text-right text-slate-200 p-4">
                              طلب بواسطة
                            </th>
                            <th className="text-right text-slate-200 p-4">
                              الإجراءات
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(pendingTransfers) ? (
                            pendingTransfers.length > 0 ? (
                              pendingTransfers.map((transfer) => (
                                <tr
                                  key={transfer.id}
                                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                                >
                                  <td className="p-4 text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-gray-400" />
                                      {formatDate(transfer.requestedAt)}
                                    </div>
                                  </td>
                                  <td className="p-4 text-slate-300 font-medium">
                                    {transfer.amount} ليرة
                                  </td>
                                  <td className="p-4 text-slate-300">
                                    {transfer.notes || "-"}
                                  </td>
                                  <td className="p-4 text-slate-300">
                                    {transfer.requestedBy?.username || "-"}
                                  </td>
                                  <td className="p-4">
                                    {hasAnyRole([
                                      Role.ADMIN,
                                      Role.TreasuryManager,
                                    ]) && (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() =>
                                              handleTransferAction(
                                                transfer.id.toString(),
                                                true
                                              )
                                            }
                                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                            disabled={isConfirming}
                                          >
                                            <Check className="h-4 w-4 inline-block" />
                                            <span className="mx-1">تأكيد</span>
                                          </button>
                                          <button
                                            onClick={() => {
                                              setSelectedTransferId(
                                                transfer.id.toString()
                                              );
                                              setShowRejectionModal(true);
                                            }}
                                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                            disabled={isConfirming}
                                          >
                                            <X className="h-4 w-4 inline-block" />
                                            <span className="mx-1">رفض</span>
                                          </button>
                                        </div>
                                      )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="p-8 text-center text-gray-400"
                                >
                                  لا توجد تحويلات معلقة
                                </td>
                              </tr>
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="p-8 text-center text-gray-400"
                              >
                                لا توجد تحويلات معلقة
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-gray-400">
                        لا توجد تحويلات معلقة
                      </div>
                    )
                  ) : // Transfer History Table
                    isHistoryLoading ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                      </div>
                    ) : transferHistory ? (
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="text-right text-slate-200 p-4">
                              التاريخ
                            </th>
                            <th className="text-right text-slate-200 p-4">
                              المبلغ
                            </th>
                            <th className="text-right text-slate-200 p-4">
                              الملاحظات
                            </th>
                            <th className="text-right text-slate-200 p-4">
                              طلب بواسطة
                            </th>
                            {transferStatus === "confirmed" && (
                              <th className="text-right text-slate-200 p-4">
                                تأكيد بواسطة
                              </th>
                            )}
                            <th className="text-right text-slate-200 p-4">
                              الحالة
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(transferHistory) ? (
                            transferHistory.length > 0 ? (
                              transferHistory.map((transfer) => (
                                <tr
                                  key={transfer.id}
                                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                                >
                                  <td className="p-4 text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-gray-400" />
                                      {formatDate(transfer.requestedAt)}
                                    </div>
                                  </td>
                                  <td className="p-4 text-slate-300 font-medium">
                                    {transfer.amount} ليرة
                                  </td>
                                  <td className="p-4 text-slate-300">
                                    {transfer.notes || "-"}
                                  </td>
                                  <td className="p-4 text-slate-300">
                                    {transfer.requestedBy?.username || "-"}
                                  </td>
                                  {transferStatus === "rejected" && (
                                    <td className="p-4 text-red-400">
                                      {transfer.rejectionReason || "-"}
                                    </td>
                                  )}
                                  {transferStatus === "confirmed" && (
                                    <td className="p-4 text-slate-300">
                                      {transfer.confirmedBy?.username || "-"}
                                    </td>
                                  )}
                                  <td className="p-4">
                                    {transfer.status === "confirmed" ? (
                                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                        <CheckCircle className="h-4 w-4 inline-block mx-1" />
                                        مؤكد
                                      </span>
                                    ) : transfer.status === "rejected" ? (
                                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm flex flex-nowrap items-end">
                                        <XCircle className="h-4 w-4 inline-block mx-1" />
                                        مرفوض
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                                        <Clock className="h-4 w-4 inline-block mx-1" />
                                        معلق
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={transferStatus === "rejected" ? 6 : 5}
                                  className="p-8 text-center text-gray-400"
                                >
                                  {transferStatus === "confirmed"
                                    ? "لا توجد تحويلات مؤكدة"
                                    : "لا توجد تحويلات مرفوضة"}
                                </td>
                              </tr>
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={transferStatus === "rejected" ? 6 : 5}
                                className="p-8 text-center text-gray-400"
                              >
                                {transferStatus === "confirmed"
                                  ? "لا توجد تحويلات مؤكدة"
                                  : "لا توجد تحويلات مرفوضة"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-gray-400">
                        لا توجد بيانات تحويلات
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Invoice Modals */}
      {selectedMethod && selectedInvoiceType && (
        <InvoiceForm
          type={selectedInvoiceType}
          mode={selectedMethod}
          onClose={() => {
            setSelectedMethod(null);
            setSelectedInvoiceType(null);
          }}
          fundId={0}
        />
      )}

      <AnimatePresence>
        {showTransactionModal && (
          <TransactionTypeModal
            onClose={() => setShowTransactionModal(false)}
            onSelect={(category, subType) => {
              setSelectedInvoiceCategory(category);
              setSelectedSubType(subType);
              setShowTransactionModal(false);
              setShowInvoiceForm(true);
            }}
            mode={transactionMode}
          />
        )}

        {showInvoiceForm && selectedInvoiceCategory && (
          <InvoiceForm
            type={selectedInvoiceCategory}
            mode={transactionMode}
            onClose={() => {
              setShowInvoiceForm(false);
              setSelectedInvoiceCategory(null);
              setSelectedSubType(undefined);
            }}
            fundId={1}
            subType={selectedSubType}
          />
        )}

        {selectedInvoice && (
          <InvoiceDetailsModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
        {invoiceToEdit && (
          <EditInvoiceModal
            invoice={invoiceToEdit}
            onClose={() => setInvoiceToEdit(null)}
          />
        )}
        {invoiceToDelete && (
          <DeleteConfirmationModal
            invoice={invoiceToDelete}
            isDeleting={deleteInvoice.isPending}
            onConfirm={handleConfirmDelete}
            onCancel={() => setInvoiceToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Case;
