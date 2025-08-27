"use client";
import {
  useCreateCustomer,
  useDeleteCustomer,
  useUpdateCustomer,
} from "@/hooks/customers/useCustomers";
import { AllCustomerType, CreateCustomerRequest, CustomerTypeEnum } from "@/types/customers.type";
import { CustomerCategory } from "@/types/customerCategories.types";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Loader2, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "update" | "delete";
  customerData: AllCustomerType | null;
  categories: CustomerCategory[];
}

type FormValues = CreateCustomerRequest;

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  mode = "create",
  customerData = null,
  categories = [],
}) => {
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      phone: "",
      notes: "",
      categoryId: null,
      customerType: CustomerTypeEnum.CUSTOMER, // Always set customer type for customers
    },
    // Add mode-specific validation
    context: { isCreateMode: mode === "create" }
  });

  // For watching the category selection
  const selectedCategoryId = watch("categoryId");

  // Custom hooks for API operations
  const { mutateAsync: createCustomer, isPending: isCreating } =
    useCreateCustomer();
  const { mutateAsync: updateCustomer, isPending: isUpdating } =
    useUpdateCustomer();
  const { mutateAsync: deleteCustomer, isPending: isDeleting } =
    useDeleteCustomer();

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "update" && customerData) {
        setValue("name", customerData.name || "");
        setValue("phone", customerData.phone || "");
        setValue("notes", customerData.notes || "");
        setValue("categoryId", customerData.categoryId);
        setValue("customerType", customerData.customerType || CustomerTypeEnum.CUSTOMER); // Ensure customer type is set
      } else if (mode === "create") {
        reset({
          name: "",
          phone: "",
          notes: "",
          categoryId: null,
          customerType: CustomerTypeEnum.CUSTOMER, // Always ensure customer type is set
        });
      }
    }

    // Reset status when modal opens/closes
    setSubmitStatus(null);
  }, [isOpen, mode, customerData, reset, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitStatus(null);

    try {
      // Ensure customerType is always included
      const requestData = {
        ...data,
        customerType: CustomerTypeEnum.CUSTOMER, // Always ensure this is set for customers
      };

      if (mode === "create") {
        await createCustomer(requestData);
      } else if (mode === "update" && customerData) {
        await updateCustomer({
          id: customerData.id,
          ...requestData,
        });
      }

      setSubmitStatus("success");

      // Close modal after successful operation (with delay for user to see success message)
      setTimeout(() => {
        onClose();
        // Reset form if it was a create operation
        if (mode === "create") {
          reset();
        }
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    }
  };

  const handleDelete = async () => {
    if (!customerData || !customerData.id) return;

    try {
      await deleteCustomer(customerData.id);
      setSubmitStatus("success");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error deleting customer:", error);
      setSubmitStatus("error");
    }
  };

  const modalTitle = {
    create: "إضافة عميل جديد",
    update: "تعديل بيانات العميل",
    delete: "حذف العميل",
  }[mode];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-slate-800/95 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100">{modalTitle}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-700"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success Message */}
          {submitStatus === "success" && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-emerald-400">
                {mode === "create"
                  ? "تم إضافة العميل بنجاح"
                  : mode === "update"
                    ? "تم تحديث بيانات العميل بنجاح"
                    : "تم حذف العميل بنجاح"}
              </span>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-400">
                {mode === "create"
                  ? "حدث خطأ أثناء إضافة العميل"
                  : mode === "update"
                    ? "حدث خطأ أثناء تحديث بيانات العميل"
                    : "حدث خطأ أثناء حذف العميل"}
              </span>
            </div>
          )}

          {mode === "delete" ? (
            // Delete Confirmation
            <div className="space-y-6">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-red-400 mb-2">
                  تأكيد الحذف
                </h3>
                <p className="text-slate-300">
                  {`هل أنت متأكد من أنك تريد حذف العميل ${customerData?.name}؟`}
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  هذا الإجراء لا يمكن التراجع عنه وسيؤدي إلى حذف جميع بيانات
                  العميل.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                  disabled={isDeleting}
                  type="button"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors flex items-center justify-center gap-2"
                  disabled={isDeleting}
                  type="button"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    "تأكيد الحذف"
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Create/Update Form
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Hidden input for customerType to ensure it's always submitted */}
              <input type="hidden" {...register("customerType")} value="CUSTOMER" />

              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    اسم العميل <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register("name", {
                      required: "الاسم مطلوب",
                      minLength: {
                        value: 2,
                        message: "الاسم يجب أن يكون على الأقل حرفين",
                      },
                    })}
                    className={`w-full px-3 py-2 bg-slate-700/50 border ${errors.name ? "border-red-500/50" : "border-slate-600/50"
                      } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    placeholder="أدخل اسم العميل"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register("phone", {
                      pattern: {
                        value: /^[0-9]{9,10}$/,
                        message: "رقم هاتف غير صالح",
                      },
                    })}
                    className={`w-full px-3 py-2 bg-slate-700/50 border ${errors.phone ? "border-red-500/50" : "border-slate-600/50"
                      } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    placeholder="أدخل رقم الهاتف"
                    dir="ltr"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Category Field */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    التصنيف
                  </label>
                  {categories.length > 0 ? (
                    <>
                      <select
                        id="categoryId"
                        {...register("categoryId")}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <option value="">بدون تصنيف</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      {selectedCategoryId && (
                        <div className="mt-2 flex">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Tag className="h-3 w-3" />
                            {categories.find(
                              (c) => c.id === Number(selectedCategoryId)
                            )?.name}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-slate-400">
                      لا توجد تصنيفات متاحة. يمكنك <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('add-category'))} className="text-purple-400 hover:underline">إضافة تصنيف جديد</button> أولاً.
                    </div>
                  )}
                </div>

                {/* Notes Field */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    ملاحظات
                  </label>
                  <textarea
                    id="notes"
                    {...register("notes")}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="أضف ملاحظات (اختياري)"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-2"
                  disabled={isCreating || isUpdating || (mode === "create" && categories.length === 0)}
                >
                  {(isCreating || isUpdating) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {mode === "create"
                    ? isCreating
                      ? "جاري الإضافة..."
                      : "إضافة العميل"
                    : isUpdating
                      ? "جاري التحديث..."
                      : "تحديث البيانات"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
export default CustomerModal