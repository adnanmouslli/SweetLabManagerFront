"use client";
import { formatAmount } from "@/hooks/invoices/useInvoiceStats";
import { useCheckPendingTransfers } from "@/hooks/shifts/useShifts";
import { formatDate } from "@/utils/formatters";
import { motion } from "framer-motion";
import { X, AlertTriangle, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

interface Fund {
  fundType: string;
  invoiceCount: number;
  incomeTotal: number;
  expenseTotal: number;
  netTotal: number;
}

export interface ShiftSummaryData {
  shiftId: number;
  employeeName: string;
  openTime: string;
  fundSummaries: Fund[];
  totalNet: number;
}

interface CloseShiftModalProps {
  onClose: () => void;
  onConfirm: ({ amount }: { amount: number }) => void;
  shiftType: "صباحي" | "مسائي";
  shiftSummary?: ShiftSummaryData;
  isShiftClosing: boolean;
  // New props for shifts page compatibility
  open?: boolean;
  isLoading?: boolean;
  shiftId?: number;
}

const CloseShiftModal: React.FC<CloseShiftModalProps> = ({
  onClose,
  onConfirm,
  shiftType,
  shiftSummary,
  isShiftClosing,
  // New props for shifts page compatibility
  open,
  isLoading,
  shiftId,
}) => {
  const [actualAmount, setActualAmount] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);
  const { data } = useCheckPendingTransfers();

  // Use the new props if available, otherwise fall back to the old ones
  const isOpen = open !== undefined ? open : true;
  const isShiftClosingState = isLoading !== undefined ? isLoading : isShiftClosing;
  const displayShiftId = shiftId || (shiftSummary?.shiftId);

  // Calculate difference when actualAmount or shiftSummary changes
  useEffect(() => {
    if (shiftSummary && actualAmount) {
      setDifference(actualAmount - shiftSummary.totalNet);
    } else {
      setDifference(0);
    }
  }, [actualAmount, shiftSummary]);

  // Get status based on difference
  const getDifferenceStatus = () => {
    if (difference > 0) return "surplus";
    if (difference < 0) return "leakage";
    return "balanced";
  };

  const differenceStatus = getDifferenceStatus();

  // Don't render if not open (for shifts page compatibility)
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 h-[90%] overflow-y-auto overflow-hidden no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-100">
            {displayShiftId ? `إنهاء الوردية #${displayShiftId}` : "تأكيد إغلاق الوردية"}
          </h2>
        </div>

        <div className="space-y-6" dir="rtl">
          {/* Warning Icon and Message */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-12 h-12 text-amber-400" />
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-1">
                هل أنت متأكد من إغلاق الوردية {shiftType}؟
              </h3>
              <p className="text-slate-300 text-sm">
                سيتم حفظ جميع البيانات وإغلاق الوردية الحالية
              </p>
            </div>
          </div>

          {/* Shift Summary */}
          {shiftSummary && (
            <>
              {/* Current Shift Info */}
              <div className="p-4 rounded-lg bg-slate-700/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">الموظف:</span>
                  <span className="text-slate-200">
                    {shiftSummary.employeeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">وقت الفتح:</span>
                  <span className="text-slate-200">
                    {formatDate(shiftSummary.openTime)}
                  </span>
                </div>
              </div>

              {/* Funds Summary */}
              <div className="space-y-2">
                {shiftSummary.fundSummaries.map((fund) => (
                  <div
                    key={fund.fundType}
                    className="p-4 rounded-lg bg-slate-700/30"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-200 font-medium">
                        {fund.fundType === "booth"
                          ? "البسطة"
                          : fund.fundType === "university"
                            ? "الجامعة"
                            : "الصندوق العام"}
                      </span>
                      <span className="text-slate-400">
                        ({fund.invoiceCount} فواتير)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                      <div className="text-emerald-400">
                        المدخول: {formatAmount(fund.incomeTotal)}
                      </div>
                      <div className="text-red-400">
                        المصروف: {formatAmount(fund.expenseTotal)}
                      </div>
                      <div className="col-span-2 text-slate-200">
                        الصافي: {formatAmount(fund.netTotal)}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Total Net */}
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-slate-200">إجمالي الصناديق:</span>
                    <span className="text-emerald-400">
                      {formatAmount(shiftSummary.totalNet)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-slate-200 mb-2">
                  المبلغ الفعلي
                </label>
                <input
                  type="number"
                  value={actualAmount || ''}
                  onChange={(e) => setActualAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 appearance-none"
                  placeholder="أدخل المبلغ الفعلي"
                />
              </div>
            </div>

            {/* Difference Indicator - New UI */}
            {actualAmount > 0 && shiftSummary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-center justify-between ${differenceStatus === "surplus"
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : differenceStatus === "leakage"
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-blue-500/10 border border-blue-500/20"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {differenceStatus === "surplus" ? (
                    <div className="rounded-full bg-emerald-500/20 p-2">
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                  ) : differenceStatus === "leakage" ? (
                    <div className="rounded-full bg-red-500/20 p-2">
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-blue-500/20 p-2">
                      <DollarSign className="w-6 h-6 text-blue-400" />
                    </div>
                  )}

                  <div>
                    <h4 className={`text-lg font-medium ${differenceStatus === "surplus"
                      ? "text-emerald-400"
                      : differenceStatus === "leakage"
                        ? "text-red-400"
                        : "text-blue-400"
                      }`}>
                      {differenceStatus === "surplus"
                        ? "فائض"
                        : differenceStatus === "leakage"
                          ? "عجز"
                          : "متوازن"}
                    </h4>
                    <p className="text-slate-300 text-sm">
                      {differenceStatus === "surplus"
                        ? "المبلغ الفعلي أكبر من المتوقع"
                        : differenceStatus === "leakage"
                          ? "المبلغ الفعلي أقل من المتوقع"
                          : "المبلغ الفعلي يساوي المتوقع"}
                    </p>
                  </div>
                </div>
                <div className={`text-xl font-bold ${differenceStatus === "surplus"
                  ? "text-emerald-400"
                  : differenceStatus === "leakage"
                    ? "text-red-400"
                    : "text-blue-400"
                  }`}>
                  {formatAmount(Math.abs(difference))}
                </div>
              </motion.div>
            )}

            {data && data.hasPendingTransfers && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  عالج التحويلات المعلقة قبل انهاء الوردية
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {data && !data.hasPendingTransfers && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onConfirm({ amount: actualAmount })}
                disabled={isShiftClosingState}
                className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isShiftClosingState ? (
                  <div className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full mx-2"></span>
                    جارٍ إغلاق الوردية...
                  </div>
                ) : (
                  "تأكيد الإغلاق"
                )}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isShiftClosingState}
              className="flex-1 bg-slate-700/50 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              إلغاء
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CloseShiftModal;