"use client";

import React, { useState } from "react";
import { X, Save, Loader2, Clock } from "lucide-react";
import { UpdateWorkshopHoursDTO, WorkshopHours } from "@/types/workshops/workshop.type";
import { useUpdateWorkshopHours } from "@/hooks/workshops/useWorkshops";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface EditHoursModalProps {
  workshopId: number;
  hoursRecord: WorkshopHours;
  onClose: () => void;
  onSuccess: () => void;
}

const EditHoursModal: React.FC<EditHoursModalProps> = ({
  workshopId,
  hoursRecord,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    hours: hoursRecord.hours.toString(),
    hourlyRate: hoursRecord.hourlyRate.toString(),
    notes: hoursRecord.notes || ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateHoursMutation = useUpdateWorkshopHours();
  const isLoading = updateHoursMutation.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hours || parseFloat(formData.hours) <= 0) {
      newErrors.hours = "عدد الساعات يجب أن يكون أكبر من صفر";
    }

    if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
      newErrors.hourlyRate = "سعر الساعة يجب أن يكون أكبر من صفر";
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
      const updateData: UpdateWorkshopHoursDTO = {
        hours: parseFloat(formData.hours),
        hourlyRate: parseFloat(formData.hourlyRate),
        notes: formData.notes || undefined
      };

      await updateHoursMutation.mutateAsync({
        workshopId,
        hoursRecordId: hoursRecord.id,
        data: updateData,
      });

      toast.success("تم تعديل ساعات العمل بنجاح");
      onSuccess();
    } catch (error) {
      console.error("Error updating hours:", error);
      toast.error("حدث خطأ أثناء تعديل ساعات العمل");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ar-SY", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotal = () => {
    const hours = parseFloat(formData.hours) || 0;
    const rate = parseFloat(formData.hourlyRate) || 0;
    return hours * rate;
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
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-amber-400" />
              <h2 className="text-xl font-semibold text-white">
                تعديل ساعات العمل
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
            {/* Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                عدد الساعات *
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.hours}
                onChange={(e) => handleChange("hours", e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                  ${errors.hours ? "border-red-500" : "border-white/10"}`}
                placeholder="0"
              />
              {errors.hours && (
                <p className="mt-1 text-sm text-red-400">{errors.hours}</p>
              )}
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                سعر الساعة *
              </label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => handleChange("hourlyRate", e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                  ${errors.hourlyRate ? "border-red-500" : "border-white/10"}`}
                placeholder="0"
              />
              {errors.hourlyRate && (
                <p className="mt-1 text-sm text-red-400">{errors.hourlyRate}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30
                  transition-all resize-none"
                placeholder="ملاحظات إضافية..."
                rows={3}
              />
            </div>

            {/* Total Amount Display */}
            {formData.hours && formData.hourlyRate && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 text-sm">المبلغ الإجمالي:</span>
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(calculateTotal())}
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

export default EditHoursModal;
