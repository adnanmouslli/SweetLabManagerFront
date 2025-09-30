"use client";

import React, { useState } from "react";
import { X, Save, Loader2, Activity, Plus, Trash2 } from "lucide-react";
import { CreateWorkshopProductionDTO, ProductionItemDTO } from "@/types/workshops/workshop.type";
import { useAddWorkshopProduction } from "@/hooks/workshops/useWorkshops";
import { useItems } from "@/hooks/items/useItems";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface WorkshopProductionModalProps {
  workshopId: number;
  password: string;
  onClose: () => void;
  onSuccess: () => void;
}

const WorkshopProductionModal: React.FC<WorkshopProductionModalProps> = ({
  workshopId,
  password,
  onClose,
  onSuccess
}) => {
  // Initialize date with current date at 8:00 AM
  const today = new Date();
  today.setHours(8, 0, 0, 0);

  const [formData, setFormData] = useState({
    date: today.toISOString().split('T')[0], // Store only the date part for the input
    notes: "",
    items: [] as ProductionItemDTO[]
  });
  const [currentItem, setCurrentItem] = useState({
    itemId: "",
    quantity: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addProductionMutation = useAddWorkshopProduction();
  const { data: items } = useItems();
  const isLoading = addProductionMutation.isPending;

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
      // Convert date to ISO string with 8:00 AM time
      const dateWithTime = new Date(formData.date);
      dateWithTime.setHours(8, 0, 0, 0);

      const productionData: CreateWorkshopProductionDTO = {
        date: dateWithTime.toISOString(),
        items: formData.items,
        notes: formData.notes || undefined
      };

      await addProductionMutation.mutateAsync({
        workshopId,
        data: productionData,
      });

      toast.success("تم إضافة الإنتاج بنجاح");
      onSuccess();
    } catch (error) {
      console.error("Error adding production:", error);
      toast.error("حدث خطأ أثناء إضافة الإنتاج");
    }
  };

  const handleAddItem = () => {
    if (!currentItem.itemId || !currentItem.quantity) {
      toast.error("يجب اختيار منتج وإدخال الكمية");
      return;
    }

    const selectedItem = items?.find(item => item.id === parseInt(currentItem.itemId));
    if (!selectedItem) return;

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

  const getItemName = (itemId: number) => {
    const item = items?.find(item => item.id === itemId);
    return item?.name || "";
  };

  const getItemRate = (itemId: number) => {
    const item = items?.find(item => item.id === itemId);
    return item?.productionRate || 0;
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
              <Activity className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">
                إضافة إنتاج
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
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                التاريخ
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>

            {/* Add Item Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                إضافة منتج
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
                      {item.name} - {formatCurrency(item.productionRate)}
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

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  المنتجات المضافة
                </label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="text-white">
                          {getItemName(item.itemId)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {item.quantity} × {formatCurrency(getItemRate(item.itemId))} = {formatCurrency(calculateItemTotal(item))}
                        </div>
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
                  bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors
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
                    حفظ الإنتاج
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

export default WorkshopProductionModal;
