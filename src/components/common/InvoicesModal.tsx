import { motion } from "framer-motion";
import {
  X,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  BellDot
} from "lucide-react";
import { formatDate, getCustomerDisplayName } from "@/utils/formatters";
import { ShiftsInvoices } from "@/types/shifts.type";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { InvoiceDetailsModal } from "@/components/common/InvoiceDetailsModal";
import EditInvoiceModal from "@/components/common/EditInvoiceModal";
import DeleteConfirmationModal from "@/components/common/invoices/DeleteConfirmationModal";
import { useDeleteInvoice } from "@/hooks/invoices/useInvoice";
import { useMokkBar } from "../providers/MokkBarContext";

interface InvoicesModalProps {
  type: "boothInvoices" | "universityInvoices" | "generalInvoices";
  data: ShiftsInvoices | undefined;
  onClose: () => void;
}

// Dropdown menu for actions
const ActionsMenu = ({
  invoice,
  onView,
  onEdit,
  onDelete
}: {
  invoice: any,
  onView: (invoice: any) => void,
  onEdit: (invoice: any) => void,
  onDelete: (invoice: any) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-md hover:bg-white/10 transition-colors"
      >
        <MoreVertical className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-1 bg-slate-700 border border-white/10 rounded-md shadow-lg p-1 min-w-32">
          <button
            onClick={() => {
              onView(invoice);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors text-right"
          >
            <Eye className="h-4 w-4" />
            <span>عرض التفاصيل</span>
          </button>

          <button
            onClick={() => {
              onEdit(invoice);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors text-right"
          >
            <Edit className="h-4 w-4" />
            <span>تعديل</span>
          </button>

          <button
            onClick={() => {
              onDelete(invoice);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors text-right text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            <span>حذف</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Pagination Controls Component
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show a limited range of page numbers on mobile
  const showPageNumbers = () => {
    // If 7 or fewer pages, show all
    if (totalPages <= 7) return pageNumbers;

    // Always show first, last, current, and pages immediately around current
    let visiblePages = [1, totalPages];

    // Pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      visiblePages.push(i);
    }

    // Add ellipsis indicators
    if (currentPage - 1 > 2) visiblePages.push(-1); // -1 as a flag for left ellipsis
    if (currentPage + 1 < totalPages - 1) visiblePages.push(-2); // -2 as a flag for right ellipsis

    return visiblePages.sort((a, b) => a - b);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4 p-2" dir="rtl">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1">
        {showPageNumbers().map((number, index) => {
          if (number === -1) {
            return <span key={`ellipsis-left-${index}`} className="text-slate-400">...</span>;
          }
          if (number === -2) {
            return <span key={`ellipsis-right-${index}`} className="text-slate-400">...</span>;
          }

          return (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentPage === number
                ? "bg-slate-700/50 text-slate-200"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/25"
                }`}
            >
              {number}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
};

// Column header for sorting
type SortField = 'id' | 'customerName' | 'createdAt' | 'totalAmount' | 'paidStatus' | 'invoiceType';
type SortDirection = 'asc' | 'desc';

const SortableHeader = ({
  field,
  title,
  currentSort,
  setSort
}: {
  field: SortField,
  title: string,
  currentSort: { field: SortField | null, direction: SortDirection },
  setSort: (field: SortField) => void
}) => {
  const isActive = currentSort.field === field;

  return (
    <th
      onClick={() => setSort(field)}
      className="py-3 px-4 text-right text-gray-400 font-medium cursor-pointer hover:bg-white/10 transition-colors group"
    >
      <div className="flex items-center justify-end gap-2">
        {title}
        <div className="flex flex-col h-4 w-4 justify-center items-center">
          {isActive ? (
            currentSort.direction === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-blue-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-400" />
            )
          ) : (
            <ChevronUp className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-30" />
          )}
        </div>
      </div>
    </th>
  );
};

const InvoicesModal = ({
  type,
  data,
  onClose
}: InvoicesModalProps) => {
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "income" | "expense">("all");
  const [sort, setSort] = useState<{ field: SortField | null, direction: SortDirection }>({
    field: null,
    direction: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const PAGE_SIZE = 10;
  const { setSnackbarConfig } = useMokkBar()
  // State for modal actions
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<any | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<any | null>(null);
  const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [invoiceFilter]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      // Toggle direction if same field
      setSort({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // New field, default to ascending
      setSort({
        field,
        direction: 'asc'
      });
    }
  };

  // Action handlers
  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoiceForView(invoice);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoiceForEdit(invoice);
  };

  const handleDeleteInvoice = (invoice: any) => {
    setSelectedInvoiceForDelete(invoice);
  };
  const deleteInvoice = useDeleteInvoice({
    onSuccess: () => {
      setSelectedInvoiceForDelete(null);
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
    if (selectedInvoiceForDelete) {
      await deleteInvoice.mutateAsync(selectedInvoiceForDelete.id);
    }
  };


  const getTitle = () => {
    switch (type) {
      case "boothInvoices":
        return "فواتير البسطة";
      case "universityInvoices":
        return "فواتير الجامعة";
      case "generalInvoices":
        return "الفواتير العامة";
    }
  };

  const getInvoices = () => {
    if (!data) return [];
    let invoices;

    switch (type) {
      case "boothInvoices":
        invoices = data.boothInvoices;
        break;
      case "universityInvoices":
        invoices = data.universityInvoices;
        break;
      case "generalInvoices":
        invoices = data.generalInvoices;
        break;
    }

    // Filter invoices based on the selected filter
    if (invoiceFilter === "income") {
      return invoices.filter(invoice => invoice.invoiceType === "income");
    } else if (invoiceFilter === "expense") {
      return invoices.filter(invoice => invoice.invoiceType === "expense");
    }

    return invoices;
  };

  // Get and sort invoices
  const sortInvoices = (invoices: any[]) => {
    if (!sort.field) return invoices;

    return [...invoices].sort((a, b) => {
      let valueA, valueB;

      switch (sort.field) {
        case 'id':
          valueA = a.id;
          valueB = b.id;
          break;
        case 'customerName':
          valueA = a.customer?.name || '';
          valueB = b.customer?.name || '';
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'totalAmount':
          valueA = a.totalAmount;
          valueB = b.totalAmount;
          break;
        case 'paidStatus':
          valueA = a.paidStatus ? 1 : 0;
          valueB = b.paidStatus ? 1 : 0;
          break;
        case 'invoiceType':
          valueA = a.invoiceType;
          valueB = b.invoiceType;
          break;
        default:
          return 0;
      }

      // Compare values based on direction
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sort.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sort.direction === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  };

  const filteredInvoices = getInvoices();
  const sortedInvoices = sortInvoices(filteredInvoices);

  // Calculate pagination
  const totalPages = Math.ceil(sortedInvoices.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedInvoices = sortedInvoices.slice(startIndex, endIndex);

  // Calculate totals for each type
  const allInvoices = getInvoices();
  const incomeInvoices = allInvoices.filter(invoice => invoice.invoiceType === "income");
  const expenseInvoices = allInvoices.filter(invoice => invoice.invoiceType === "expense");

  const incomeTotal = incomeInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const expenseTotal = expenseInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const netTotal = incomeTotal - expenseTotal;

  // Helper function to check if invoice has notes
  const hasNotes = (invoice: any) => {
    return invoice.notes && invoice.notes.trim() !== '';
  };

  // Mobile sorting options component
  const MobileSortOptions = () => (
    <div className="p-3 mb-3 border-b border-white/10">
      <div className="text-sm text-gray-400 mb-2">ترتيب حسب:</div>
      <div className="flex flex-wrap gap-2">
        {[
          { field: 'id', label: 'رقم الفاتورة' },
          { field: 'createdAt', label: 'التاريخ' },
          { field: 'customerName', label: 'العميل' },
          { field: 'totalAmount', label: 'المبلغ' },
          { field: 'paidStatus', label: 'الحالة' }
        ].map((item) => (
          <button
            key={item.field}
            onClick={() => handleSort(item.field as SortField)}
            className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors
              ${sort.field === item.field
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-white/5 text-gray-300"
              }`}
          >
            {item.label}
            {sort.field === item.field && (
              sort.direction === 'asc'
                ? <ChevronUp className="h-3 w-3" />
                : <ChevronDown className="h-3 w-3" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-800 border border-white/10 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          dir="rtl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-white">{getTitle()}</h2>
            </div>
            <div className="text-gray-400">
              عدد الفواتير: {filteredInvoices.length} | الإجمالي: {netTotal > 0 ? '+' : ''}{netTotal.toLocaleString()}{" "}
              ليرة
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="px-6 pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="bg-slate-700/50 p-1 rounded-lg flex text-sm">
              <button
                onClick={() => setInvoiceFilter("all")}
                className={`px-4 py-2 rounded-md transition-colors ${invoiceFilter === "all"
                  ? "bg-indigo-500 text-white"
                  : "text-gray-300 hover:bg-slate-700"
                  }`}
              >
                جميع الفواتير ({allInvoices.length})
              </button>
              <button
                onClick={() => setInvoiceFilter("income")}
                className={`px-4 py-2 rounded-md transition-colors ${invoiceFilter === "income"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-300 hover:bg-slate-700"
                  }`}
              >
                الدخل ({incomeInvoices.length})
              </button>
              <button
                onClick={() => setInvoiceFilter("expense")}
                className={`px-4 py-2 rounded-md transition-colors ${invoiceFilter === "expense"
                  ? "bg-red-500 text-white"
                  : "text-gray-300 hover:bg-slate-700"
                  }`}
              >
                الصرف ({expenseInvoices.length})
              </button>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                الدخل: {incomeTotal.toLocaleString()} ليرة
              </div>
              <div className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400">
                الصرف: {expenseTotal.toLocaleString()} ليرة
              </div>
              <div className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                الصافي: {netTotal > 0 ? '+' : ''}{netTotal.toLocaleString()} ليرة
              </div>
            </div>
          </div>

          {/* Content - Made scrollable */}
          <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                لا توجد فواتير لعرضها
              </div>
            ) : (
              <>
                {isMobile && <MobileSortOptions />}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-white/10 bg-slate-800">
                        <SortableHeader
                          field="id"
                          title="رقم الفاتورة"
                          currentSort={sort}
                          setSort={handleSort}
                        />
                        <SortableHeader
                          field="customerName"
                          title="اسم العميل"
                          currentSort={sort}
                          setSort={handleSort}
                        />
                        <SortableHeader
                          field="createdAt"
                          title="التاريخ"
                          currentSort={sort}
                          setSort={handleSort}
                        />
                        <SortableHeader
                          field="totalAmount"
                          title="المبلغ"
                          currentSort={sort}
                          setSort={handleSort}
                        />
                        <th className="py-3 px-4 text-right text-gray-400 font-medium">
                          التفاصيل
                        </th>
                        <SortableHeader
                          field="paidStatus"
                          title="طريقة الدفع"
                          currentSort={sort}
                          setSort={handleSort}
                        />
                        <SortableHeader
                          field="invoiceType"
                          title="النوع"
                          currentSort={sort}
                          setSort={handleSort}
                        />
                        <th className="py-3 px-4 text-right text-gray-400 font-medium">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInvoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className={`border-b border-white/5 hover:bg-white/5 transition-colors ${invoice.invoiceType === "expense"
                            ? "bg-red-500/5"
                            : "bg-emerald-500/5"
                            }`}
                        >
                          <td className="py-3 px-4 text-white">
                            <div className="flex items-center">
                              #{invoice.id}
                              {hasNotes(invoice) && (
                                <div className="mx-2 text-red-500" title="يحتوي على ملاحظات">
                                  <BellDot className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-white">
                            {getCustomerDisplayName(invoice.customer, invoice.notes)}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {formatDate(invoice.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {invoice.totalAmount.toLocaleString()} ليرة
                          </td>
                          <td className="py-3 px-4 text-white max-w-40 truncate" title={invoice.notes || ''}>
                            {invoice.notes || "-"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`
                                px-3 py-1 rounded-full text-sm font-medium
                                ${invoice.paidStatus
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                                }
                              `}
                            >
                              {invoice.paidStatus ? "مدفوع" : "غير مدفوع"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`
                                px-3 py-1 rounded-full text-sm font-medium
                                ${invoice.invoiceType === "expense"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-emerald-500/10 text-emerald-400"
                                }
                              `}
                            >
                              {invoice.invoiceType === "expense" ? "صرف" : "دخل"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <ActionsMenu
                              invoice={invoice}
                              onView={handleViewInvoice}
                              onEdit={handleEditInvoice}
                              onDelete={handleDeleteInvoice}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Action Modals */}
      <AnimatePresence>
        {selectedInvoiceForView && (
          <InvoiceDetailsModal
            invoice={selectedInvoiceForView}
            onClose={() => setSelectedInvoiceForView(null)}
          />
        )}

        {selectedInvoiceForEdit && (
          <EditInvoiceModal
            invoice={selectedInvoiceForEdit}
            onClose={() => setSelectedInvoiceForEdit(null)}
          />
        )}

        {selectedInvoiceForDelete && (
          <DeleteConfirmationModal
            invoice={selectedInvoiceForDelete}
            isDeleting={isDeleting}
            onConfirm={handleConfirmDelete}
            onCancel={() => setSelectedInvoiceForDelete(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InvoicesModal;