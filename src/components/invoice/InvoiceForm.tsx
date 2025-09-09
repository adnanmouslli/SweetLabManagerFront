import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, FileText } from "lucide-react";
import { InvoiceCategory } from "@/types/invoice.type";
import { useMokkBar } from "@/components/providers/MokkBarContext";

// Import services and hooks
import {
  useCreateDirectDebt,
  useCreateExpenseProducts,
  useCreateIncomeProducts,
} from "@/hooks/invoices/useInvoice";
import {
  useActiveAdvances,
  useReceiveAdvance,
  useRepayAdvance,
} from "@/hooks/advances/useAdvances";

// Import types
import { DirectDebtDTO, ExpenseProductsDTO, IncomeProductsDTO } from "@/types/invoice.type";
import AmountInput from "./AmountInput";
import CustomerSection from "./CustomerSection";
import EmployeeInvoiceForm from "./EmployeeInvoiceForm";
import InvoiceDetails from "./InvoiceDetails";
import ItemsTable from "./ItemsTable";
import ModalHeader from "./ModalHeader";
import PaymentTypeSelector from "./PaymentTypeSelector";
import ProductSelector, { FormItem } from "./ProductSelector";
import ActionButtons from "./ActionButtons";

// Import components

export type InvoiceType = "income" | "expense";
export type PaymentType = "paid" | "unpaid" | "breakage";

interface InvoiceFormProps {
  type: InvoiceCategory;
  mode: InvoiceType;
  fundId: number;
  onClose: () => void;
  customerId?: number;
  subType?: string; // For employee operations
}

interface FormData {
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  paymentType: PaymentType;
  totalAmount: number;
  firstPayment: number;
  discount: number;
  paidStatus: boolean;
  notes?: string;
  advanceId?: number;
  additionalAmount: number;
  supplierPaymentAmount: number; // المبلغ المدفوع للمورد
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  type,
  mode,
  fundId,
  customerId,
  onClose,
  subType,
}) => {
  // If this is an employee operation, render the EmployeeInvoiceForm instead
  if (type === InvoiceCategory.EMPLOYEE) {
    return (
      <EmployeeInvoiceForm
        mode={mode}
        fundId={fundId}
        onClose={onClose}
        initialOperationType={subType}
      />
    );
  }

  const { setSnackbarConfig } = useMokkBar();
  const [trayCount, setTrayCount] = useState<number | undefined>(undefined);

  // States
  const [formData, setFormData] = useState<FormData>({
    customerId: customerId,
    paymentType: "paid",
    totalAmount: 0,
    firstPayment: 0,
    discount: 0,
    paidStatus: true,
    additionalAmount: 0,
    supplierPaymentAmount: 0,
  });

  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);

  // Auto-update supplier payment amount when total amount changes for expense invoices
  useEffect(() => {
    if (mode === "expense" && type === InvoiceCategory.PRODUCTS) {
      setFormData(prev => ({
        ...prev,
        supplierPaymentAmount: prev.totalAmount,
      }));
    }
  }, [formData.totalAmount, mode, type]);

  // Flags and derived values
  const isPurchaseInvoice = mode === "expense";
  const isAdvanceRepay = type === InvoiceCategory.ADVANCE && mode === "expense";
  const isSimplifiedForm =
    type === InvoiceCategory.DIRECT ||
    type === InvoiceCategory.DEBT ||
    type === InvoiceCategory.ADVANCE;

  // Mutations with success/error handling
  const createIncomeProducts = useCreateIncomeProducts({
    onSuccess: () => {
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم إضافة الفاتورة بنجاح",
      });
      onClose();
    },
    onError: (error) => {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message:
          error?.response?.data?.message || "حدث خطأ أثناء إضافة الفاتورة",
      });
    },
  });

  const createExpenseProducts = useCreateExpenseProducts({
    onSuccess: () => {
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم إضافة فاتورة الشراء بنجاح",
      });
      onClose();
    },
    onError: (error) => {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message:
          error?.response?.data?.message || "حدث خطأ أثناء إضافة فاتورة الشراء",
      });
    },
  });

  const createDirectDebt = useCreateDirectDebt({
    onSuccess: () => {
      setSnackbarConfig({
        open: true,
        severity: "success",
        message:
          type === InvoiceCategory.DEBT ? "تم تسجيل الدين بنجاح" : "تم إضافة المعاملة بنجاح",
      });
      onClose();
    },
    onError: (error) => {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: error?.response?.data?.message || "حدث خطأ أثناء العملية",
      });
    },
  });

  // Use advance hooks
  const receiveAdvance = useReceiveAdvance();

  const repayAdvance = useRepayAdvance();

  // Check if the first payment is valid for breakage payment type
  const isFirstPaymentValid =
    formData.paymentType !== "breakage" ||
    (formData.firstPayment > 0 &&
      formData.firstPayment < formData.totalAmount - formData.discount);

  const isSubmitting =
    createDirectDebt.isPending ||
    createExpenseProducts.isPending ||
    createIncomeProducts.isPending ||
    receiveAdvance.isPending ||
    repayAdvance.isPending ||
    formData.totalAmount <= 0 ||
    (type === InvoiceCategory.PRODUCTS &&
      mode === "income" &&
      (trayCount === undefined || trayCount < 0)) ||
    !isFirstPaymentValid ||
    (type === InvoiceCategory.ADVANCE && !formData.customerId);

  const isPending =
    createDirectDebt.isPending ||
    createExpenseProducts.isPending ||
    createIncomeProducts.isPending ||
    receiveAdvance.isPending ||
    repayAdvance.isPending;

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "totalAmount" ||
          name === "discount" ||
          name === "firstPayment" ||
          name === "additionalAmount" ||
          name === "supplierPaymentAmount"
          ? Number(value)
          : value,
    }));
  };

  const handlePaymentTypeChange = (type: PaymentType) => {
    setFormData((prev) => ({
      ...prev,
      paymentType: type,
      paidStatus: type === "paid",
      // Reset first payment when payment type changes
      firstPayment: type === "breakage" ? prev.firstPayment : 0,
    }));
  };

  const addFormItem = (newItem: FormItem) => {
    setFormItems((prev) => [...prev, newItem]);
    const newTotalAmount = formData.totalAmount + newItem.subTotal;
    setFormData((prev) => ({
      ...prev,
      totalAmount: newTotalAmount,
      // Auto-update supplier payment amount for expense invoices
      supplierPaymentAmount: mode === "expense" ? newTotalAmount : prev.supplierPaymentAmount,
    }));
  };

  const removeItem = (itemId: number) => {
    const item = formItems.find((i) => i.id === itemId);
    if (!item) return;

    setFormItems((prev) => prev.filter((i) => i.id !== itemId));
    const newTotalAmount = formData.totalAmount - item.subTotal;
    setFormData((prev) => ({
      ...prev,
      totalAmount: newTotalAmount,
      // Auto-update supplier payment amount for expense invoices
      supplierPaymentAmount: mode === "expense" ? newTotalAmount : prev.supplierPaymentAmount,
    }));
  };

  const calculateTotal = () => {
    const totalAmount = Number(formData.totalAmount) || 0;
    const discount = Number(formData.discount) || 0;
    const additionalAmount = Number(formData.additionalAmount) || 0;
    return totalAmount - discount + additionalAmount;
  };

  const handleInvoiceSubmit = async () => {
    if (
      type === InvoiceCategory.PRODUCTS &&
      mode === "income" &&
      (trayCount === undefined || trayCount < 0)
    ) {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "يجب إدخال عدد الفوارغ وأن لا يكون أقل من صفر",
      });
      return;
    }

    // Validate first payment for breakage type
    if (
      formData.paymentType === "breakage" &&
      (formData.firstPayment <= 0 ||
        formData.firstPayment >= formData.totalAmount - formData.discount)
    ) {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message:
          "يجب إدخال مبلغ الدفعة الأولى وأن يكون أقل من المبلغ الإجمالي بعد الخصم",
      });
      return;
    }

    // Validate customer selection for advances
    if (type === InvoiceCategory.ADVANCE && !formData.customerId) {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "يجب اختيار عميل للسلفة",
      });
      return;
    }

    try {
      const baseInvoiceData = {
        customerId: formData.customerId,
        notes: formData.notes,
        fundId,
      };

      // Handle advance
      if (type === InvoiceCategory.ADVANCE) {
        const advanceData = {
          customerId: formData.customerId!,
          amount: formData.totalAmount,
          fundId,
          notes: formData.notes,
        };

        if (mode === "income") {
          // Receive advance
          await receiveAdvance.mutateAsync(advanceData);
        } else {
          // Repay advance
          await repayAdvance.mutateAsync(advanceData);
        }
      }
      // Handle product invoices
      else if (type === InvoiceCategory.PRODUCTS) {
        const productInvoiceData = {
          ...baseInvoiceData,
          invoiceType: mode,
          invoiceCategory: InvoiceCategory.PRODUCTS,
          paidStatus: formData.paymentType === "paid",
          isBreak: formData.paymentType === "breakage",
          totalAmount: calculateTotal(),
          trayCount: mode === "income" ? trayCount : 0,
          items: formItems.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            itemId: item.itemId,
            unit: item.unit,
            productionRate: item.productionRate || 0, // Include production rate
          })),
        };

        if (mode === "income") {
          await createIncomeProducts.mutateAsync({
            ...productInvoiceData,
            discount: formData.discount,
            // Add first payment field for breakage payment type
            initialPayment:
              formData.paymentType === "breakage"
                ? formData.firstPayment
                : undefined,
            additionalAmount: Number(formData.additionalAmount) || 0,
          } as IncomeProductsDTO);
        } else {
          await createExpenseProducts.mutateAsync({
            ...productInvoiceData,
            supplierPaymentAmount: formData.supplierPaymentAmount,
          } as ExpenseProductsDTO);
        }
      }
      // Handle direct/debt invoices
      else {
        const directDebtData: DirectDebtDTO = {
          ...baseInvoiceData,
          invoiceType: mode,
          invoiceCategory: type,
          totalAmount: formData.totalAmount,
          paidStatus: true,
        };

        await createDirectDebt.mutateAsync(directDebtData);
      }

      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  // Simplified Form Render (for direct, debt, and advance)
  if (isSimplifiedForm) {
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
          className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg mx-4 h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <ModalHeader onClose={onClose} type={type} mode={mode} />

          <div className="space-y-6" dir="rtl">
            {/* Customer Information */}
            {(fundId !== 1 ||
              type === InvoiceCategory.DIRECT ||
              type === InvoiceCategory.DEBT ||
              type === InvoiceCategory.ADVANCE) && (
                <CustomerSection
                  formData={formData}
                  setFormData={setFormData}
                  type={type}
                  mode={mode}
                  customerId={customerId}
                />
              )}

            {/* Amount */}
            <AmountInput
              totalAmount={formData.totalAmount}
              onChange={handleChange}
              type={type}
              mode={mode}
            />

            {/* Supplier Payment Amount Field (Only show for expense invoices) */}
            {mode === "expense" && (
              <div className="space-y-2">
                <label className="block text-slate-200">المبلغ المدفوع للمورد</label>
                <div className="relative">
                  <input
                    type="number"
                    name="supplierPaymentAmount"
                    value={formData.supplierPaymentAmount}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                    placeholder="المبلغ المدفوع للمورد"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  المبلغ المدفوع للمورد (يتم تعيينه تلقائياً بقيمة الفاتورة الكاملة)
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-slate-200">ملاحظات</label>
              <div className="relative">
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 resize-none h-24"
                  placeholder="إضافة ملاحظات..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <ActionButtons
              isSubmitting={isSubmitting}
              onSubmit={handleInvoiceSubmit}
              onCancel={onClose}
              isPending={isPending}
            />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Product Form
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
        className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <ModalHeader onClose={onClose} type={type} mode={mode} />

        <div className="space-y-6" dir="rtl">
          {/* Customer Information */}
          <CustomerSection
            formData={formData}
            setFormData={setFormData}
            type={type}
            mode={mode}
            customerId={customerId}
          />

          {/* Payment Type */}
          {mode === "income" && (
            <PaymentTypeSelector
              paymentType={formData.paymentType}
              onChange={handlePaymentTypeChange}
            />
          )}

          {/* Product Selection Section */}
          {type === InvoiceCategory.PRODUCTS && (
            <ProductSelector
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              formItems={formItems}
              addFormItem={addFormItem}
              mode={mode}
            />
          )}

          {/* Items Table */}
          <ItemsTable formItems={formItems} removeItem={removeItem} />

          {/* Invoice Details (Trays, Discount, Additional Amount, First Payment, Notes) */}
          <InvoiceDetails
            formData={formData}
            handleChange={handleChange}
            type={type}
            mode={mode}
            trayCount={trayCount}
            setTrayCount={setTrayCount}
            isPurchaseInvoice={isPurchaseInvoice}
          />

          {/* Action Buttons */}
          <ActionButtons
            isSubmitting={isSubmitting}
            onSubmit={handleInvoiceSubmit}
            onCancel={onClose}
            isPending={isPending}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};