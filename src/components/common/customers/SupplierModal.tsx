"use client";
import { useState, useEffect } from "react";
import { X, Save, Trash2, UserPlus, UserCheck } from "lucide-react";
import {
  AllCustomerType,
  CustomerTypeEnum,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/types/customers.type";
import { CustomerCategory } from "@/types/customerCategories.types";
import {
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/customers/useCustomers";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "update" | "delete";
  supplierData: AllCustomerType | null;
  categories: CustomerCategory[];
}

const SupplierModal = ({
  isOpen,
  onClose,
  mode,
  supplierData,
  categories,
}: SupplierModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    categoryId: 0,
    notes: "",
    customerType: CustomerTypeEnum.SUPPLIER,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Use the custom hooks for API operations
  const { mutateAsync: createCustomer, isPending: isCreating } =
    useCreateCustomer();
  const { mutateAsync: updateCustomer, isPending: isUpdating } =
    useUpdateCustomer();
  const { mutateAsync: deleteCustomer, isPending: isDeleting } =
    useDeleteCustomer();

  const isLoading = isCreating || isUpdating || isDeleting;

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        setFormData({
          name: "",
          phone: "",
          categoryId: 0,
          notes: "",
          customerType: CustomerTypeEnum.SUPPLIER,
        });
      } else if (mode === "update" && supplierData) {
        setFormData({
          name: supplierData.name || "",
          phone: supplierData.phone || "",
          categoryId: supplierData.categoryId || 0,
          notes: supplierData.notes || "",
          customerType: CustomerTypeEnum.SUPPLIER,
        });
      }
      setError("");
      setSuccess(false);
    }
  }, [isOpen, mode, supplierData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError("اسم المورد مطلوب");
        return;
      }

      // Prepare the data with customerType always included
      const requestData = {
        ...formData,
        customerType: CustomerTypeEnum.SUPPLIER, // Always ensure this is set
      };

      // Make API call based on mode
      if (mode === "create") {
        await createCustomer(requestData as CreateCustomerRequest);
        console.log("Supplier created successfully:", requestData);
        setSuccess(true);
        setTimeout(() => {
          onClose(); // Close modal after showing success message
        }, 1500);
      } else if (mode === "update" && supplierData?.id) {
        await updateCustomer({
          id: supplierData.id,
          ...requestData,
        } as UpdateCustomerRequest & { id: number });
        console.log("Supplier updated successfully:", requestData);
        setSuccess(true);
        setTimeout(() => {
          onClose(); // Close modal after showing success message
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err.message || "حدث خطأ أثناء حفظ البيانات";
      setError(errorMessage);
      console.error("Error saving supplier:", err);
    }
  };

  const handleDelete = async () => {
    if (!supplierData?.id) return;

    setError("");

    try {
      await deleteCustomer(supplierData.id);
      console.log("Supplier deleted successfully:", supplierData.id);
      onClose(); // Close modal on success
    } catch (err: any) {
      const errorMessage = err.message || "حدث خطأ أثناء حذف المورد";
      setError(errorMessage);
      console.error("Error deleting supplier:", err);
    }
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "إضافة مورد جديد";
      case "update":
        return "تعديل بيانات المورد";
      case "delete":
        return "حذف المورد";
      default:
        return "";
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case "create":
        return "أدخل بيانات المورد الجديد";
      case "update":
        return "قم بتعديل بيانات المورد";
      case "delete":
        return `هل أنت متأكد من حذف المورد "${supplierData?.name}"؟`;
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">{getModalTitle()}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {getModalDescription()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === "delete" ? (
            // Delete Confirmation
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-slate-300 mb-6">
                لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع البيانات المرتبطة
                بهذا المورد.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? "جاري الحذف..." : "حذف"}
                </button>
              </div>
            </div>
          ) : (
            // Create/Update Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden input for customerType to ensure it's always submitted */}
              <input
                type="hidden"
                name="customerType"
                value={CustomerTypeEnum.SUPPLIER}
              />

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  اسم المورد <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم المورد"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم الهاتف"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  التصنيف
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value={0}>بدون تصنيف</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ملاحظات
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أضف ملاحظات (اختياري)"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>

              {/* Success Display */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm">
                    {mode === "create"
                      ? "تم إضافة المورد بنجاح!"
                      : "تم تحديث بيانات المورد بنجاح!"}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : mode === "create" ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      إضافة المورد
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      حفظ التغييرات
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierModal;
