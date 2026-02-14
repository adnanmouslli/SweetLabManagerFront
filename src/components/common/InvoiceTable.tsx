// src/components/common/InvoiceTable.tsx
import { useState, useEffect } from "react";
import { Invoice } from "@/types/invoice.type";
import { formatCurrency, formatDate, getCustomerDisplayName } from "@/utils/formatters";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowDownSquare,
  ArrowUpSquare,
  ChevronDown,
  ChevronUp,
  FileX,
  MoreHorizontal,
  Glasses,
  GlassWater,
  Printer
} from "lucide-react";
import { useMediaQuery } from "@mui/material";
import { Role, useRoles } from "@/hooks/users/useRoles";
import { apiClient } from "@/utils/axios";

interface InvoiceTableProps {
  invoices?: Invoice[];
  invoiceType?: "income" | "expense";
  onViewDetail: (invoice: Invoice) => void;
  onStatusChange: (invoice: Invoice, status: "paid" | "debt") => void;
  onConvertToBreak?: (invoice: Invoice) => void;
}

// Define sort types
type SortField = 'invoiceNumber' | 'createdAt' | 'customerName' | 'customerPhone' | 'type' | 'totalAmount' | 'paidStatus';
type SortDirection = 'asc' | 'desc';

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
        {pageNumbers.map((number) => (
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
        ))}
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

const StatusBadge: React.FC<{ invoice: Invoice }> = ({ invoice }) => (
  <span
    className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${invoice.paidStatus
      ? "bg-success/10 text-success"
      : invoice.invoiceCategory === "debt"
        ? "bg-warning/10 text-warning"
        : "bg-danger/10 text-danger"
      }`}
  >
    {invoice.paidStatus ? (
      <>
        <CheckCircle className="h-3 w-3" />
        <span>مدفوع</span>
      </>
    ) : !invoice.paidStatus && invoice.invoiceCategory === "debt" ? (
      <>
        <Clock className="h-3 w-3" />
        <span>دين</span>
      </>
    ) : invoice.isBreak == true ? (<>
      <GlassWater className="h-3 w-3" />
      <span>كسر</span>
    </>) : (
      <>
        <AlertCircle className="h-3 w-3" />
        <span>غير مدفوع</span>
      </>
    )}
  </span>
);

// Table header component with sort functionality
const SortableHeader: React.FC<{
  field: SortField;
  currentSortField: SortField | null;
  sortDirection: SortDirection;
  onClick: (field: SortField) => void;
  title: string;
  className?: string;
}> = ({ field, currentSortField, sortDirection, onClick, title, className }) => (
  <th
    className={`text-center text-muted-foreground font-medium p-4 cursor-pointer hover:bg-slate-700/20 ${className || ''}`}
    onClick={() => onClick(field)}
  >
    <div className="flex items-center justify-center gap-1">
      {title}
      {currentSortField === field ? (
        sortDirection === 'asc' ? (
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

export const InvoiceTable = ({
  invoices = [],
  invoiceType = "income", // Default to income for backward compatibility
  onViewDetail,
  onConvertToBreak,
  onStatusChange,
}: InvoiceTableProps) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [actionInvoice, setActionInvoice] = useState<Invoice | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { hasAnyRole } = useRoles();

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      const response = await apiClient.get(`/reports/invoice-receipt/${invoice.id}`, {
        headers: { 'Accept': 'text/html' },
      });
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(response as string);
        printWindow.document.close();
      }
    } catch (error) {
      console.error("Error printing invoice:", error);
    }
  };

  // Reset to first page when invoices change
  useEffect(() => {
    setCurrentPage(1);
  }, [invoices.length, invoiceType]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to ascending by default
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting to invoices
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortField) return 0;

    let valueA, valueB;

    // Get comparative values based on sort field
    switch (sortField) {
      case 'invoiceNumber':
        valueA = a.invoiceNumber;
        valueB = b.invoiceNumber;
        break;
      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case 'customerName':
        valueA = a.customer?.name || '';
        valueB = b.customer?.name || '';
        break;
      case 'customerPhone':
        valueA = a.customer?.phone || '';
        valueB = b.customer?.phone || '';
        break;
      case 'type':
        valueA = a.invoiceCategory;
        valueB = b.invoiceCategory;
        break;
      case 'totalAmount':
        valueA = a.totalAmount;
        valueB = b.totalAmount;
        break;
      case 'paidStatus':
        valueA = a.paidStatus ? 1 : 0;
        valueB = b.paidStatus ? 1 : 0;
        break;
      default:
        return 0;
    }

    // String comparison for string values
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Numeric comparison for numbers
    return sortDirection === 'asc'
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number);
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedInvoices.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedInvoices = sortedInvoices.slice(startIndex, endIndex);

  // Get type label and styling based on invoice type and category
  const getTypeLabel = (invoice: Invoice, invoiceType: "income" | "expense") => {
    // If the invoice category is debt, show a specialized label
    if (invoice.invoiceCategory === "debt") {
      return {
        label: invoiceType === "income" ? "تحصيل دين" : "تسجيل دين",
        colorClass: invoiceType === "income"
          ? "text-blue-400 bg-blue-500/10"
          : "text-purple-400 bg-purple-500/10",
        icon: invoiceType === "income" ? ArrowDownSquare : ArrowUpSquare
      };
    }

    // Regular invoice (not debt)
    return {
      label: invoiceType === "income" ? "مبيعات" : "مشتريات",
      colorClass: invoiceType === "income"
        ? "text-emerald-400 bg-emerald-500/10"
        : "text-amber-400 bg-amber-500/10",
      icon: invoiceType === "income" ? ArrowDownSquare : ArrowUpSquare
    };
  };


  const ActionModal = () => {
    if (!actionInvoice) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => setActionInvoice(null)}
      >
        <div
          className="bg-slate-800 border border-slate-700 rounded-lg p-4 w-full max-w-xs"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          <h3 className="text-slate-200 font-medium mb-3 text-sm">اختر إجراء للفاتورة #{actionInvoice.invoiceNumber}</h3>

          <div className="space-y-2">
            <button
              onClick={() => {
                onStatusChange(actionInvoice, "paid");
                setActionInvoice(null);
              }}
              className="flex w-full   items-center gap-2 p-3 rounded-lg text-success bg-emerald-600/10 hover:bg-emerald-600/20 transition-colors text-sm text-right"
            >
              <DollarSign className="h-4 w-4" />
              <span>تحويل لمدفوع</span>
            </button>

            <button
              onClick={() => {
                onStatusChange(actionInvoice, "debt");
                setActionInvoice(null);
              }}
              className="flex w-full   items-center gap-2 p-3 rounded-lg text-warning bg-amber-400/10 hover:bg-amber-400/20 transition-colors text-sm text-right"
            >
              <Clock className="h-4 w-4" />
              <span>تحويل إلى دين</span>
            </button>

            {invoiceType === "income" && onConvertToBreak && !actionInvoice.isBreak && (
            <button
              onClick={() => {
                onConvertToBreak(actionInvoice);
                setActionInvoice(null);
              }}
              className="flex w-full items-center gap-2 p-3 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-sm text-right"
            >
              <FileX className="h-4 w-4" />
              <span>تحويل إلى كسر</span>
            </button>
          )}

            <button
              onClick={() => {
                onViewDetail(actionInvoice);
                setActionInvoice(null);
              }}
              className="flex w-full items-center gap-2 p-3 rounded-lg text-slate-300 bg-slate-700/50 hover:bg-slate-700/70 transition-colors text-sm text-right"
            >
              <Eye className="h-4 w-4" />
              <span>عرض التفاصيل</span>
            </button>

            <button
              onClick={() => {
                handlePrintInvoice(actionInvoice);
                setActionInvoice(null);
              }}
              className="flex w-full items-center gap-2 p-3 rounded-lg text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-sm text-right"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة الفاتورة</span>
            </button>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setActionInvoice(null)}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  };


  const renderMobileView = () => (
    <>
      <div className="space-y-4">
        {paginatedInvoices.map((invoice) => {
          const { label, colorClass, icon: TypeIconDynamic } = getTypeLabel(invoice, invoiceType);

          return (
            <div
              key={invoice.id}
              className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-slate-400">رقم الفاتورة</div>
                  <div className="text-foreground">
                    #{invoice.invoiceNumber}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge invoice={invoice} />
                  <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${colorClass}`}>
                    <TypeIconDynamic className="h-3 w-3" />
                    {label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-slate-400">العميل</div>
                  <div className="text-foreground">
                    {getCustomerDisplayName(invoice.customer, invoice.notes)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">الهاتف</div>
                  <div className="text-foreground">
                    {invoice.customer ? invoice.customer.phone : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">المبلغ</div>
                  <div className="text-foreground">
                    {formatCurrency(invoice.totalAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">التاريخ</div>
                  <div className="text-foreground">
                    {formatDate(invoice.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {!invoice.paidStatus && hasAnyRole([Role.ADMIN]) && (
                  <>
                    <button
                      onClick={() => onStatusChange(invoice, "paid")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm  text-emerald-600 bg-emerald-600/10 hover:bg-emerald-600/20 transition-colors flex-1"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>تحويل لمدفوع</span>
                    </button>
                    <button
                      onClick={() => onStatusChange(invoice, "debt")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm  text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-colors flex-1"
                    >
                      <Clock className="h-4 w-4" />
                      <span>تحويل إلى دين</span>
                    </button>
                    {/* Add breakage conversion button only for income invoices */}
                    {invoiceType === "income" && onConvertToBreak && (
                      <button
                        onClick={() => onConvertToBreak(invoice)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex-1"
                      >
                        <FileX className="h-4 w-4" />
                        <span>تحويل إلى كسر</span>
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => onViewDetail(invoice)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-700/25 text-slate-300 hover:bg-slate-700/50 transition-colors flex-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>عرض التفاصيل</span>
                </button>
                <button
                  onClick={() => handlePrintInvoice(invoice)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors flex-1"
                >
                  <Printer className="h-4 w-4" />
                  <span>طباعة</span>
                </button>
              </div>
            </div>
          );
        })}
        {invoices.length === 0 && (
          <div className="text-center p-8 text-slate-400 bg-slate-800/50 rounded-lg">
            لا توجد فواتير متطابقة مع معايير البحث
          </div>
        )}
      </div>
      {invoices.length > PAGE_SIZE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );

  const renderDesktopView = () => (
    <>
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead>
              <tr className="border-b border-slate-700/50">
                <SortableHeader
                  field="invoiceNumber"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="رقم الفاتورة"
                  className="w-24"
                />
                <SortableHeader
                  field="createdAt"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="التاريخ"
                />
                <SortableHeader
                  field="customerName"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="العميل"
                />
                <SortableHeader
                  field="customerPhone"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="الهاتف"
                  className="w-28"
                />
                <SortableHeader
                  field="type"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="النوع"
                  className="w-28"
                />
                <SortableHeader
                  field="totalAmount"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="المبلغ"
                  className="w-28"
                />
                <SortableHeader
                  field="paidStatus"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onClick={handleSort}
                  title="الحالة"
                  className="w-32"
                />
                <th className="text-center text-muted-foreground font-medium p-4 w-52">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {paginatedInvoices.map((invoice) => {
                const { label, colorClass, icon: TypeIconDynamic } = getTypeLabel(invoice, invoiceType);

                return (
                  <tr
                    key={invoice.id}
                    className="hover:bg-slate-700/25 transition-colors"
                  >
                    <td className="p-4 text-foreground text-center">
                      #{invoice.invoiceNumber}
                    </td>
                    <td className="p-4 text-foreground text-center">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="p-4 text-foreground text-center">
                      {getCustomerDisplayName(invoice.customer, invoice.notes)}
                    </td>
                    <td className="p-4 text-foreground text-center">
                      {invoice.customer ? invoice.customer.phone : "-"}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs flex items-center justify-center gap-1 ${colorClass} inline-flex mx-auto`}>
                        <TypeIconDynamic className="h-3 w-3" />
                        {label}
                      </span>
                    </td>
                    <td className="p-4 text-foreground text-center">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <StatusBadge invoice={invoice} />
                      </div>
                    </td>




                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!invoice.paidStatus && hasAnyRole([Role.ADMIN]) ? (
                          <button
                            onClick={() => setActionInvoice(invoice)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-700/50 text-slate-200 hover:bg-slate-700/70 transition-colors"
                          >
                            <span>إجراءات</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewDetail(invoice)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-700/50 text-slate-200 hover:bg-slate-700/70 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>عرض التفاصيل</span>
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="طباعة الفاتورة"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>







                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد فواتير متطابقة مع معايير البحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {invoices.length > PAGE_SIZE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );

  return (
    <>
      {actionInvoice && <ActionModal />}
      {isMobile ? renderMobileView() : renderDesktopView()}
    </>
  );
};

export default InvoiceTable;