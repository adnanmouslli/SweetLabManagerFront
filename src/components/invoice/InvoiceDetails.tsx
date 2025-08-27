import { InvoiceCategory } from "@/types/invoice.type";
import { Calculator, DollarSign, FileText } from "lucide-react";
import React from "react";

interface FormData {
  totalAmount: number;
  discount: number;
  additionalAmount: number;
  firstPayment: number;
  paymentType: "paid" | "unpaid" | "breakage";
  notes?: string;
  supplierPaymentAmount: number; // المبلغ المدفوع للمورد
}

interface InvoiceDetailsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type: InvoiceCategory;
  mode: "income" | "expense";
  trayCount?: number | undefined;
  setTrayCount?: React.Dispatch<React.SetStateAction<number | undefined>>;
  isPurchaseInvoice: boolean;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  formData,
  handleChange,
  type,
  mode,
  trayCount,
  setTrayCount,
  isPurchaseInvoice
}) => {
  const calculateTotal = () => {
    const totalAmount = Number(formData.totalAmount) || 0;
    const discount = Number(formData.discount) || 0;
    const additionalAmount = Number(formData.additionalAmount) || 0;
    return totalAmount - discount + additionalAmount;
  };

  return (
    <div className="space-y-6">
      {/* Trays Count */}
      {type === InvoiceCategory.PRODUCTS && mode === "income" && (
        <div>
          <div className="space-y-2">
            <label className="block text-slate-200">عدد الفوارغ</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={trayCount === undefined ? "" : trayCount}
                onChange={(e) => {
                  if (setTrayCount) {
                    const value = e.target.value === ""
                      ? undefined
                      : Number(e.target.value);
                    setTrayCount(value);
                  }
                }}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
              />
              {trayCount === undefined && (
                <div className="text-red-400 text-sm mt-1">
                  يجب إدخال عدد الفوارغ
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <label className="block text-slate-200">المبلغ الإضافي</label>
            <div className="relative">
              <Calculator className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                name="additionalAmount"
                value={formData.additionalAmount}
                onChange={handleChange}
                min="0"
                className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                placeholder="قيمة المبلغ الإضافي"
              />
            </div>
            <p className="text-xs text-slate-400">
              يمكنك إضافة مبلغ إضافي على الفاتورة مثل قيمة التوصيل أو رسوم إضافية
            </p>
          </div>
        </div>
      )}

      {/* Supplier Payment Amount Field (Only show for expense product invoices) */}
      {type === InvoiceCategory.PRODUCTS && mode === "expense" && (
        <div className="space-y-2">
          <label className="block text-slate-200">المبلغ المدفوع للمورد</label>
          <div className="relative">
            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="number"
              name="supplierPaymentAmount"
              value={formData.supplierPaymentAmount}
              onChange={handleChange}
              min="0"
              className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
              placeholder="المبلغ المدفوع للمورد"
            />
          </div>
          <p className="text-xs text-slate-400">
            المبلغ المدفوع للمورد (يتم تعيينه تلقائياً بقيمة الفاتورة الكاملة)
          </p>
        </div>
      )}

      {/* First Payment Field (Only show when payment type is "breakage") */}
      {formData.paymentType === "breakage" && (
        <div className="space-y-2">
          <label className="block text-slate-200">الدفعة الأولى</label>
          <div className="relative">
            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="number"
              name="firstPayment"
              value={formData.firstPayment}
              onChange={handleChange}
              className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
              placeholder="أدخل قيمة الدفعة الأولى"
            />
          </div>
          {formData.firstPayment <= 0 && (
            <div className="text-red-400 text-sm">
              يجب إدخال قيمة أكبر من صفر
            </div>
          )}
          {formData.firstPayment >=
            formData.totalAmount - formData.discount &&
            formData.totalAmount > 0 && (
              <div className="text-red-400 text-sm">
                يجب أن تكون الدفعة الأولى أقل من المبلغ الإجمالي بعد الخصم
              </div>
            )}
        </div>
      )}

      {/* Discount and Total Fields */}
      {!isPurchaseInvoice && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-slate-200">الخصم</label>
            <div className="relative">
              <Calculator className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                placeholder="قيمة الخصم"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-200">
              الإجمالي بعد الخصم والإضافات
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                readOnly
                value={calculateTotal()}
                className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Remaining Amount after First Payment (Only for breakage) */}
      {formData.paymentType === "breakage" && (
        <div className="space-y-2">
          <label className="block text-slate-200">
            المبلغ المتبقي بعد الدفعة الأولى
          </label>
          <div className="relative">
            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              readOnly
              value={(
                formData.totalAmount -
                formData.discount +
                (formData.additionalAmount || 0) -
                formData.firstPayment
              ).toFixed(2)}
              className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-slate-200">ملاحظات</label>
        <div className="relative">
          <FileText className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 resize-none h-24"
            placeholder="إضافة ملاحظات..."
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;