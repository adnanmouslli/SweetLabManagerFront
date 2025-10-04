"use client";
import InvoiceDetailModal from "@/components/common/InvoiceDetailModal";
import { InvoiceFilters } from "@/components/common/InvoiceFilters";
import { InvoiceTable } from "@/components/common/InvoiceTable";
import { InvoiceStatus, InvoiceTabs } from "@/components/common/InvoiceTabs";
import Navbar from "@/components/common/Navbar";
import PageSpinner from "@/components/common/PageSpinner";
import SplineBackground from "@/components/common/SplineBackground";
import { StatusSummary } from "@/components/common/StatusSummary";
import StatusTransitionModal from "@/components/common/StatusTransitionModal";
import { useInvoices, useMarkInvoiceAsBreak } from "@/hooks/invoices/useInvoice";
import { useInvoiceFilters } from "@/hooks/invoices/useInvoiceFilter";
import { Invoice } from "@/types/invoice.type";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import BreakageConversionModal from "@/components/common/invoices/BreakageConversionModal";
import { useMokkBar } from "@/components/providers/MokkBarContext";

const InvoiceManagementPage = () => {
  const [invoiceType, setInvoiceType] = useState<"income" | "expense">("income");
  const { setSnackbarConfig } = useMokkBar();
  
  const [activeStatus, setActiveStatus] = useState<InvoiceStatus | "all">("paid");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  // Fetch invoices based on active status
  const {
    data: invoices,
    isLoading,
    isError,
    error,
  } = useInvoices(activeStatus);
  
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

  // البحث والفلترة الذكية
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];

    let filtered = invoices;

    // 1. تطبيق فلتر نوع الفاتورة (دخل/صرف)
    filtered = filtered.filter(invoice => invoice.invoiceType === invoiceType);

    // 2. تطبيق البحث الذكي على جميع الحقول
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(invoice => {
        // البحث في رقم الفاتورة
        const invoiceNumber = invoice.invoiceNumber?.toString().toLowerCase() || "";
        
        // البحث في اسم العميل/المورد
        const clientName = invoice.customer?.name?.toLowerCase() || "";
        
        // البحث في المبلغ
        const amount = invoice.totalAmount?.toString() || "";
                
        // البحث في تفاصيل العناصر
        const itemsText = invoice.items?.map(item => 
          `${item.item.name} || ""}`.toLowerCase()
        ).join(" ") || "";

        // البحث في رقم الهاتف
        const phone = invoice.customer?.phone?.toLowerCase() || "";

  
        return (
          invoiceNumber.includes(searchLower) ||
          clientName.includes(searchLower) ||
          amount.includes(searchLower) ||
          itemsText.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });
    }

    // 3. تطبيق فلتر التاريخ
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        
        if (dateFilter.startDate && dateFilter.endDate) {
          return invoiceDate >= dateFilter.startDate && 
                 invoiceDate <= dateFilter.endDate;
        } else if (dateFilter.startDate) {
          return invoiceDate >= dateFilter.startDate;
        } else if (dateFilter.endDate) {
          return invoiceDate <= dateFilter.endDate;
        }
        
        return true;
      });
    }

    return filtered;
  }, [invoices, invoiceType, searchTerm, dateFilter]);

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
                  ({filteredInvoices.length} فاتورة)
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