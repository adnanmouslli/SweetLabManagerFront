import { InvoiceCategory } from "@/types/invoice.type";
import { motion } from "framer-motion";
import { Receipt, CreditCard, Wallet, X, CreditCardIcon, User, Clock, Package, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import React from "react";

export type TransactionMode = "income" | "expense";

export interface TransactionTypeModalProps {
  onClose: () => void;
  onSelect: (type: InvoiceCategory, subType?: string) => void;
  mode: TransactionMode;
}

const TransactionTypeModal: React.FC<TransactionTypeModalProps> = ({
  onClose,
  onSelect,
  mode,
}) => {
  const types = mode === "income" ? [
    {
      id: InvoiceCategory.PRODUCTS,
      value: "منتجات",
      icon: Package,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
      description: "فاتورة بيع منتجات",
    },
    {
      id: InvoiceCategory.DIRECT,
      value: "مباشر",
      icon: CreditCard,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
      description: "دخل مباشر بدون فاتورة",
    },
    {
      id: InvoiceCategory.DEBT,
      value: "دين",
      icon: Wallet,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
      description: "تحصيل دين",
    },
    {
      id: InvoiceCategory.ADVANCE,
      value: "سلفة",
      icon: CreditCardIcon,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
      description: "إضافة سلفة",
    },
    {
      id: InvoiceCategory.EMPLOYEE_DEBT,
      value: "دين موظف",
      icon: User,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20",
      description: "تحصيل دين موظف",
      subType: "debtPayment"
    },
    {
      id: InvoiceCategory.EMPLOYEE_WITHDRAWAL_RETURN,
      value: "ارجاع سحب موظف",
      icon: ArrowUpFromLine,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10 hover:bg-pink-500/20",
      description: "ارجاع سحب موظف",
      subType: "returnWithdrawal"
    },
  ] : [
    {
      id: InvoiceCategory.PRODUCTS,
      value: "منتجات",
      icon: Package,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
      description: "فاتورة شراء منتجات",
    },
    {
      id: InvoiceCategory.DIRECT,
      value: "مباشر",
      icon: CreditCard,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
      description: "مصروف مباشر بدون فاتورة",
    },
    {
      id: InvoiceCategory.DEBT,
      value: "دين",
      icon: Wallet,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
      description: "تسجيل دين جديد",
    },
    {
      id: InvoiceCategory.ADVANCE,
      value: "إرجاع سلفة",
      icon: CreditCardIcon,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
      description: "إرجاع سلفة",
    },
    {
      id: InvoiceCategory.EMPLOYEE_WITHDRAWAL,
      value: "سحب موظف",
      icon: ArrowDownToLine,
      color: "text-red-400",
      bgColor: "bg-red-500/10 hover:bg-red-500/20",
      description: "سحب موظف (سلفة/راتب مقدم)",
      subType: "salary_advance"
    },
    {
      id: InvoiceCategory.EMPLOYEE_DEBT,
      value: "دين على موظف",
      icon: User,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20",
      description: "تسجيل دين على موظف",
      subType: "employee_new_debt"
    },
    {
      id: InvoiceCategory.DAILY_EMPLOYEE_RENT,
      value: "أجرة موظف يومي",
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
      description: "أجرة موظف يومي",
      subType: "daily_salary"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors p-1 hover:bg-slate-700/50 rounded-lg"
            aria-label="إغلاق"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-100">
            {mode === "income" ? "نوع الدخل" : "نوع المصروف"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3" dir="rtl">
          {types.map((type) => (
            <motion.button
              key={`${type.id}-${type.subType || 'default'}`}
              onClick={() => onSelect(type.id, type.subType)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 p-4 rounded-lg ${type.bgColor} border border-transparent hover:border-slate-600/50 transition-all group text-right`}
            >
              <div className={`p-3 rounded-lg ${type.bgColor} ${type.color}`}>
                <type.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${type.color} text-lg mb-0.5`}>
                  {type.value}
                </h3>
                <p className="text-slate-400 text-sm">{type.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransactionTypeModal;