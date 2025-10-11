"use client";

import React, { useState } from "react";
import { X, Save, Loader2, Clock } from "lucide-react";
import { Employee, WorkType } from "@/types/employees.type";
import { CreateWorkshopHoursDTO } from "@/types/workshops/workshop.type";
import { useAddWorkshopHours } from "@/hooks/workshops/useWorkshops";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface WorkshopHoursModalProps {
  workshopId: number;
  workType: WorkType;
  employees: Employee[];
  password: string;
  onClose: () => void;
  onSuccess: () => void;
}

const HOURLY_RATE_KEY = 'workshop_default_hourly_rate';
const DEFAULT_RATE = '1000';

const WorkshopHoursModal: React.FC<WorkshopHoursModalProps> = ({
  workshopId,
  workType,
  employees,
  password,
  onClose,
  onSuccess
}) => {
  // Initialize date with current date at 8:00 AM
  const today = new Date();
  today.setHours(8, 0, 0, 0);

    // Load default hourly rate from localStorage
  const getDefaultHourlyRate = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(HOURLY_RATE_KEY) || DEFAULT_RATE;
    }
    return DEFAULT_RATE;
  };


  const [formData, setFormData] = useState({
    employeeId: "",
    hours: "",
    hourlyRate: getDefaultHourlyRate(),
    date: today.toISOString().split('T')[0], // Store only the date part for the input
    notes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addHoursMutation = useAddWorkshopHours();
  const isLoading = addHoursMutation.isPending;

  // Filter employees by work type
  const eligibleEmployees = employees.filter(emp => emp.workType === workType);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = "يجب اختيار موظف";
    }

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

      if (typeof window !== 'undefined') {
        localStorage.setItem(HOURLY_RATE_KEY, formData.hourlyRate);
      }


      // Convert date to ISO string with 8:00 AM time
      const dateWithTime = new Date(formData.date);
      dateWithTime.setHours(8, 0, 0, 0);

      const hoursData: CreateWorkshopHoursDTO = {
        employeeId: parseInt(formData.employeeId),
        hours: parseFloat(formData.hours),
        hourlyRate: parseFloat(formData.hourlyRate),
        date: dateWithTime.toISOString(),
        notes: formData.notes || undefined
      };

      await addHoursMutation.mutateAsync({
        workshopId,
        data: hoursData,
      });

      toast.success("تم إضافة ساعات العمل بنجاح");
      onSuccess();
    } catch (error) {
      console.error("Error adding hours:", error);
      toast.error("حدث خطأ أثناء إضافة ساعات العمل");
    }
  };

  const handleChange = (field: string, value: any) => {
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
              <Clock className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">
                إضافة ساعات عمل
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
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                الموظف *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => handleChange("employeeId", e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all
                  ${errors.employeeId ? "border-red-500" : "border-white/10"}`}
              >
                <option value="">اختر موظف...</option>
                {eligibleEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-400">{errors.employeeId}</p>
              )}
              {eligibleEmployees.length === 0 && (
                <p className="mt-1 text-sm text-yellow-400">
                  لا يوجد موظفين بالساعة في هذه الورشة
                </p>
              )}
            </div>

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

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                التاريخ
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
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
                disabled={isLoading || eligibleEmployees.length === 0}
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
                    حفظ الساعات
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

export default WorkshopHoursModal;
