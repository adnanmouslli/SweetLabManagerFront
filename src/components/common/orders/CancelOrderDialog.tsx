import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CancelOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    orderNumber?: string;
    customerName?: string;
    isCancelling: boolean;
}

const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    orderNumber,
    customerName,
    isCancelling
}) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        // إذا لم يتم إدخال سبب، نرسل سبب فارغ
        const finalReason = reason.trim() || '';
        onConfirm(finalReason);
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={handleClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-300 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-100">إلغاء الطلب</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <div className="text-sm text-amber-300">
                            <p className="font-medium">تأكيد إلغاء الطلب</p>
                            <p className="text-xs mt-1">
                                {orderNumber && `رقم الطلب: ${orderNumber}`}
                                {customerName && ` - العميل: ${customerName}`}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-slate-200 font-medium">
                            سبب الإلغاء <span className="text-slate-400 text-sm">(اختياري)</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 min-h-[100px] resize-none"
                            placeholder="أدخل سبب إلغاء الطلب (اختياري)..."
                            dir="rtl"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isCancelling}
                            className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isCancelling}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isCancelling ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    جاري الإلغاء...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-4 w-4" />
                                    تأكيد الإلغاء
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CancelOrderDialog;