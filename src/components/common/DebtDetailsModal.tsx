import { useApplyDiscount } from "@/hooks/debts/useDebts";
import { Debt } from "@/types/debts.type";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  AlertCircle,
  CalendarDays,
  Check,
  PercentCircle,
  Receipt,
  Tag,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// Types
interface DebtDetailsModalProps {
  debt: Debt | null;
  isOpen: boolean;
  onClose: () => void;
}

const DebtDetailsModal: React.FC<DebtDetailsModalProps> = ({
  debt,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [discountAmount, setDiscountAmount] = useState<string>("");
  const [discountReason, setDiscountReason] = useState<string>("");
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Get the apply discount mutation
  const applyDiscount = useApplyDiscount();

  useEffect(() => {
    // Reset form when modal opens or debt changes
    if (isOpen && debt) {
      setDiscountAmount("");
      setDiscountReason("");
      setDiscountError(null);
      setActiveTab("details");
    }
  }, [isOpen, debt]);

  const handleApplyDiscount = () => {
    if (!debt) return;

    setDiscountError(null);

    const amount = parseFloat(discountAmount);
    if (isNaN(amount) || amount <= 0) {
      setDiscountError("يرجى إدخال قيمة خصم صالحة");
      return;
    }

    if (amount >= debt.remainingAmount) {
      setDiscountError("قيمة الخصم يجب أن تكون أقل من المبلغ المتبقي");
      return;
    }

    applyDiscount.mutate(
      {
        debtId: debt.id,
        data: {
          discountAmount: amount,
          notes: discountReason,
        },
      },
      {
        onSuccess: () => {
          setActiveTab("details");
          setDiscountAmount("");
          setDiscountReason("");
        },
        onError: (error) => {
          setDiscountError(
            "حدث خطأ أثناء تطبيق الخصم. يرجى المحاولة مرة أخرى."
          );
          console.error("Discount application error:", error);
        },
      }
    );
  };

  if (!debt) return null;

  // Check for existing discount information
  const hasDiscount = debt.discount > 0;

  // Calculate amounts
  const totalPaid = debt.totalAmount - debt.remainingAmount;
  const discountedAmount = debt.discount || 0;

  // Generate tabs
  const tabs = [
    { id: "details", label: "التفاصيل" },
    { id: "invoices", label: "الفواتير المرتبطة" },
    ...(debt.status === "active"
      ? [{ id: "discount", label: "إضافة خصم" }]
      : []),
  ];

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "rgb(30 41 59)",
            border: "1px solid rgb(51 65 85)",
            borderRadius: "0.75rem",
            maxWidth: "42rem",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "rgb(226 232 240)",
            borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
            padding: "1rem 1.5rem",
            direction: "rtl",
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">تفاصيل الدين</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700/50 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </DialogTitle>

        <DialogContent sx={{ padding: 0, direction: "rtl" }}>
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-700/70 bg-slate-800/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
                }`}
              >
                {tab.label}
                {tab.id === "invoices" && (
                  <span className="mx-2 px-2 py-0.5 rounded-full bg-slate-700/70 text-xs">
                    {debt.relatedInvoices.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-5">
                {/* Status and Summary */}
                <div className="bg-slate-800/50 rounded-xl overflow-hidden ">
                  {/* Header with status */}
                  <div className="flex justify-between items-center p-4 bg-slate-700/30">
                    <div className="flex items-center gap-3 gap-reverse">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          debt.status === "active"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : debt.status === "paid"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        <AlertCircle className="h-4 w-4 mx-1" />
                        {debt.status === "active"
                          ? "دين نشط"
                          : debt.status === "paid"
                          ? "مدفوع"
                          : debt.status}
                      </span>

                      {hasDiscount && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400">
                          <PercentCircle className="h-4 w-4 mx-1" />
                          خصم {formatCurrency(discountedAmount)}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-slate-400">#{debt.id}</div>
                  </div>

                  {/* Main amounts */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="col-span-3 sm:col-span-1">
                        <div className="rounded-lg bg-slate-700/30 p-3 text-center">
                          <p className="text-sm text-slate-400 mb-1">
                            المبلغ الإجمالي
                          </p>
                          <p className="text-lg font-semibold text-emerald-400">
                            {formatCurrency(debt.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-3 sm:col-span-1">
                        <div className="rounded-lg bg-slate-700/30 p-3 text-center">
                          <p className="text-sm text-slate-400 mb-1">
                            المبلغ المدفوع
                          </p>
                          <p className="text-lg font-semibold text-blue-400">
                            {formatCurrency(totalPaid)}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-3 sm:col-span-1">
                        <div className="rounded-lg bg-slate-700/30 p-3 text-center">
                          <p className="text-sm text-slate-400 mb-1">
                            المبلغ المتبقي
                          </p>
                          <p className="text-lg font-semibold text-red-400">
                            {formatCurrency(debt.remainingAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Discount info */}
                    {hasDiscount && (
                      <div className="mt-3 bg-purple-500/10 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <Tag className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-purple-400">
                              تم تطبيق خصم بقيمة{" "}
                              {formatCurrency(discountedAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                  <div className="flex items-center p-4 bg-slate-700/30">
                    <User className="h-5 w-5 text-slate-400 mx-2" />
                    <h3 className="text-base font-medium text-slate-200">
                      معلومات العميل
                    </h3>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          اسم العميل
                        </p>
                        <p className="text-slate-200 font-medium">
                          {debt.customer.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          رقم الهاتف
                        </p>
                        <p className="text-slate-200 font-medium">
                          {debt.customer.phone || "غير متوفر"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates Information */}
                <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                  <div className="flex items-center p-4 bg-slate-700/30">
                    <CalendarDays className="h-5 w-5 text-slate-400 mx-2" />
                    <h3 className="text-base font-medium text-slate-200">
                      التواريخ
                    </h3>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          تاريخ الإنشاء
                        </p>
                        <p className="text-slate-200">
                          {formatDate(debt.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          تاريخ آخر دفعة
                        </p>
                        <p className="text-slate-200">
                          {debt.lastPaymentDate
                            ? formatDate(debt.lastPaymentDate)
                            : "لا يوجد"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl overflow-hidden no-scrollbar">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30">
                    <h3 className="text-base font-medium text-slate-200 flex items-center">
                      <Receipt className="h-5 w-5 text-slate-400 mx-2" />
                      الفواتير المرتبطة
                    </h3>
                    <span className="bg-slate-700/70 text-slate-300 text-sm px-2.5 py-0.5 rounded-full">
                      {debt.relatedInvoices.length}
                    </span>
                  </div>

                  <div className="p-4">
                    {debt.relatedInvoices.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto  pr-1">
                        {debt.relatedInvoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <span className="text-slate-200 font-medium">
                                    #{invoice.invoiceNumber}
                                  </span>
                                  <span
                                    className={`mx-2 text-xs px-2 py-0.5 rounded-full ${
                                      invoice.invoiceType === "income"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                                  >
                                    {invoice.invoiceType === "income"
                                      ? "دخل"
                                      : "صرف"}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">
                                  {formatDate(invoice.createdAt)}
                                </p>
                              </div>
                              <div className="text-left">
                                <p
                                  className={`font-medium ${
                                    invoice.invoiceType === "income"
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {formatCurrency(invoice.totalAmount)}
                                </p>
                                {invoice.discount > 0 && (
                                  <p className="text-xs text-purple-400 mt-1">
                                    خصم: {formatCurrency(invoice.discount)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {invoice.notes && (
                              <p className="text-xs text-slate-400 mt-2 border-t border-slate-700/50 pt-2">
                                {invoice.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400">
                        لا توجد فواتير مرتبطة بهذا الدين
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Discount Tab */}
            {activeTab === "discount" && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                  <div className="flex items-center p-4 bg-slate-700/30">
                    <PercentCircle className="h-5 w-5 text-slate-400 mx-2" />
                    <h3 className="text-base font-medium text-slate-200">
                      إضافة خصم
                    </h3>
                  </div>

                  <div className="p-4">
                    <div className="mb-4 bg-blue-500/10 text-blue-400 p-3 rounded-lg text-sm">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 mx-2 flex-shrink-0" />
                        <div>
                          <p>
                            إضافة خصم على الدين سيقلل المبلغ المتبقي المطلوب
                            سداده.
                          </p>
                          <p className="mt-1">
                            المبلغ المتبقي الحالي:{" "}
                            <span className="font-semibold">
                              {formatCurrency(debt.remainingAmount)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="discountAmount"
                          className="block text-sm font-medium text-slate-300 mb-1"
                        >
                          قيمة الخصم
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="discountAmount"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            placeholder="أدخل قيمة الخصم"
                            className="w-full pl-3 pr-10 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
                              text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            ل.س
                          </span>
                        </div>
                        {discountAmount &&
                          !isNaN(parseFloat(discountAmount)) && (
                            <p className="text-sm text-slate-400 mt-1">
                              المبلغ بعد الخصم:{" "}
                              {formatCurrency(
                                debt.remainingAmount -
                                  parseFloat(discountAmount)
                              )}
                            </p>
                          )}
                      </div>

                      <div>
                        <label
                          htmlFor="discountReason"
                          className="block text-sm font-medium text-slate-300 mb-1"
                        >
                          سبب الخصم
                        </label>
                        <input
                          type="text"
                          id="discountReason"
                          value={discountReason}
                          onChange={(e) => setDiscountReason(e.target.value)}
                          placeholder="مثال: خصم بمناسبة عيد الأضحى"
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
                            text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                        />
                      </div>

                      {discountError && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">
                          {discountError}
                        </div>
                      )}

                      <div className="flex justify-end gap-3 gap-reverse mt-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab("details")}
                          className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg 
                            hover:bg-slate-700 transition-colors"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyDiscount}
                          disabled={applyDiscount.isPending}
                          className="flex items-center px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg 
                            hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applyDiscount.isPending ? (
                            <>
                              <span className="mx-2">جاري التطبيق...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mx-1" />
                              <span>تطبيق الخصم</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={applyDiscount.isPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default DebtDetailsModal;
