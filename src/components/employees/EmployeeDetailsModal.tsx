import React from "react";
import { motion } from "framer-motion";
import { X, User, Phone, Clock, CalendarDays, CreditCard, DollarSign, TrendingUp, Calendar, ReceiptText, Loader2 } from "lucide-react";
import { Employee, WorkType } from "@/types/employees.type";
import { useEmployee } from "@/hooks/employees/useEmployees";

interface EmployeeDetailsModalProps {
  employee: Employee;
  onClose: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-SY", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
};

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  employee,
  onClose,
}) => {
  // Fetch detailed employee data
  const { data: employeeDetails, isLoading } = useEmployee(employee.id);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ar");
  };

  // Get work type display text
  const getWorkTypeText = (workType?: WorkType | string) => {
    switch (workType) {
      case WorkType.HOURLY:
        return "بالساعة";
      case WorkType.PRODUCTION:
        return "بالإنتاج";
      default:
        return "—";
    }
  };

  // Get work type icon
  const getWorkTypeIcon = (workType?: WorkType | string) => {
    switch (workType) {
      case WorkType.HOURLY:
        return <Clock className="h-5 w-5 text-cyan-400" />;
      case WorkType.PRODUCTION:
        return <DollarSign className="h-5 w-5 text-green-400" />;
      default:
        return null;
    }
  };

  // Get invoice category display text
 const getInvoiceCategoryText = (invoice: any): string => {
  // إذا كانت الفاتورة من نوع employee
  if (invoice.invoiceCategory === 'employee') {
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
    default:
      return invoice.invoiceCategory;
  }
};

// دالة للحصول على لون الفاتورة حسب النوع
const getInvoiceTypeColor = (invoice: any): string => {
  if (invoice.invoiceCategory === 'employee') {
    switch (invoice.employeeInvoiceType) {
      case 'salary_advance':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'debt':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'returnWithdrawal':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'debtPayment':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  }
  
  // ألوان للفواتير الأخرى
  if (invoice.invoiceCategory === 'products') {
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  }
  
  return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};


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
        className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm p-6 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto no-scrollbar border border-white/10"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>تفاصيل الموظف</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Employee Name and Main Info */}
            <div className="mb-6 text-center">
              <div className="h-20 w-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                <User className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{employee.name}</h3>
              {employee.phone && (
                <p className="text-slate-400 flex items-center justify-center gap-1 mb-3">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phone}</span>
                </p>
              )}
              <div className="inline-flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1
                  ${employee.workType === WorkType.HOURLY
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "bg-green-500/10 text-green-400 border border-green-500/20"
                  }`}>
                  {getWorkTypeIcon(employee.workType)}
                  {getWorkTypeText(employee.workType)}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            {employeeDetails?.financialSummary && (
              <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  الملخص المالي
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                    <div className="text-xs text-green-300 mb-1">إجمالي الرواتب</div>
                    <div className="text-lg font-bold text-green-400">{formatCurrency(employeeDetails.financialSummary.totalSalaries)} ل.س</div>
                  </div>
                  <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <div className="text-xs text-red-300 mb-1">إجمالي السحوبات</div>
                    <div className="text-lg font-bold text-red-400">{formatCurrency(employeeDetails.financialSummary.totalWithdrawals)} ل.س</div>
                  </div>
                  <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <div className="text-xs text-yellow-300 mb-1">الديون</div>
                    <div className="text-lg font-bold text-yellow-400">{formatCurrency(employeeDetails.financialSummary.debtAmount)} ل.س</div>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <div className="text-xs text-blue-300 mb-1">الصافي</div>
                    <div className="text-lg font-bold text-blue-400">{formatCurrency(employeeDetails.financialSummary.totalSalaries - employeeDetails.financialSummary.totalWithdrawals)} ل.س</div>
                  </div>
                </div>
              </div>
            )}

            {/* Employee Details */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  معلومات الموظف
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-400">رقم الهاتف:</span>
                    <span className="text-white">{employee.phone || "—"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">نوع العمل:</span>
                    <span className="text-white flex items-center gap-1">
                      {getWorkTypeIcon(employee.workType)}
                      {getWorkTypeText(employee.workType)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">تاريخ الإضافة:</span>
                    <span className="text-white">{formatDate(employee.createdAt)}</span>
                  </li>
                  {employee.workshop && (
                    <li className="flex justify-between">
                      <span className="text-slate-400">الورشة:</span>
                      <span className="text-white">{employee.workshop.name}</span>
                    </li>
                  )}
                </ul>
              </div>

              {employee.workType === WorkType.HOURLY && employeeDetails?.hourRecords ? (
                <>
                  <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-cyan-400" />
                      سجل ساعات العمل ({employeeDetails.hourRecords.length} سجل)
                    </h4>
                    {employeeDetails.hourRecords.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {employeeDetails.hourRecords.slice(0, 5).map((record) => (
                          <div key={record.id} className="flex justify-between items-center bg-white/5 p-2 rounded">
                            <div className="text-sm">
                              <div className="text-slate-300">{record.hours} ساعة × {formatCurrency(record.hourlyRate)} ل.س</div>
                              <div className="text-xs text-slate-400">{formatDate(record.date)}</div>
                            </div>
                            <div className="text-cyan-400 font-medium">{formatCurrency(record.totalAmount)} ل.س</div>
                          </div>
                        ))}
                        {employeeDetails.hourRecords.length > 5 && (
                          <div className="text-center text-sm text-slate-400 pt-2">
                            و {employeeDetails.hourRecords.length - 5} سجلات أخرى...
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-slate-400 py-3">لا توجد سجلات ساعات عمل</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-center text-slate-400 py-3">لا توجد بيانات عمل متاحة</p>
                </div>
              )}

              {/* Invoices */}
              {employeeDetails?.invoices && employeeDetails.invoices.length > 0 && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-blue-400" />
                    الفواتير ({employeeDetails.invoices.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employeeDetails.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                        <div className="text-sm flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-slate-300 font-medium">
                              {getInvoiceCategoryText(invoice)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs border ${getInvoiceTypeColor(invoice)}`}>
                              {invoice.invoiceType === 'income' ? 'دخل' : 'صرف'}
                            </span>
                            
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatDate(invoice.paymentDate || invoice.createdAt)}
                          </div>
                          {invoice.notes && (
                            <div className="text-xs text-slate-500 mt-1 truncate">
                              {invoice.notes}
                            </div>
                          )}
                        </div>
                        <div className={`font-medium text-lg mr-3 ${
                          invoice.invoiceType === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {invoice.invoiceType === 'expense' ? '-' : '+'}{formatCurrency(invoice.totalAmount)} ل.س
                        </div>
                      </div>
                    ))}


                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors border border-white/10"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDetailsModal;