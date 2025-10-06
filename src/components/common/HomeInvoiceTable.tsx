import { formatSYP } from "@/hooks/invoices/useInvoiceStats";
import { Invoice, InvoiceCategory } from "@/types/invoice.type";
import { formatDate, getCustomerDisplayName } from "@/utils/formatters";
import { motion } from "framer-motion";
import {
  BellDot,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clipboard,
  CreditCard,
  FileText,
  Search,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import InvoicesActionsMenu from "./InvoicesActionsMenu";


const getInvoiceTypeName = (invoice: any): string => {
  // إذا كانت الفاتورة من نوع employee
  if (invoice.invoiceCategory === 'employee') {
    console.log(invoice.employeeInvoiceType)
    switch (invoice.employeeInvoiceType) {
      case 'salary_advance':
        return 'سلفة راتب';
      case 'debt':
        return 'دين موظف';
      case 'returnWithdrawal':
        return 'إرجاع سحب';
      case 'debtPayment':
        return 'تسديد دين';
      default:
        return invoice.employeeInvoiceType || 'فاتورة موظف';
    }
  }
  
  // أنواع الفواتير الأخرى
  switch (invoice.invoiceCategory) {
    case 'products':
      return 'منتجات';
    case 'direct':
      return 'فاتورة مباشرة';
    case 'advance':
      return 'سلفة من زبون';
    case 'debt':
      return 'دين';

    default:
      return invoice.invoiceCategory;
  }
};

interface HomeInvoiceTableProps {
  data: Invoice[];
  onViewDetails: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
}

// Define sort types
type SortField =
  | "invoiceNumber"
  | "createdAt"
  | "invoiceType"
  | "customer"
  | "amount"
  | "paidStatus";
type SortDirection = "asc" | "desc";

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
    const visiblePages = [1, totalPages];

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-1 md:gap-2 mt-4 p-2"
      dir="rtl"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:hover:bg-transparent"
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="flex flex-wrap items-center justify-center gap-1">
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
            <motion.button
              key={number}
              onClick={() => onPageChange(number)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`min-w-[28px] px-2 py-1 rounded-lg text-sm transition-colors ${
                currentPage === number
                  ? "bg-slate-700/50 text-slate-200"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/25"
              }`}
              aria-label={`الصفحة ${number}`}
              aria-current={currentPage === number ? "page" : undefined}
            >
              {number}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:hover:bg-transparent"
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

// Table header component with sort functionality
const SortableHeader: React.FC<{
  field: SortField;
  currentSortField: SortField | null;
  sortDirection: SortDirection;
  onClick: (field: SortField) => void;
  title: string;
  className?: string;
}> = ({
  field,
  currentSortField,
  sortDirection,
  onClick,
  title,
  className,
}) => (
  <th
    className={`p-3 text-slate-300 text-sm cursor-pointer hover:bg-slate-700/20 transition-colors ${
      className || ""
    }`}
    onClick={() => onClick(field)}
  >
    <div className="flex items-center justify-center gap-1">
      {title}
      {currentSortField === field ? (
        sortDirection === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
      ) : (
        <div className="h-4 w-4"></div> // Empty placeholder to maintain alignment
      )}
    </div>
  </th>
);

export const HomeInvoiceTable: React.FC<HomeInvoiceTableProps> = ({
  data,
  onViewDetails,
  onEditInvoice,
  onDeleteInvoice,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const PAGE_SIZE = 10;

  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, searchTerm]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, set to ascending by default
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // البحث الذكي على جميع الحقول
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase().trim();

    return data.filter((invoice) => {
      // البحث في رقم الفاتورة
      const invoiceNumber = invoice.invoiceNumber?.toString().toLowerCase() || "";

      // البحث في اسم العميل
      const customerName = getCustomerDisplayName(
        invoice.customer,
        invoice.notes,
        invoice.relatedEmployee ? `موظف: ${invoice.relatedEmployee.name}` : ""
      ).toLowerCase();

      // البحث في المبلغ
      const amount = invoice.totalAmount?.toString() || "";

      // البحث في الملاحظات
      const notes = invoice.notes?.toLowerCase() || "";

      // البحث في نوع الفاتورة
      const invoiceType = getInvoiceTypeName(invoice).toLowerCase();

      // البحث في حالة الدفع
      const paidStatus = (invoice.paidStatus ? "نقدي مدفوع" : "آجل غير مدفوع").toLowerCase();

      // البحث في نوع الدخل/المصروف
      const type = (invoice.invoiceType === "income" ? "دخل" : "مصروف").toLowerCase();

      // البحث في التاريخ
      const date = formatDate(invoice.createdAt).toLowerCase();

      return (
        invoiceNumber.includes(searchLower) ||
        customerName.includes(searchLower) ||
        amount.includes(searchLower) ||
        notes.includes(searchLower) ||
        invoiceType.includes(searchLower) ||
        paidStatus.includes(searchLower) ||
        type.includes(searchLower) ||
        date.includes(searchLower)
      );
    });
  }, [data, searchTerm]);

  // Apply sorting to filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    let valueA, valueB;

    // Get comparative values based on sort field
    switch (sortField) {
      case "invoiceNumber":
        valueA = a.invoiceNumber;
        valueB = b.invoiceNumber;
        break;
      case "createdAt":
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case "invoiceType":
        valueA = a.invoiceType;
        valueB = b.invoiceType;
        break;
      case "customer":
        valueA = getCustomerDisplayName(
          a.customer,
          a.notes,
          a.relatedEmployee ? `موظف: ${a.relatedEmployee.name}` : ""
        );
        valueB = getCustomerDisplayName(
          b.customer,
          b.notes,
          b.relatedEmployee ? `موظف: ${b.relatedEmployee.name}` : ""
        );
        break;
      case "amount":
        valueA = a.totalAmount;
        valueB = b.totalAmount;
        break;
      case "paidStatus":
        valueA = a.paidStatus ? 1 : 0;
        valueB = b.paidStatus ? 1 : 0;
        break;
      default:
        return 0;
    }

    // String comparison for string values
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Numeric comparison for numbers
    return sortDirection === "asc"
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number);
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Calculate total for filtered data
  const totalAmount = filteredData.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0
  );

  // Helper function to check if invoice has notes
  const hasNotes = (invoice: Invoice) => {
    return invoice.notes && invoice.notes.trim() !== "";
  };

  return (
    <>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="relative" dir="rtl">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في الفواتير (رقم الفاتورة، العميل، المبلغ، الملاحظات...)"
            className="w-full pr-10 pl-10 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="مسح البحث"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-slate-400"
            dir="rtl"
          >
            عرض {filteredData.length} من {data.length} فاتورة
          </motion.div>
        )}
      </motion.div>

      {/* Desktop view - Full table */}
      <div className="hidden md:block overflow-x-auto overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-w-full bg-slate-800/50 rounded-lg border border-slate-700/50"
        >
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-slate-800/50">
              <tr>
                <SortableHeader
                  field="invoiceNumber"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="رقم الفاتورة"
                />
                <SortableHeader
                  field="createdAt"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="التاريخ"
                />
                <SortableHeader
                  field="customer"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="العميل"
                />
                <th className="p-3 text-slate-300 text-sm">نوع الفاتورة</th>
                <SortableHeader
                  field="amount"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="المبلغ"
                />
                <SortableHeader
                  field="paidStatus"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="الحالة"
                />
                <th className="p-3 text-slate-300 text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((invoice) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                  className="border-b border-slate-700/50 hover:bg-slate-700/25 transition-colors"
                >
                  <td className="p-3 text-center text-slate-300 text-sm">
                    <div className="flex items-center">
                      {invoice.invoiceNumber}
                      {hasNotes(invoice) && (
                        <div
                          className="mx-2 text-red-500 "
                          title="يحتوي على ملاحظات"
                        >
                          <BellDot className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center text-slate-300 text-sm">
                    {formatDate(invoice.createdAt)}
                  </td>
                  <td className="p-3 text-center text-slate-300 text-sm">
                    {getCustomerDisplayName(
                      invoice.customer,
                      invoice.notes,
                      invoice.relatedEmployee
                        ? `موظف: ${invoice.relatedEmployee.name}`
                        : ""
                    )}
                  </td>
                  <td className="p-3 text-center text-slate-300 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        invoice.invoiceCategory === InvoiceCategory.PRODUCTS
                          ? "bg-blue-500/10 text-blue-400"
                          : invoice.invoiceCategory === InvoiceCategory.DIRECT
                          ? "bg-green-500/10 text-green-400"
                          : invoice.invoiceCategory === InvoiceCategory.DEBT
                          ? "bg-purple-500/10 text-purple-400"
                          : invoice.invoiceCategory === InvoiceCategory.ADVANCE
                          ? "bg-orange-500/10 text-orange-400"
                          : invoice.invoiceCategory === InvoiceCategory.EMPLOYEE
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {getInvoiceTypeName(invoice)}
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-300 text-sm">
                    {formatSYP(invoice.totalAmount)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        invoice.paidStatus
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {invoice.isBreak
                        ? "كسر"
                        : invoice.paidStatus
                        ? "نقدي"
                        : "آجل"}
                    </span>
                  </td>
                  <td className="p-3  text-center">
                    <InvoicesActionsMenu
                      invoice={invoice}
                      onViewDetails={onViewDetails}
                      onEditInvoice={onEditInvoice}
                      onDeleteInvoice={onDeleteInvoice}
                    />
                  </td>
                </motion.tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="text-slate-400 text-lg">
                      {searchTerm
                        ? "لا توجد فواتير تطابق معايير البحث"
                        : "لا توجد فواتير"}
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        مسح البحث
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
            {filteredData.length > 0 && (
              <motion.tfoot
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800/50"
              >
                <tr>
                  <td colSpan={4} className="p-3 text-slate-300 font-semibold">
                    المجموع
                  </td>
                  <td className="p-3 text-center text-emerald-400 font-semibold">
                    {formatSYP(totalAmount)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </motion.tfoot>
            )}
          </table>
        </motion.div>
      </div>

      {/* Mobile view - Card Grid layout */}
      <div className="md:hidden">
        {paginatedData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-8 text-center"
          >
            <div className="text-slate-400 text-lg">
              {searchTerm
                ? "لا توجد فواتير تطابق معايير البحث"
                : "لا توجد فواتير"}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                مسح البحث
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Mobile sorting options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 mb-3"
            >
              <div className="text-sm text-slate-300 mb-2">ترتيب حسب:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { field: "invoiceNumber", label: "رقم الفاتورة" },
                  { field: "createdAt", label: "التاريخ" },
                  { field: "amount", label: "المبلغ" },
                  { field: "paidStatus", label: "الحالة" },
                ].map((item) => (
                  <button
                    key={item.field}
                    onClick={() => handleSort(item.field as SortField)}
                    className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors
                      ${
                        sortField === item.field
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700/30 text-slate-300"
                      }`}
                  >
                    {item.label}
                    {sortField === item.field &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paginatedData.map((invoice) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 space-y-2 h-full flex flex-col justify-between hover:bg-slate-700/25 transition-colors active:bg-slate-700/40"
                  onClick={() => onViewDetails(invoice)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-slate-300 font-medium flex items-center gap-1">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span>{invoice.invoiceNumber}</span>
                        {hasNotes(invoice) && (
                          <div
                            className="mx-1 text-sky-400"
                            title="يحتوي على ملاحظات"
                          >
                            <Clipboard className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(invoice.createdAt)}</span>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()} className="p-1">
                      <InvoicesActionsMenu
                        invoice={invoice}
                        onViewDetails={onViewDetails}
                        onEditInvoice={onEditInvoice}
                        onDeleteInvoice={onDeleteInvoice}
                      />
                    </div>
                  </div>

                  <div className="py-1">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <User className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">
                        {getCustomerDisplayName(
                          invoice.customer,
                          invoice.notes,
                          invoice.relatedEmployee
                            ? `موظف: ${invoice.relatedEmployee.name}`
                            : ""
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          invoice.invoiceType === "income"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {invoice.invoiceType === "income" ? "دخل" : "مصروف"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          invoice.invoiceCategory === InvoiceCategory.PRODUCTS
                            ? "bg-blue-500/10 text-blue-400"
                            : invoice.invoiceCategory === InvoiceCategory.DIRECT
                            ? "bg-green-500/10 text-green-400"
                            : invoice.invoiceCategory === InvoiceCategory.DEBT
                            ? "bg-purple-500/10 text-purple-400"
                            : invoice.invoiceCategory ===
                              InvoiceCategory.ADVANCE
                            ? "bg-orange-500/10 text-orange-400"
                            : invoice.invoiceCategory ===
                              InvoiceCategory.EMPLOYEE
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {getInvoiceTypeName(invoice)}
                      </span>
                    </div>

                    <div className="flex items-end flex-col">
                      <span className="text-emerald-400 font-medium text-sm">
                        {formatSYP(invoice.totalAmount)}
                      </span>
                      <span
                        className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          invoice.paidStatus
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        <CreditCard className="h-3 w-3 mx-1" />
                        {invoice.paidStatus ? "نقدي" : "آجل"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Total */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 mt-3"
            >
              <div className="flex justify-between items-center">
                <div className="text-slate-300 font-medium">المجموع</div>
                <div className="text-emerald-400 font-semibold">
                  {formatSYP(totalAmount)}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {sortedData.length > PAGE_SIZE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};

export default HomeInvoiceTable;