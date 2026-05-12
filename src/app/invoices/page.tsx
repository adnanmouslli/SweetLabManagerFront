"use client";
import InvoiceDetailModal from "@/components/common/InvoiceDetailModal";
import { InvoiceFilters } from "@/components/common/InvoiceFilters";
import { InvoiceTable } from "@/components/common/InvoiceTable";
import { InvoiceStatus, InvoiceTabs } from "@/components/common/InvoiceTabs";
import Navbar from "@/components/common/Navbar";
import PageSpinner from "@/components/common/PageSpinner";
import SplineBackground from "@/components/common/SplineBackground";
import StatusTransitionModal from "@/components/common/StatusTransitionModal";
import { usePaginatedInvoices, useMarkInvoiceAsBreak } from "@/hooks/invoices/useInvoice";
import { Invoice, InvoiceQueryParams } from "@/types/invoice.type";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import BreakageConversionModal from "@/components/common/invoices/BreakageConversionModal";
import { useMokkBar } from "@/components/providers/MokkBarContext";

const InvoiceManagementPage = () => {
  const [invoiceType, setInvoiceType] = useState<"income" | "expense">("income");
  const { setSnackbarConfig } = useMokkBar();

  const [activeStatus, setActiveStatus] = useState<InvoiceStatus | "all">("paid");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  const itemsPerPage = 20;

  // Build query params for paginated API
  const queryParams: InvoiceQueryParams = {
    page: currentPage,
    limit: itemsPerPage,
    type: invoiceType,
    ...(activeStatus !== "all" && { status: activeStatus }),
    ...(dateFilter.startDate && { startDate: dateFilter.startDate.toISOString().split('T')[0] }),
    ...(dateFilter.endDate && { endDate: dateFilter.endDate.toISOString().split('T')[0] }),
    ...(searchTerm.trim() && { search: searchTerm.trim() }),
  };

  // Fetch invoices with paginated API
  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = usePaginatedInvoices(queryParams);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [invoiceType, activeStatus, dateFilter, searchTerm]);

  const [invoiceForBreak, setInvoiceForBreak] = useState<Invoice | null>(null);
  const markAsBreak = useMarkInvoiceAsBreak();

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] =
    useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [targetStatus, setTargetStatus] = useState<
    "paid" | "unpaid" | "debt" | "breakage" | null
  >(null);

  // Data from paginated API
  const filteredInvoices = paginatedData?.data || [];
  const totalCount = paginatedData?.pagination?.totalCount || 0;
  const totalPages = paginatedData?.pagination?.totalPages || 0;

  // Type toggle handler
  const handleTypeToggle = () => {
    setInvoiceType(prev => prev === "income" ? "expense" : "income");
  };

  // Handle conversion to breakage
  const handleConvertToBreak = (invoice: Invoice) => {
    setInvoiceForBreak(invoice);
  };

  // Handle confirm breakage conversion
  const handleConfirmBreakConversion = async (initialPayment: number, notes: string) => {
    if (!invoiceForBreak) return;

    try {
      await markAsBreak.mutateAsync({
        id: invoiceForBreak.id,
        data: {
          initialPayment,
          notes
        }
      });

      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم تحويل الفاتورة إلى فاتورة كسر بنجاح"
      });

      setInvoiceForBreak(null);
    } catch (error) {
      console.error("Error converting to breakage:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "حدث خطأ أثناء تحويل الفاتورة إلى فاتورة كسر"
      });
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-danger">
        {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
      <SplineBackground activeTab="عام" />
      {isLoading && <PageSpinner />}
      <div className="relative z-10">
        <Navbar />
        <main className="pt-32 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-6">
              <InvoiceFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
              />
            </div>

            {/* Invoice Type Toggle */}
            <div className="mb-6 flex justify-between items-center" dir="rtl">
              <div className="text-xl font-bold text-slate-100">
                {invoiceType === "income" ? "فواتير الدخل" : "فواتير الصرف"}
                <span className="text-sm font-normal text-slate-400 mr-2">
                  ({totalCount} فاتورة)
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTypeToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  invoiceType !== "income"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                }`}
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>
                  {invoiceType === "income"
                    ? "عرض فواتير الصرف"
                    : "عرض فواتير الدخل"}
                </span>
              </motion.button>
            </div>

            {/* Status Tabs */}
            <InvoiceTabs
              activeStatus={activeStatus}
              onStatusChange={(status) => {
                setActiveStatus(status as InvoiceStatus);
              }}
            />

            {/* Invoices Table */}
            <motion.div
              key={`${invoiceType}-${activeStatus}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InvoiceTable
                invoices={filteredInvoices}
                invoiceType={invoiceType}
                onViewDetail={(invoice) => {
                  setSelectedInvoiceForDetail(invoice);
                  setIsDetailModalOpen(true);
                }}
                onStatusChange={(invoice, status) => {
                  setSelectedInvoice(invoice);
                  setTargetStatus(status);
                }}
                onConvertToBreak={handleConvertToBreak}
              />
            </motion.div>

            {/* Server-side Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-4" dir="rtl">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-slate-800/50 text-white disabled:opacity-50 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
                >
                  السابق
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-slate-300">الصفحة</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg text-white px-2 py-1"
                  >
                    {[...Array(totalPages)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-300">من {totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 rounded-lg bg-slate-800/50 text-white disabled:opacity-50 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
                >
                  التالي
                </button>
              </div>
            )}

            {/* Results count */}
            {totalCount > 0 && (
              <div className="mt-3 text-center text-slate-400 text-sm">
                إجمالي النتائج: {totalCount}
              </div>
            )}

            {/* عرض رسالة عند عدم وجود نتائج */}
            {filteredInvoices.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-slate-400 text-lg">
                  {searchTerm || dateFilter.startDate || dateFilter.endDate
                    ? "لا توجد فواتير تطابق معايير البحث"
                    : "لا توجد فواتير"}
                </div>
                {(searchTerm || dateFilter.startDate || dateFilter.endDate) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setDateFilter({ startDate: null, endDate: null });
                    }}
                    className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    مسح الفلاتر
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedInvoice && targetStatus && (
          <StatusTransitionModal
            invoice={selectedInvoice}
            onClose={() => {
              setSelectedInvoice(null);
              setTargetStatus(null);
            }}
            targetStatus={targetStatus}
          />
        )}

        {invoiceForBreak && (
          <BreakageConversionModal
            invoice={invoiceForBreak}
            onClose={() => setInvoiceForBreak(null)}
            onConfirm={handleConfirmBreakConversion}
            isProcessing={markAsBreak.isPending}
          />
        )}
      </AnimatePresence>

      {selectedInvoiceForDetail && (
        <InvoiceDetailModal
          invoice={selectedInvoiceForDetail}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedInvoiceForDetail(null);
          }}
        />
      )}
    </div>
  );
};

export default InvoiceManagementPage;
