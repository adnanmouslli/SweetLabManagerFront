"use client";

import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useMokkBar } from "@/components/providers/MokkBarContext";
import { Role, useRoles } from "@/hooks/users/useRoles";
import { useRemoveEmployeeFromWorkshop, useWorkshopFinancialSummary } from "@/hooks/workshops/useWorkshops";
import { WorkType } from "@/types/employees.type";
import { Workshop } from "@/types/workshops/workshop.type";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Calendar, ChevronDown, ChevronRight, Clock, DollarSign, FileText, Package, PersonStanding, Plus, Trash2, User, Users, X } from "lucide-react";
import React, { useState } from "react";
import AddEmployeeToWorkshopModal from "./AddEmployeeToWorkshopModal";
import WorkshopHoursModal from "./WorkshopHoursModal";
import WorkshopProductionModal from "./WorkshopProductionModal";
import WorkshopSettlementModal from "./WorkshopSettlementModal";
import { formatDate } from "@/utils/formatters";

// Enhanced employee withdrawal type that includes employee name and handles both date formats
interface EnhancedEmployeeWithdrawal {
  id: number;
  employeeId: number;
  amount: number;
  withdrawalType: string;
  fundId: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employeeName: string;
  date?: string; // Optional date property from the API response
}

interface WorkshopDetailsModalProps {
  workshop: Workshop;
  password: string;
  onClose: () => void;
  onUpdate?: () => void;
}

const WorkshopDetailsModal: React.FC<WorkshopDetailsModalProps> = ({ workshop, password, onClose, onUpdate }) => {
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "employees" | "activities">("summary");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<{ id: number; name: string } | null>(null);

  const { hasAnyRole } = useRoles();
  const { setSnackbarConfig } = useMokkBar();
  const removeEmployeeFromWorkshop = useRemoveEmployeeFromWorkshop();

  const canManageWorkshops = hasAnyRole([
    Role.ADMIN,
    Role.MANAGER,
    Role.TreasuryManager,
  ]);

  // Get financial summary for the current month
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

  const { data: financialSummary } = useWorkshopFinancialSummary(
    workshop.id,
    { startDate, endDate },
  );

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ar-SY", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRemoveEmployee = async (employeeId: number, employeeName: string) => {
    setEmployeeToRemove({ id: employeeId, name: employeeName });
    setShowConfirmDialog(true);
  };

  const confirmRemoveEmployee = async () => {
    if (!employeeToRemove) return;

    try {
      await removeEmployeeFromWorkshop.mutateAsync({
        workshopId: workshop.id,
        employeeId: employeeToRemove.id,
      });

      setSnackbarConfig({
        open: true,
        severity: "success",
        message: `تم إزالة ${employeeToRemove.name} من الورشة بنجاح`,
      });

      // Call onUpdate to refresh the workshop data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error removing employee from workshop:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "حدث خطأ أثناء إزالة الموظف",
      });
    } finally {
      setShowConfirmDialog(false);
      setEmployeeToRemove(null);
    }
  };


  const stats = [
    {
      title: "إجمالي الدخل",
      icon: <Activity className="h-5 w-5 text-green-400" />,
      value: financialSummary?.totalEarnings || 0,
      color: "from-green-500/10 to-green-900/10",
    },
    {
      title: "إجمالي السحب",
      icon: <Activity className="h-5 w-5 text-blue-400" />,
      value: financialSummary?.totalWithdrawals || 0,
      color: "from-blue-500/10 to-blue-900/10",
    },
    {
      title: "الرصيد الحالي",
      icon: <DollarSign className="h-5 w-5 text-yellow-400" />,
      value: financialSummary?.netAmount || 0,
      color: "from-yellow-500/10 to-yellow-900/10",
    },
    {
      title: "إجمالي الديون",
      icon: <Activity className="h-5 w-5 text-red-400" />,
      value: financialSummary?.totalDebt || 0,
      color: "from-red-500/10 to-red-900/10",
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return (
          <div className="space-y-6 ">
            {
              stats.map((card, index) => (
                <div
                  key={index}
                  className={`
                  relative bg-gradient-to-br ${card.color}
                  backdrop-blur-lg border border-white/10 
                  rounded-xl p-5 shadow-sm hover:shadow-md 
                  transition-all duration-300 hover:-translate-y-1
                  overflow-hidden group
                `}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300   "></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {card.icon}
                      <span className="text-sm font-medium text-slate-300">{card.title}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-white tracking-tight">
                    {formatCurrency(card.value)}
                  </div>
                  {/* Subtle bottom border animation */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white/30 group-hover:w-full transition-all duration-300"></div>
                </div>
              ))
            }
            {/* Actions */}
            {canManageWorkshops && (
              <div className="flex flex-wrap gap-3">
                {workshop.workType === WorkType.HOURLY && (
                  <button
                    onClick={() => setShowHoursModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 
                      text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    إضافة ساعات عمل
                  </button>
                )}

                {workshop.workType === WorkType.PRODUCTION && (
                  <button
                    onClick={() => setShowProductionModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 
                      text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                  >
                    <Activity className="h-4 w-4" />
                    إضافة إنتاج
                  </button>
                )}

                <button
                  onClick={() => setShowSettlementModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 
                    text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  محاسبة الورشة                </button>
              </div>
            )}
          </div>
        );

      case "employees":
        return (
          <div className="space-y-4">
            {workshop.employees && workshop.employees.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">
                    الموظفون في الورشة ({workshop.employees.length})
                  </h3>
                  {canManageWorkshops && (
                    <button
                      onClick={() => setShowAddEmployeeModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 
                        text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة موظف
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {workshop.employees.map((employee, index) => {
                    if (!employee || !employee.id) return null;

                    // Calculate total withdrawals for this employee
                    const totalWithdrawals = employee.withdrawals?.reduce(
                      (sum, withdrawal) => sum + withdrawal.amount,
                      0
                    ) || 0;

                    return (
                      <div
                        key={`employee-${employee.id + " - " + index}`}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-white font-medium">{employee.name}</h4>
                              {totalWithdrawals > 0 && (
                                <span className="px-2 py-0.5 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                                  سحب: {formatCurrency(totalWithdrawals)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{employee.phone || "لا يوجد رقم هاتف"}</p>

                            {/* Financial Summary Cards */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                                <div className="text-xs text-green-300 mb-1">إجمالي الرواتب</div>
                                <div className="text-sm font-bold text-green-400">
                                  {formatCurrency(employee.financialSummary?.totalSalaries || 0)}
                                </div>
                              </div>
                              <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                <div className="text-xs text-blue-300 mb-1">عدد السحوبات</div>
                                <div className="text-sm font-bold text-blue-400">
                                  {employee.financialSummary?.withdrawalsCount || 0}
                                </div>
                              </div>
                              <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                <div className="text-xs text-red-300 mb-1">إجمالي الديون</div>
                                <div className="text-sm font-bold text-red-400">
                                  {formatCurrency(employee.financialSummary?.debtAmount || 0)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium
                                 ${employee.workType === WorkType.HOURLY
                                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                  : "bg-green-500/10 text-green-400 border border-green-500/20"
                                }`}
                            >
                              {employee.workType === WorkType.HOURLY ? "بالساعة" : "بالإنتاج"}
                            </span>
                            {canManageWorkshops && (
                              <button
                                onClick={() => handleRemoveEmployee(employee.id, employee.name)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 
                                   border border-red-500/20 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400">لا يوجد موظفون في هذه الورشة</p>
                {canManageWorkshops && (
                  <button
                    onClick={() => setShowAddEmployeeModal(true)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 
                      text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة موظف
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case "activities":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">تفاصيل الأنشطة المالية</h3>

            {workshop.workType === WorkType.PRODUCTION && (
              <>
                {workshop.productionRecords && workshop.productionRecords.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm text-slate-400 font-medium">سجلات الإنتاج</h4>
                    {workshop.productionRecords.map((record, index) => {
                      if (!record || !record.id) return null;
                      return (
                        <CollapsibleActivityRow
                          key={`production-${record.id}-${index}`}
                          id={`production-${record.id}-${index}`}
                          title={`إنتاج ${formatDate(record.date)}`}
                          icon={<Activity className="h-4 w-4 text-green-400" />}
                          summary={`${record.items.length} منتج • ${formatDate(record.date)}`}
                          amount={record.totalProduction}
                          amountColor="text-green-400"
                          date={record.date}
                          badge={record.items.length > 3 ? "إنتاج كثيف" : "إنتاج عادي"}
                          badgeColor={record.items.length > 3 ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"}
                        >
                          {/* Production Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <div className="text-green-400 text-sm">إجمالي الإنتاج</div>
                              <div className="text-white text-xl font-bold">{formatCurrency(record.totalProduction)}</div>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <div className="text-blue-400 text-sm">عدد المنتجات</div>
                              <div className="text-white text-xl font-bold">{record.items.length}</div>
                            </div>
                          </div>

                          {/* Production Items Details */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-white border-b border-white/10 pb-2">تفاصيل المنتجات</h5>
                            <div className="grid gap-2">
                              {record.items.map((item, itemIndex) => (
                                <div key={`production-${record.id}-item-${itemIndex}`}
                                  className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                      <Package className="h-4 w-4 text-green-400" />
                                    </div>
                                    <div>
                                      <span className="text-white font-medium">{item.itemName}</span>
                                      <div className="text-xs text-slate-400">
                                        الكمية: {item.quantity} • السعر: {formatCurrency(item.rate)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-green-400 font-medium">{formatCurrency(item.total)}</div>
                                    <div className="text-xs text-slate-400">
                                      {item.quantity} × {formatCurrency(item.rate)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Additional Production Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-purple-400" />
                                <span className="text-slate-400">تاريخ الإنتاج:</span>
                                <span className="text-white">{formatDate(record.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-cyan-400" />
                                <span className="text-slate-400">معدل الإنتاج:</span>
                                <span className="text-white">{(record.totalProduction / record.items.length).toFixed(0)} لكل منتج</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-400" />
                                <span className="text-slate-400">إجمالي الكمية:</span>
                                <span className="text-white">{record.items.reduce((sum, item) => sum + item.quantity, 0)} قطعة</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-yellow-400" />
                                <span className="text-slate-400">متوسط السعر:</span>
                                <span className="text-white">{formatCurrency(record.totalProduction / record.items.reduce((sum, item) => sum + item.quantity, 0))}</span>
                              </div>
                            </div>
                          </div>
                        </CollapsibleActivityRow>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Enhanced Hour Records (for hourly workshops) */}
            {workshop.workType === WorkType.HOURLY && (
              <>
                {financialSummary?.dailySummary && financialSummary.dailySummary.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm text-slate-400 font-medium">سجلات ساعات العمل</h4>
                    {financialSummary.dailySummary.slice(0, 5).map((dailySummary, index) => {
                      if (!dailySummary.employees || dailySummary.employees.length === 0) return null;
                      return (
                        <CollapsibleActivityRow
                          key={`daily-${index}`}
                          id={`daily-${index}`}
                          title={`ساعات ${formatDate(dailySummary.date)}`}
                          icon={<Clock className="h-4 w-4 text-cyan-400" />}
                          summary={`${dailySummary.totalHours} ساعة • ${dailySummary.employees.length} موظف`}
                          amount={dailySummary.totalAmount || 0}
                          amountColor="text-cyan-400"
                          date={dailySummary.date}
                          badge={dailySummary.totalHours && dailySummary.totalHours > 20 ? "يوم مكثف" : "يوم عادي"}
                          badgeColor={dailySummary.totalHours && dailySummary.totalHours > 20 ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}
                        >
                          {/* Daily Summary Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                              <div className="text-cyan-400 text-sm">إجمالي الساعات</div>
                              <div className="text-white text-xl font-bold">{dailySummary.totalHours}</div>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <div className="text-green-400 text-sm">إجمالي المبلغ</div>
                              <div className="text-white text-xl font-bold">{formatCurrency(dailySummary.totalAmount || 0)}</div>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                              <div className="text-purple-400 text-sm">عدد الموظفين</div>
                              <div className="text-white text-xl font-bold">{dailySummary.employees.length}</div>
                            </div>
                          </div>

                          {/* Employee Details */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-white border-b border-white/10 pb-2">تفاصيل الموظفين</h5>
                            {dailySummary.employees.map((employeeRecord, empIndex) => (
                              <div key={`hour-${index}-${empIndex}`}
                                className="p-3 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                      <User className="h-5 w-5 text-cyan-400" />
                                    </div>
                                    <div>
                                      <span className="text-white font-medium">{employeeRecord.employeeName}</span>
                                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mt-1">
                                        <div>ساعات العمل: {employeeRecord.hours}h</div>
                                        <div>معدل الساعة: {formatCurrency(employeeRecord.hourlyRate)}</div>
                                        <div>الإجمالي: {formatCurrency(employeeRecord.amount)}</div>
                                        <div>المعدل/ساعة: {formatCurrency(employeeRecord.amount / employeeRecord.hours)}</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-cyan-400 font-medium">
                                      {formatCurrency(employeeRecord.amount)}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {employeeRecord.hours}h × {formatCurrency(employeeRecord.hourlyRate)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Daily Statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-slate-400">متوسط ساعات/موظف</div>
                              <div className="text-white font-medium">
                                {(dailySummary.totalHours! / dailySummary.employees.length).toFixed(1)}h
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-slate-400">متوسط معدل/ساعة</div>
                              <div className="text-white font-medium">
                                {formatCurrency(dailySummary.totalAmount! / dailySummary.totalHours!)}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-slate-400">أعلى معدل</div>
                              <div className="text-white font-medium">
                                {formatCurrency(Math.max(...dailySummary.employees.map(e => e.hourlyRate)))}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-slate-400">أقل معدل</div>
                              <div className="text-white font-medium">
                                {formatCurrency(Math.min(...dailySummary.employees.map(e => e.hourlyRate)))}
                              </div>
                            </div>
                          </div>
                        </CollapsibleActivityRow>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Enhanced Employee Withdrawals */}
            {workshop.employees && workshop.employees.some(emp => emp.withdrawals && emp.withdrawals.length > 0) && (
              <div className="space-y-3">
                <h4 className="text-sm text-slate-400 font-medium">سحوبات الموظفين</h4>
                {(() => {
                  const allWithdrawals = workshop.employees
                    .filter(emp => emp.withdrawals && emp.withdrawals.length > 0)
                    .flatMap(emp =>
                      emp.withdrawals!.map(withdrawal => ({
                        ...withdrawal,
                        employeeName: emp.name
                      }))
                    )
                    .sort((a, b) => {
                      const dateA = (a as EnhancedEmployeeWithdrawal).date ? new Date((a as EnhancedEmployeeWithdrawal).date!) : new Date(a.createdAt);
                      const dateB = (b as EnhancedEmployeeWithdrawal).date ? new Date((b as EnhancedEmployeeWithdrawal).date!) : new Date(b.createdAt);
                      return dateB.getTime() - dateA.getTime();
                    });

                  return allWithdrawals.slice(0, 5).map((withdrawal, index) => {
                    const enhancedWithdrawal = withdrawal as EnhancedEmployeeWithdrawal;
                    const withdrawalDate = enhancedWithdrawal.date ? new Date(enhancedWithdrawal.date) : new Date(enhancedWithdrawal.createdAt);

                    return (
                      <CollapsibleActivityRow
                        key={`withdrawal-${enhancedWithdrawal.id}-${index}`}
                        id={`withdrawal-${enhancedWithdrawal.id}-${index}`}
                        title={`سحب ${enhancedWithdrawal.employeeName}`}
                        icon={<DollarSign className="h-4 w-4 text-red-400" />}
                        summary={`${format(withdrawalDate, "dd MMMM yyyy", { locale: ar })} • ${enhancedWithdrawal.withdrawalType === 'salary_advance' ? 'سلفة' : 'دين'}`}
                        amount={enhancedWithdrawal.amount}
                        amountColor="text-red-400"
                        date={enhancedWithdrawal.date || enhancedWithdrawal.createdAt}
                        badge={enhancedWithdrawal.withdrawalType === 'salary_advance' ? 'سلفة' : 'دين'}
                        badgeColor={enhancedWithdrawal.withdrawalType === 'salary_advance' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}
                      >
                        {/* Withdrawal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                            <div className="text-red-400 text-sm">مبلغ السحب</div>
                            <div className="text-white text-xl font-bold">{formatCurrency(enhancedWithdrawal.amount)}</div>
                          </div>
                          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <div className="text-blue-400 text-sm">نوع السحب</div>
                            <div className="text-white text-lg font-medium">
                              {enhancedWithdrawal.withdrawalType === 'salary_advance' ? 'سلفة راتب' : 'دين شخصي'}
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-400" />
                              <span className="text-slate-400">اسم الموظف:</span>
                              <span className="text-white">{enhancedWithdrawal.employeeName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-400" />
                              <span className="text-slate-400">تاريخ السحب:</span>
                              <span className="text-white">{format(withdrawalDate, "dd MMMM yyyy", { locale: ar })}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-cyan-400" />
                              <span className="text-slate-400">وقت السحب:</span>
                              <span className="text-white">{format(withdrawalDate, "HH:mm", { locale: ar })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-yellow-400" />
                              <span className="text-slate-400">رقم المعاملة:</span>
                              <span className="text-white">#{enhancedWithdrawal.id}</span>
                            </div>
                          </div>
                        </div>

                        {enhancedWithdrawal.notes && (
                          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-blue-400 mt-0.5" />
                              <div>
                                <span className="text-blue-400 text-sm font-medium">ملاحظات:</span>
                                <p className="text-white text-sm mt-1">{enhancedWithdrawal.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CollapsibleActivityRow>
                    );
                  });
                })()}
              </div>
            )}


            {/* Activity Details Summary */}
            {workshop.settlements && workshop.settlements.length > 0 && (
              <div className="space-y-3">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="text-right text-slate-300 p-4 font-medium">تاريخ المحاسبة</th>
                          <th className="text-right text-slate-300 p-4 font-medium">الدخل</th>
                          <th className="text-right text-slate-300 p-4 font-medium">السحب الكلي</th>
                          <th className="text-right text-slate-300 p-4 font-medium">المبلغ المستحق</th>
                          <th className="text-right text-slate-300 p-4 font-medium">المبلغ المأخوذ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workshop.settlements.map((settlement, index) => {
                          if (!settlement || !settlement.id) return null;

                          // استخدام القيم المحفوظة في settlement بدلاً من الحساب
                          const totalEarnings = settlement.totalEarnings || 0;
                          const totalWithdrawals = settlement.totalWithdrawals || 0;

                          return (
                            <motion.tr
                              key={`activity-detail-${settlement.id}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-t border-slate-600/30 hover:bg-slate-700/20 transition-colors"
                            >
                              <td className="p-4 text-slate-200">
                                {formatDate(settlement.date)}
                              </td>
                              <td className="p-4 text-slate-200">
                                <span className="text-green-400 font-medium">
                                  {formatCurrency(totalEarnings)}
                                </span>
                              </td>
                              <td className="p-4 text-slate-200">
                                <span className="text-red-400 font-medium">
                                  {formatCurrency(totalWithdrawals)}
                                </span>
                              </td>
                              <td className="p-4 text-slate-200">
                                <span className="text-blue-400 font-medium">
                                  {formatCurrency(settlement.amount)}
                                </span>
                              </td>
                              <td className="p-4 text-slate-200">
                                <span className="text-emerald-400 font-medium">
                                  {formatCurrency(settlement.paidAmount)}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        );

      default:
        return null;
    }
  };


  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Enhanced CollapsibleActivityRow component
  const CollapsibleActivityRow: React.FC<{
    id: string;
    title: string;
    icon: React.ReactNode;
    summary: string;
    amount: number;
    amountColor: string;
    children: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    date: string;
  }> = ({ id, title, icon, summary, amount, amountColor, children, badge, badgeColor, date }) => {
    const isExpanded = expandedItems[id];

    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleExpanded(id)}
          className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon}
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{title}</span>
                {badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${badgeColor}`}>
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-sm">{summary}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${amountColor}`}>
              {formatCurrency(amount)}
            </span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-white/10 p-4 bg-white/[0.02] space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  };






  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          dir="rtl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 w-full max-w-3xl 
            shadow-2xl border border-white/10 max-h-[80vh] overflow-y-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">{workshop.name}</h2>
              <p className="text-sm text-slate-400 mt-1">
                نوع العمل: {workshop.workType === WorkType.HOURLY ? "بالساعة" : "بالإنتاج"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 mb-6">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "summary"
                ? "text-white border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
                }`}
            >
              الملخص المالي
            </button>
            <button
              onClick={() => setActiveTab("employees")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "employees"
                ? "text-white border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
                }`}
            >
              الموظفون
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "activities"
                ? "text-white border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
                }`}
            >
              الأنشطة
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {renderTabContent()}
          </div>
        </motion.div>
      </motion.div>

      {/* Sub-modals */}
      {showAddEmployeeModal && (
        <AddEmployeeToWorkshopModal
          workshopId={workshop.id}
          workshopName={workshop.name}
          workshopType={workshop.workType}
          currentEmployeeIds={workshop.employees?.map(e => e.id).filter(id => id !== undefined && id !== null) || []}
          password={password}
          onClose={() => setShowAddEmployeeModal(false)}
          onSuccess={() => {
            setShowAddEmployeeModal(false);
            // The main modal will be refreshed by the parent component
            if (onUpdate) {
              onUpdate();
            }
          }}
        />
      )}

      {showProductionModal && (
        <WorkshopProductionModal
          workshopId={workshop.id}
          password={password}
          onClose={() => setShowProductionModal(false)}
          onSuccess={() => {
            setShowProductionModal(false);
            // Refetch data
          }}
        />
      )}

      {showHoursModal && (
        <WorkshopHoursModal
          workshopId={workshop.id}
          workType={workshop.workType}
          employees={workshop.employees || []}
          password={password}
          onClose={() => setShowHoursModal(false)}
          onSuccess={() => {
            setShowHoursModal(false);
            // Refetch data
          }}
        />
      )}

      {showSettlementModal && (
        <WorkshopSettlementModal
          workshopId={workshop.id}
          currentBalance={financialSummary?.netAmount ?? 0}
          password={password}
          workType={workshop.workType}
          onClose={() => setShowSettlementModal(false)}
          onSuccess={() => {
            setShowSettlementModal(false);
            // Refetch data
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setEmployeeToRemove(null);
        }}
        onConfirm={confirmRemoveEmployee}
        title="إزالة موظف"
        message={`هل أنت متأكد من إزالة ${employeeToRemove?.name} من الورشة؟`}
        confirmText="إزالة"
        cancelText="إلغاء"
        type="danger"
      />
    </AnimatePresence>
  );
};

export default WorkshopDetailsModal;
