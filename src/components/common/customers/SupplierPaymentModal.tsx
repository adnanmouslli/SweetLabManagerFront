import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { usePaySupplierDues } from "@/hooks/customers/useCustomers";
import { AllCustomerType } from "@/types/customers.type";

interface SupplierPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier: AllCustomerType;
}

const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({
    isOpen,
    onClose,
    supplier,
}) => {
    const [amount, setAmount] = useState<string>(supplier.supplierBalance.toString());
    const [notes, setNotes] = useState<string>("");
    const [fundId, setFundId] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const paySupplierDues = usePaySupplierDues();

    // Reset confirmation when amount changes
    useEffect(() => {
        setShowConfirmation(false);
    }, [amount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            return;
        }

        if (parseFloat(amount) > supplier.supplierBalance) {
            return;
        }

        // Show confirmation first
        setShowConfirmation(true);
    };

    const handleConfirmPayment = async () => {
        setIsSubmitting(true);
        setShowConfirmation(false);

        try {
            await paySupplierDues.mutateAsync({
                supplierId: supplier.id,
                paymentAmount: parseFloat(amount),
                notes: notes || undefined,
                fundId: fundId,
            });

            // Close modal after successful payment
            setTimeout(() => {
                onClose();
                setAmount("");
                setNotes("");
                setIsSubmitting(false);
            }, 1500);
        } catch (error) {
            console.error("Error paying supplier dues:", error);
            setIsSubmitting(false);
        }
    };

    const handlePayFullBalance = () => {
        setAmount(supplier.supplierBalance.toString());
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setAmount("");
            setNotes("");
            setFundId(1);
            setShowConfirmation(false);
        }
    };

    if (!isOpen) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("ar-SY", {
            style: "decimal",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-sm bg-slate-800 rounded-lg shadow-xl p-4 mx-4 border border-slate-700 max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Fixed at top */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">
                                    دفع المستحقات
                                </h3>
                                <p className="text-xs text-slate-300">
                                    {supplier.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {supplier.phone}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="p-1 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                        {/* Current Balance */}
                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-red-400">
                                    الرصيد الحالي:
                                </span>
                                <span className="text-base font-bold text-red-400">
                                    {new Intl.NumberFormat("ar-SY", {
                                        style: "decimal",
                                        maximumFractionDigits: 0,
                                    }).format(supplier.supplierBalance)} ل.س
                                </span>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/30">
                            <div className="flex items-start gap-2">
                                <div className="p-1 bg-blue-500/20 rounded border border-blue-500/30">
                                    <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                                </div>
                                <div className="text-xs text-blue-400">
                                    <p className="font-medium mb-0.5">معلومات مهمة:</p>
                                    <p>هذا الدفع سيتم خصمه من رصيد المورد المستحق. تأكد من المبلغ قبل الإرسال.</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    المبلغ المدفوع
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="أدخل المبلغ"
                                        className="flex-1 px-2.5 py-1.5 border border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-slate-700 text-white placeholder-slate-400"
                                        required
                                        min="0"
                                        max={supplier.supplierBalance}
                                        step="0.01"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePayFullBalance}
                                        disabled={isSubmitting}
                                        className="px-2.5 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-xs whitespace-nowrap"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>...</span>
                                            </div>
                                        ) : (
                                            "الرصيد الكامل"
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    ملاحظات (اختياري)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="أضف ملاحظات حول الدفع..."
                                    rows={2}
                                    className="w-full px-2.5 py-1.5 border border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm bg-slate-700 text-white placeholder-slate-400"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    الصندوق
                                </label>
                                <select
                                    value={fundId}
                                    onChange={(e) => setFundId(parseInt(e.target.value))}
                                    className="w-full px-2.5 py-1.5 border border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-slate-700 text-white"
                                    disabled={isSubmitting}
                                >
                                    <option value={1}>الصندوق الرئيسي</option>
                                    <option value={2}>الصندوق العام</option>
                                    <option value={3}>صندوق الكشك</option>
                                    <option value={4}>صندوق الجامعة</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > supplier.supplierBalance}
                                className="w-full py-2.5 px-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>جاري الدفع...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>تأكيد الدفع</span>
                                    </div>
                                )}
                            </button>

                            {/* Confirmation Dialog */}
                            {showConfirmation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                                >
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-2">
                                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <h4 className="text-xs font-medium text-yellow-400 mb-1.5">
                                            تأكيد الدفع
                                        </h4>
                                        <p className="text-xs text-yellow-300 mb-3">
                                            هل أنت متأكد من دفع {formatCurrency(parseFloat(amount))} ل.س للمورد {supplier.name}؟
                                        </p>
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => setShowConfirmation(false)}
                                                disabled={isSubmitting}
                                                className="px-3 py-1.5 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50 text-xs"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                onClick={handleConfirmPayment}
                                                disabled={isSubmitting}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-xs"
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>جاري الدفع...</span>
                                                    </div>
                                                ) : (
                                                    "تأكيد الدفع"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Validation Message */}
                            {amount && parseFloat(amount) > supplier.supplierBalance && (
                                <div className="mt-1.5 text-xs text-red-400 text-center">
                                    المبلغ المدخل أكبر من الرصيد المستحق
                                </div>
                            )}

                            {/* Payment Summary */}
                            {amount && parseFloat(amount) > 0 && parseFloat(amount) <= supplier.supplierBalance && (
                                <div className="mt-3 p-2.5 bg-green-500/10 rounded-lg border border-green-500/30">
                                    <div className="text-xs text-white">
                                        <p className="font-medium mb-1">ملخص الدفع:</p>
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">الرصيد الحالي:</span>
                                                <span className="font-medium text-red-400">{formatCurrency(supplier.supplierBalance)} ل.س</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">المبلغ المدفوع:</span>
                                                <span className="text-slate-300">- {formatCurrency(parseFloat(amount))} ل.س</span>
                                            </div>
                                            <div className="flex justify-between border-t border-green-500/30 pt-0.5">
                                                <span className="text-slate-300">الرصيد الجديد:</span>
                                                <span className="font-medium text-green-400">
                                                    {formatCurrency(supplier.supplierBalance - parseFloat(amount))} ل.س
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Success/Error Messages */}
                        {paySupplierDues.isSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-2.5 bg-green-500/10 border border-green-500/30 rounded-lg"
                            >
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    <div>
                                        <span className="text-xs font-medium">
                                            تم دفع المستحقات بنجاح
                                        </span>
                                        <div className="text-xs text-green-300 mt-0.5">
                                            تم دفع {formatCurrency(parseFloat(amount))} ل.س للمورد {supplier.name}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paySupplierDues.isError && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg"
                            >
                                <div className="flex items-center gap-2 text-red-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">
                                        حدث خطأ أثناء الدفع
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SupplierPaymentModal;
