"use client";

import React, { useState } from "react";
import { X, Save, Loader2, Activity, Plus, Trash2 } from "lucide-react";
import { ProductionItemDTO, UpdateWorkshopProductionDTO, WorkshopProduction } from "@/types/workshops/workshop.type";
import { useUpdateWorkshopProduction } from "@/hooks/workshops/useWorkshops";
import { useItems } from "@/hooks/items/useItems";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface EditProductionModalProps {
  workshopId: number;
  production: WorkshopProduction;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductionModal: React.FC<EditProductionModalProps> = ({
  workshopId,
  production,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    notes: production.notes || "",
    items: production.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity
    })) as ProductionItemDTO[]
  });
  const [currentItem, setCurrentItem] = useState({
    itemId: "",
    quantity: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateProductionMutation = useUpdateWorkshopProduction();
  const { data: items } = useItems();
  const isLoading = updateProductionMutation.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.items.length === 0) {
      newErrors.items = "يجب إضافة منتج واحد على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const updateData: UpdateWorkshopProductionDTO = {
        items: formData.items,
        notes: formData.notes || undefined
      };

      await updateProductionMutation.mutateAsync({
        workshopId,
        productionRecordId: production.id,
        data: updateData,
      });

      toast.success("تم تعديل الإنتاج بنجاح");
      onSuccess();
    } catch (error) {
      console.error("Error updating production:", error);
      toast.error("حدث خطأ أثناء تعديل الإنتاج");
    }
  };

  const handleAddItem = () => {
    if (!currentItem.itemId || !currentItem.quantity) {
      toast.error("يجب اختيار منتج وإدخال الكمية");
      return;
    }

    const newItem: ProductionItemDTO = {
      itemId: parseInt(currentItem.itemId),
      quantity: parseFloat(currentItem.quantity)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setCurrentItem({ itemId: "", quantity: "" });
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: "" }));
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity: parseFloat(quantity) || 0 } : item
      )
    }));
  };

  const getItemName = (itemId: number) => {
    const item = items?.find(item => item.id === itemId);
    return item?.name || production.items.find(i => i.itemId === itemId)?.itemName || "";
  };

  const getItemRate = (itemId: number) => {
    const item = items?.find(item => item.id === itemId);
    return item?.productionRate || production.items.find(i => i.itemId === itemId)?.rate || 0;
  };

  const calculateItemTotal = (item: ProductionItemDTO) => {
    const rate = getItemRate(item.itemId);
    return item.quantity * rate;
  };

  const calculateGrandTotal = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ar-SY", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          dir="rtl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-white/10 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-amber-400" />
              <h2 className="text-xl font-semibold text-white">
                تعديل الإنتاج
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Existing Items List */}
            {formData.items.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  المنتجات
                </label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="text-white text-sm">
                          {getItemName(item.itemId)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          السعر: {formatCurrency(getItemRate(item.itemId))}
                        </div>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center
                          focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                      <div className="text-sm text-green-400 w-20 text-left">
                        {formatCurrency(calculateItemTotal(item))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.items && (
              <p className="text-sm text-red-400">{errors.items}</p>
            )}

            {/* Add Item Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                إضافة منتج جديد
              </label>
              <div className="flex gap-2">
                <select
                  value={currentItem.itemId}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, itemId: e.target.value }))}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                >
                  <option value="">اختر منتج...</option>
                  {items?.filter(item => item.productionRate && item.productionRate > 0).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.productionRate!)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  placeholder="الكمية"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-3 bg-green-500/20 text-green-400 rounded-lg
                    hover:bg-green-500/30 transition-colors border border-green-500/30"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30
                  transition-all resize-none"
                placeholder="ملاحظات إضافية..."
                rows={3}
              />
            </div>

            {/* Grand Total */}
            {formData.items.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-300 text-sm">المبلغ الإجمالي:</span>
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(calculateGrandTotal())}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                  bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    حفظ التعديلات
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-slate-300
                  hover:bg-white/5 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProductionModal;
