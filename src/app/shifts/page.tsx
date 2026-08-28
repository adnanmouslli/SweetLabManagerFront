"use client";
import { ShiftSummaryData } from "@/components/common/CloseShiftModal";
import InvoicesModal from "@/components/common/InvoicesModal";
import Navbar from "@/components/common/Navbar";
import PageSpinner from "@/components/common/PageSpinner";
import ShiftSummaryModal from "@/components/common/ShiftSummaryModal";
import CloseShiftModal from "@/components/common/CloseShiftModal";
import SplineBackground from "@/components/common/SplineBackground";
import { useMokkBar } from "@/components/providers/MokkBarContext";
import {
  useCompleteClosure,
  useFetchShiftSummary,
  useShiftInvoices,
  useShiftsPaginated,
} from "@/hooks/shifts/useShifts";
import { formatDate } from "@/utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Receipt,
  Store,
  User2,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const Shifts = () => {
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "morning" | "evening">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">(
    "all"
  );
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummaryData | undefined>(
    undefined
  );

  // State for invoice modals
  const [selectedInvoicesShift, setSelectedInvoicesShift] = useState<number | null>(null);
  const [invoicesModalType, setInvoicesModalType] = useState<
    "boothInvoices" | "universityInvoices" | "generalInvoices" | null
  >(null);

  // State for viewing invoice details
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<any | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<any | null>(null);

  // Access the snackbar for notifications
  const { setSnackbarConfig } = useMokkBar();

  const itemsPerPage = 10;

  // تأخير بسيط قبل إرسال البحث للباك، لتفادي إرسال طلب مع كل ضغطة زر
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // إعادة الصفحة إلى 1 كلما تغيرت الفلترة أو البحث حتى لا نطلب صفحة غير موجودة من الباك
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, filterStatus]);

  const { data: shiftsResult, isLoading } = useShiftsPaginated({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    shiftType: filterType !== "all" ? filterType : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
  });
  const paginatedShifts = shiftsResult?.data ?? [];
  const totalResults = shiftsResult?.total ?? 0;
  const totalPages = shiftsResult?.totalPages ?? 1;

  const { mutate: fetchSummary, isPending: isSummaryLoading } =
    useFetchShiftSummary({
      onSuccess: (data) => setShiftSummary(data),
    });

  // Use the hook only when we have both a shift ID and a modal type
  const {
    data: invoicesData,
    isLoading: isInvoicesLoading,
  } = useShiftInvoices(
    selectedInvoicesShift ? selectedInvoicesShift.toString() : "",
    {
      enabled: !!selectedInvoicesShift && !!invoicesModalType
    }
  );

  const { mutate: completeClosure, isPending: isCompleteClosureLoading } = useCompleteClosure();

  // State for close shift modal (replacing complete closure modal)
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [closeShiftId, setCloseShiftId] = useState<number | null>(null);
  const [closeShiftType, setCloseShiftType] = useState<"صباحي" | "مسائي">("صباحي");

  const handleOpenCloseShiftModal = (shiftId: number, shiftType: "morning" | "evening") => {
    setCloseShiftId(shiftId);
    setCloseShiftType(shiftType === "morning" ? "صباحي" : "مسائي");
    // Fetch shift summary data
    fetchSummary(shiftId);
    setIsCloseShiftModalOpen(true);
  };

  const handleCloseCloseShiftModal = () => {
    setCloseShiftId(null);
    setCloseShiftType("صباحي");
    setShiftSummary(undefined);
    setIsCloseShiftModalOpen(false);
  };

  const handleConfirmCloseShift = ({ amount }: { amount: number }) => {
    if (closeShiftId) {
      completeClosure({ id: closeShiftId, data: { actualAmount: amount } }, {
        onSuccess: () => {
          setSnackbarConfig({
            open: true,
            severity: "success",
            message: "تم إنهاء الوردية بنجاح"
          });
          handleCloseCloseShiftModal();
        },
        onError: () => {
          setSnackbarConfig({
            open: true,
            severity: "error",
            message: "حدث خطأ أثناء إنهاء الوردية"
          });
        }
      });
    }
  };

  const handleShiftClick = (shiftId: number) => {
    setSelectedShift(shiftId);
    fetchSummary(shiftId);
  };

  const handleCompleteClosure = (shiftId: number, differenceValue: number) => {
    setSelectedShift(shiftId);
    completeClosure({ id: shiftId, data: { actualAmount: differenceValue } });
  };

  // Improved invoice handlers - they now set both states at once
  const handleBoothInvoices = (shiftId: number) => {
    setSelectedInvoicesShift(shiftId);
    setInvoicesModalType("boothInvoices");
  };

  const handleUniversityInvoices = (shiftId: number) => {
    setSelectedInvoicesShift(shiftId);
    setInvoicesModalType("universityInvoices");
  };

  const handleGeneralInvoices = (shiftId: number) => {
    setSelectedInvoicesShift(shiftId);
    setInvoicesModalType("generalInvoices");
  };

  // Handle closing the invoice modal
  const handleCloseInvoiceModal = () => {
    setSelectedInvoicesShift(null);
    setInvoicesModalType(null);
  };

  // Handle invoice actions
  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoiceForView(invoice);
    // You could open a separate modal here to view invoice details
    setSnackbarConfig({
      open: true,
      severity: "info",
      message: `عرض تفاصيل الفاتورة رقم ${invoice.id}`,
    });
    console.log("View invoice:", invoice);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoiceForEdit(invoice);
    // You could open an edit form modal here
    setSnackbarConfig({
      open: true,
      severity: "info",
      message: `تعديل الفاتورة رقم ${invoice.id}`,
    });
    console.log("Edit invoice:", invoice);
  };

  const handleDeleteInvoice = (invoice: any) => {
    // Show confirmation dialog or directly handle deletion
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف الفاتورة رقم ${invoice.id}؟`)) {
      // Implement actual deletion logic here
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: `تم حذف الفاتورة رقم ${invoice.id} بنجاح`,
      });
      console.log("Delete invoice:", invoice);
    }
  };

  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      {(isLoading || isSummaryLoading || isInvoicesLoading || isCompleteClosureLoading) && <PageSpinner />}
      <SplineBackground activeTab="shifts" />
      <AnimatePresence>
        {selectedShift && (
          <ShiftSummaryModal
            shiftId={selectedShift}
            summary={shiftSummary}
            onClose={() => {
              setSelectedShift(null);
              setShiftSummary(undefined);
            }}
          />
        )}
        {selectedInvoicesShift && invoicesModalType && invoicesData && (
          <InvoicesModal
            type={invoicesModalType}
            data={invoicesData}
            onClose={handleCloseInvoiceModal}
          />
        )}
        {isCloseShiftModalOpen && closeShiftId && (
          <CloseShiftModal
            open={isCloseShiftModalOpen}
            onClose={handleCloseCloseShiftModal}
            onConfirm={handleConfirmCloseShift}
            shiftType={closeShiftType}
            shiftSummary={shiftSummary}
            isShiftClosing={isCompleteClosureLoading}
            shiftId={closeShiftId}
          />
        )}
      </AnimatePresence>
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
                  سجل الورديات
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
              </motion.div>
            </div>
            {/* Search and Filters */}
            <div
              className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 px-4"
              dir="rtl"
            >
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/30"
                />
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as typeof filterType)
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="all">جميع الورديات</option>
                  <option value="morning">وردية صباحية</option>
                  <option value="evening">وردية مسائية</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as typeof filterStatus)
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="open">مفتوحة</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setSearch("");
                  setFilterType("all");
                  setFilterStatus("all");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                إعادة تعيين الفلترة
              </button>
            </div>
            {/* Shifts List */}
            <div className="container mx-auto px-4" dir="rtl">
              <div className="grid gap-6">
                {paginatedShifts.map((shift, index) => (
                  <motion.div
                    key={shift.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 "
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${shift.shiftType === "morning"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-blue-500/10 text-blue-400"
                            }`}
                        >
                          {shift.shiftType === "morning"
                            ? "وردية صباحية"
                            : "وردية مسائية"}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${shift.status === "open"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                            }`}
                        >
                          {shift.status === "open" ? "مفتوحة" : shift.status === "partially_closed" ? "مغلقة جزئيا" : "مغلقة"}
                        </div>
                        {shift.differenceStatus && (
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${shift.differenceStatus === "surplus"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                              }`}
                          >
                            {shift.differenceValue}{" "}
                            {shift.differenceStatus === "surplus"
                              ? "زيادة"
                              : "نقصان"}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        رقم الوردية: #{shift.id}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3">
                        <User2 className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-sm text-gray-400">الموظف</div>
                          <div className="text-white">
                            {shift.employee.username}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-sm text-gray-400">وقت الفتح</div>
                          <div className="text-white">
                            {formatDate(shift.openTime)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-sm text-gray-400">
                            وقت الإغلاق
                          </div>
                          <div className="text-white">
                            {shift.closeTime
                              ? formatDate(shift.closeTime)
                              : "الوردية مفتوحة"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* complete closure */}
                        {shift.status === "partially_closed" && (
                          <button
                            onClick={() => handleOpenCloseShiftModal(shift.id, shift.shiftType)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            إنهاء الوردية
                          </button>
                        )}

                        <button
                          onClick={() => handleShiftClick(shift.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          ملخص الوردية
                        </button>

                        <button
                          onClick={() => handleBoothInvoices(shift.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          <Store className="w-4 h-4" />
                          فواتير البسطة
                        </button>

                        <button
                          onClick={() => handleUniversityInvoices(shift.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                        >
                          <GraduationCap className="w-4 h-4" />
                          فواتير الجامعة
                        </button>

                        <button
                          onClick={() => handleGeneralInvoices(shift.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                          الفواتير العامة
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty State */}
                {!isLoading && filteredShifts.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    لا يوجد ورديات لعرضها
                  </div>
                )}
              </div>
            </div>
            {/* Pagination */}
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
                  {[...Array(totalPages)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <span className="text-white">من {totalPages}</span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
              >
                التالي
              </button>
            </div>

            {/* Results count */}
            <div className="mt-4 text-center text-gray-400">
              إجمالي النتائج: {filteredShifts.length}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shifts;