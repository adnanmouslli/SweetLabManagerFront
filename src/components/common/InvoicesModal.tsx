import React from "react";
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
  BellDot,
  Package,
  Plus,
  Minus,
  Search,
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
  onDelete,
}: {
  invoice: any;
  onView: (invoice: any) => void;
  onEdit: (invoice: any) => void;
  onDelete: (invoice: any) => void;
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded-md transition-colors text-right"
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
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
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
            return (
              <span key={`ellipsis-left-${index}`} className="text-slate-400">
                ...
              </span>
            );
          }
          if (number === -2) {
            return (
              <span key={`ellipsis-right-${index}`} className="text-slate-400">
                ...
              </span>
            );
          }

          return (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                currentPage === number
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
type SortField =
  | "id"
  | "customerName"
  | "createdAt"
  | "totalAmount"
  | "paidStatus"
  | "invoiceType";
type SortDirection = "asc" | "desc";

const SortableHeader = ({
  field,
  title,
  currentSort,
  setSort,
}: {
  field: SortField;
  title: string;
  currentSort: { field: SortField | null; direction: SortDirection };
  setSort: (field: SortField) => void;
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
            currentSort.direction === "asc" ? (
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

// Component to display invoice items
const InvoiceItemsRow = ({
  invoice,
  isExpanded,
}: {
  invoice: any;
  isExpanded: boolean;
}) => {
  // Check if invoice has items
  const hasItems = (invoice: any) => {
    return invoice.items && invoice.items.length > 0;
  };

  if (!isExpanded || !hasItems(invoice)) return null;

  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-700/30 border-b border-white/5"
    >
      <td colSpan={8} className="p-0">
        <div className="p-4 bg-slate-700/20">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              أصناف الفاتورة
            </span>
            <span className="text-xs text-gray-400">
              ({invoice.items.length} صنف)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">
                    المنتج
                  </th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">
                    الكمية
                  </th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">
                    سعر الوحدة
                  </th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">
                    الوحدة
                  </th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">
                    المجموع الفرعي
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, index: number) => {
                  console.log("item => ", item);

                  return (
                    <tr
                      key={item.id || index}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-2 px-3 text-white">{item.title}</td>
                      <td className="py-2 px-3 text-white">{item.quantity}</td>
                      <td className="py-2 px-3 text-white">
                        {item.unitPrice.toLocaleString()} ليرة
                      </td>
                      <td className="py-2 px-3 text-white">
                        {item.unit || "-"}
                      </td>
                      <td className="py-2 px-3 text-white font-medium">
                        {item.subTotal.toLocaleString()} ليرة
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 bg-slate-600/20">
                  <td
                    colSpan={4}
                    className="py-2 px-3 text-right text-gray-300 font-medium"
                  >
                    المجموع الكلي:
                  </td>
                  <td className="py-2 px-3 text-white font-bold">
                    {invoice.totalAmount.toLocaleString()} ليرة
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </td>
    </motion.tr>
  );
};

const InvoicesModal = ({ type, data, onClose }: InvoicesModalProps) => {
  const [invoiceFilter, setInvoiceFilter] = useState<
    "all" | "income" | "expense"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );
  const [sort, setSort] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({
    field: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const PAGE_SIZE = 10;
  const { setSnackbarConfig } = useMokkBar();
  // State for modal actions
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<
    any | null
  >(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<
    any | null
  >(null);
  const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState<
    any | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
const [searchQuery, setSearchQuery] = useState("");

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [invoiceFilter, paymentFilter, searchQuery]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      // Toggle direction if same field
      setSort({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      // New field, default to ascending
      setSort({
        field,
        direction: "asc",
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

  // Handle row expansion
  const toggleRowExpansion = (invoiceId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  // Check if invoice has items
  const hasItems = (invoice: any) => {
    return invoice.items && invoice.items.length > 0;
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

    // Filter invoices based on the selected filters
    let filteredInvoices = invoices;

    // Apply invoice type filter
    if (invoiceFilter === "income") {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => invoice.invoiceType === "income"
      );
    } else if (invoiceFilter === "expense") {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => invoice.invoiceType === "expense"
      );
    }

   // Apply payment status filter
if (paymentFilter === "paid") {
  filteredInvoices = filteredInvoices.filter(
    (invoice) => invoice.paidStatus === true
  );
} else if (paymentFilter === "unpaid") {
  filteredInvoices = filteredInvoices.filter(
    (invoice) => invoice.paidStatus === false
  );
}

// Apply search filter
if (searchQuery.trim()) {
  const query = searchQuery.toLowerCase().trim();
  filteredInvoices = filteredInvoices.filter((invoice) => {
    const invoiceId = invoice.id.toString();
    const customerName = invoice.customer?.name?.toLowerCase() || "";
    const notes = invoice.notes?.toLowerCase() || "";
    
    return (
      invoiceId.includes(query) ||
      customerName.includes(query) ||
      notes.includes(query)
    );
  });
}

return filteredInvoices;

  };

  // Get and sort invoices
  const sortInvoices = (invoices: any[]) => {
    if (!sort.field) return invoices;

    return [...invoices].sort((a, b) => {
      let valueA, valueB;

      switch (sort.field) {
        case "id":
          valueA = a.id;
          valueB = b.id;
          break;
        case "customerName":
          valueA = a.customer?.name || "";
          valueB = b.customer?.name || "";
          break;
        case "createdAt":
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case "totalAmount":
          valueA = a.totalAmount;
          valueB = b.totalAmount;
          break;
        case "paidStatus":
          valueA = a.paidStatus ? 1 : 0;
          valueB = b.paidStatus ? 1 : 0;
          break;
        case "invoiceType":
          valueA = a.invoiceType;
          valueB = b.invoiceType;
          break;
        default:
          return 0;
      }

      // Compare values based on direction
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sort.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sort.direction === "asc"
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

  // Get base invoices for calculations (without payment filter)
  const getBaseInvoices = () => {
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

    // Only apply invoice type filter for totals
    if (invoiceFilter === "income") {
      return invoices.filter((invoice) => invoice.invoiceType === "income");
    } else if (invoiceFilter === "expense") {
      return invoices.filter((invoice) => invoice.invoiceType === "expense");
    }

    return invoices;
  };

  // Calculate totals for each type
  const allInvoices = getBaseInvoices();
  const incomeInvoices = allInvoices.filter(
    (invoice) => invoice.invoiceType === "income"
  );
  const expenseInvoices = allInvoices.filter(
    (invoice) => invoice.invoiceType === "expense"
  );

  // Calculate payment status counts
  const paidInvoices = allInvoices.filter(
    (invoice) => invoice.paidStatus === true
  );
  const unpaidInvoices = allInvoices.filter(
    (invoice) => invoice.paidStatus === false
  );

  const incomeTotal = incomeInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );
  const expenseTotal = expenseInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );
  const netTotal = incomeTotal - expenseTotal;

  // Helper function to check if invoice has notes
  const hasNotes = (invoice: any) => {
    return invoice.notes && invoice.notes.trim() !== "";
  };

  // Mobile sorting options component
  const MobileSortOptions = () => (
    <div className="p-3 mb-3 border-b border-white/10">
      <div className="text-sm text-gray-400 mb-2">ترتيب حسب:</div>
      <div className="flex flex-wrap gap-2">
        {[
          { field: "id", label: "رقم الفاتورة" },
          { field: "createdAt", label: "التاريخ" },
          { field: "customerName", label: "العميل" },
          { field: "totalAmount", label: "المبلغ" },
          { field: "paidStatus", label: "الحالة" },
        ].map((item) => (
          <button
            key={item.field}
            onClick={() => handleSort(item.field as SortField)}
            className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors
              ${
                sort.field === item.field
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-white/5 text-gray-300"
              }`}
          >
            {item.label}
            {sort.field === item.field &&
              (sort.direction === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              ))}
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
              عدد الفواتير: {filteredInvoices.length} | الإجمالي:{" "}
              {netTotal > 0 ? "+" : ""}
              {netTotal.toLocaleString()} ليرة
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="px-6 pt-4 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث برقم الفاتورة، اسم العميل، أو الملاحظات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
    
              {/* Invoice Type Filter */}
              <div className="bg-slate-700/50 p-1 rounded-lg flex">
                <button
                  onClick={() => setInvoiceFilter("all")}
                  className={`px-3 py-1 rounded-md transition-colors text-xs ${
                    invoiceFilter === "all"
                      ? "bg-indigo-500 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  الكل ({allInvoices.length})
                </button>
                <button
                  onClick={() => setInvoiceFilter("income")}
                  className={`px-3 py-1 rounded-md transition-colors text-xs ${
                    invoiceFilter === "income"
                      ? "bg-emerald-500 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  الدخل ({incomeInvoices.length})
                </button>
                <button
                  onClick={() => setInvoiceFilter("expense")}
                  className={`px-3 py-1 rounded-md transition-colors text-xs ${
                    invoiceFilter === "expense"
                      ? "bg-red-500 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  الصرف ({expenseInvoices.length})
                </button>
              </div>

              {/* Payment Status Filter */}
              <div className="bg-slate-700/50 p-1 rounded-lg flex">
                <button
                  onClick={() => setPaymentFilter("all")}
                  className={`px-3 py-1 rounded-md transition-colors text-xs ${
                    paymentFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setPaymentFilter("paid")}
                  className={`px-3 py-1 rounded-md transition-colors text-xs ${
                    paymentFilter === "paid"
                      ? "bg-green-500 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  مدفوع ({paidInvoices.length})
                </button>
                <button
                  onClick={() => setPaymentFilter("unpaid")}
                  className={`px-3 py-1 rounded-md transition-colors text-xs ${
                    paymentFilter === "unpaid"
                      ? "bg-orange-500 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  غير مدفوع ({unpaidInvoices.length})
                </button>
              </div>

              {/* Financial Totals */}
              <div className="flex gap-2 text-xs">
                <span className="text-emerald-400">
                  الدخل: {incomeTotal.toLocaleString()}
                </span>
                <span className="text-red-400">
                  الصرف: {expenseTotal.toLocaleString()}
                </span>
                <span className="text-indigo-400 font-medium">
                  الصافي: {netTotal > 0 ? "+" : ""}
                  {netTotal.toLocaleString()}
                </span>
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
                      {paginatedInvoices.map((invoice) => {
                        const isExpanded = expandedRows.has(invoice.id);
                        const hasInvoiceItems = hasItems(invoice);

                        return (
                          <React.Fragment key={invoice.id}>
                            <tr
                              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                                invoice.invoiceType === "expense"
                                  ? "bg-red-500/5"
                                  : "bg-emerald-500/5"
                              }`}
                            >
                              <td className="py-3 px-4 text-white">
                                <div className="flex items-center gap-2">
                                  {hasInvoiceItems && (
                                    <button
                                      onClick={() =>
                                        toggleRowExpansion(invoice.id)
                                      }
                                      className="p-1 rounded hover:bg-white/10 transition-colors"
                                      title={
                                        isExpanded
                                          ? "إخفاء الأصناف"
                                          : "عرض الأصناف"
                                      }
                                    >
                                      {isExpanded ? (
                                        <Minus className="h-4 w-4 text-blue-400" />
                                      ) : (
                                        <Plus className="h-4 w-4 text-blue-400" />
                                      )}
                                    </button>
                                  )}
                                  <div className="flex items-center">
                                    #{invoice.id}
                                    {hasNotes(invoice) && (
                                      <div
                                        className="mx-2 text-red-500"
                                        title="يحتوي على ملاحظات"
                                      >
                                        <BellDot className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-white">
                                {getCustomerDisplayName(
                                  invoice.customer,
                                  invoice.notes
                                )}
                              </td>
                              <td className="py-3 px-4 text-white">
                                {formatDate(invoice.createdAt)}
                              </td>
                              <td className="py-3 px-4 text-white">
                                {invoice.totalAmount.toLocaleString()} ليرة
                              </td>
                              <td
                                className="py-3 px-4 text-white max-w-40 truncate"
                                title={invoice.notes || ""}
                              >
                                {invoice.notes || "-"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`
                                    px-3 py-1 rounded-full text-sm font-medium
                                    ${
                                      invoice.paidStatus
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
                                    ${
                                      invoice.invoiceType === "expense"
                                        ? "bg-red-500/10 text-red-400"
                                        : "bg-emerald-500/10 text-emerald-400"
                                    }
                                  `}
                                >
                                  {invoice.invoiceType === "expense"
                                    ? "صرف"
                                    : "دخل"}
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

                            {/* Expandable items row */}
                            <InvoiceItemsRow
                              invoice={invoice}
                              isExpanded={isExpanded}
                            />
                          </React.Fragment>
                        );
                      })}
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
