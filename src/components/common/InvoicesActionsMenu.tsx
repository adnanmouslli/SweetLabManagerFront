import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Edit, Eye, FileText, Trash, DollarSign, FileX, Package, Printer } from "lucide-react";
import { Invoice } from "@/types/invoice.type";
import BreakageConversionModal from "@/components/common/invoices/BreakageConversionModal";
import InvoiceTemplateModal from "@/components/common/InvoiceTemplateModal";
import { useMarkInvoiceAsBreak } from "@/hooks/invoices/useInvoice";
import { useMokkBar } from "@/components/providers/MokkBarContext";
import { useMarkInvoiceAsPaid } from "@/hooks/invoices/useInvoice";
import { apiClient } from "@/utils/axios";

interface InvoicesActionsMenuProps {
  invoice: Invoice;
  onViewDetails: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
}

const InvoicesActionsMenu: React.FC<InvoicesActionsMenuProps> = ({
  invoice,
  onViewDetails,
  onEditInvoice,
  onDeleteInvoice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBreakageModalOpen, setIsBreakageModalOpen] = useState(false);
  const [isInvoiceTemplateOpen, setIsInvoiceTemplateOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const markAsBreak = useMarkInvoiceAsBreak();
  const markAsPaid = useMarkInvoiceAsPaid();
  const { setSnackbarConfig } = useMokkBar();

  // Calculate menu position
  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left - 80,
      });
    }
  };

  // Handle clicks outside the menu to close it and update position on scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateMenuPosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [menuRef, buttonRef, isOpen]);

  const handleActionClick = (action: (invoice: Invoice) => void) => {
    action(invoice);
    setIsOpen(false);
  };

  // Handle marking invoice as paid
  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await markAsPaid.mutateAsync({ id: invoice.id, data: {} });
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم تحويل الفاتورة إلى مدفوع بنجاح",
      });
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "حدث خطأ أثناء تحويل الفاتورة إلى مدفوع",
      });
    }
  };

  // Handle breakage conversion
  const handleConfirmBreakConversion = async (initialPayment: number, notes: string) => {
    try {
      await markAsBreak.mutateAsync({
        id: invoice.id,
        data: {
          initialPayment,
          notes,
        },
      });
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم تحويل الفاتورة إلى فاتورة كسر بنجاح",
      });
      setIsBreakageModalOpen(false);
    } catch (error) {
      console.error("Error converting to breakage:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "حدث خطأ أثناء تحويل الفاتورة إلى فاتورة كسر",
      });
    }
  };

  // Handle print invoice
  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      const response = await apiClient.get(`/reports/invoice-receipt/${invoice.id}`, {
       headers: {
                    'Accept': 'text/html',
                },
      });

      if (!response) {
        throw new Error('Failed to fetch invoice receipt');
      }

      const htmlContent = await response;
      
      // Open in new window and trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent as string);
        printWindow.document.close();
        // The print will be triggered by the window.onload in the HTML
      }

      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم فتح نافذة الطباعة",
      });
    } catch (error) {
      console.error("Error printing invoice:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "حدث خطأ أثناء طباعة الفاتورة",
      });
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-full hover:bg-slate-700/50"
        onClick={() => {
          updateMenuPosition();
          setIsOpen(!isOpen);
        }}
        aria-label="Actions menu"
        aria-expanded={isOpen}
      >
        <Eye className="h-5 w-5" />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 px-1 w-24"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleActionClick(onViewDetails)}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-slate-700/50 w-full justify-start"
            >
              <FileText className="h-4 w-4" />
              عرض
            </button>
            
            {/* Print invoice button */}
            <button
              onClick={() => {
                handlePrintInvoice(invoice);
                setIsOpen(false);
              }}
              className="text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-slate-700/50 w-full justify-start"
            >
              <Printer className="h-4 w-4" />
              طباعة
            </button>

            {/* Show items button only if invoice has items */}
            {invoice.items && invoice.items.length > 0 && (
              <button
                onClick={() => {
                  setIsInvoiceTemplateOpen(true);
                  setIsOpen(false);
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-slate-700/50 w-full justify-start"
              >
                <Package className="h-4 w-4" />
                العناصر
              </button>
            )}
            
            <button
              onClick={() => handleActionClick(onEditInvoice)}
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-slate-700/50 w-full justify-start"
            >
              <Edit className="h-4 w-4" />
              تعديل
            </button>
            

            {!invoice.paidStatus && (
              
                <button
                  onClick={() => {
                    handleMarkAsPaid(invoice);
                    setIsOpen(false);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-slate-700/50 w-full justify-start"
                >
                  <DollarSign className="h-4 w-4" />
                  مدفوع
                </button>
                
            )}


            {/* Show paid/breakage options only for unpaid invoices */}
            {!invoice.paidStatus && !invoice.isBreak && (
              <>
                {invoice.invoiceType === "income" && (
                  <button
                    onClick={() => {
                      setIsBreakageModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-slate-700/50 w-full justify-start"
                  >
                    <FileX className="h-4 w-4" />
                    كسر
                  </button>
                )}
              </>
            )}
            
            {onDeleteInvoice && (
              <button
                onClick={() => handleActionClick(onDeleteInvoice)}
                className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-slate-700/50 w-full justify-start"
              >
                <Trash className="h-4 w-4" />
                حذف
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Breakage Conversion Modal */}
      {isBreakageModalOpen && (
        <BreakageConversionModal
          invoice={invoice}
          onClose={() => setIsBreakageModalOpen(false)}
          onConfirm={handleConfirmBreakConversion}
          isProcessing={markAsBreak.isPending}
        />
      )}

      {/* Invoice Template Modal */}
      {isInvoiceTemplateOpen && (
        <InvoiceTemplateModal
          isOpen={isInvoiceTemplateOpen}
          onClose={() => setIsInvoiceTemplateOpen(false)}
          invoice={invoice}
        />
      )}
    </div>
  );
};

export default InvoicesActionsMenu;