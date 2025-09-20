/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Play, StopCircle } from "lucide-react";
import { useEffect, useState } from "react";

// Components
import ActionButton from "@/components/common/ActionButtons";
import CloseShiftModal from "@/components/common/CloseShiftModal";
import InvoiceForm from "@/components/common/InvoiceForm";
import Navbar from "@/components/common/Navbar";
import ShiftModal from "@/components/common/ShiftModal";
import SplineBackground from "@/components/common/SplineBackground";
import TabContent from "@/components/common/TabContent";
import TransactionTypeModal from "@/components/common/TransactionTypeModal";

// Hooks
import { useMokkBar } from "@/components/providers/MokkBarContext";
import { useCurrentInvoices, useInvoices } from "@/hooks/invoices/useInvoice";
import {
  QueryShiftType,
  useCloseShift,
  useCloseShiftPartially,
  useOpenShift,
  useShifts,
  useShiftSummary,
} from "@/hooks/shifts/useShifts";

// Types
import { InvoiceCategory } from "@/types/invoice.type";
import { AnyToGeneralBody } from "@/types/transfer.type";
import { FundType, InvoiceType, ShiftType } from "@/types/types";

// Utils
import PageSpinner from "@/components/common/PageSpinner";
import { useFunds } from "@/hooks/funds/useFunds";
import {
  useTransferAnyToGeneral,
  useTransferAnyToMain
} from "@/hooks/invoices/useTransfers";
import { Role, useRoles } from "@/hooks/users/useRoles";
import { setLoading } from "@/redux/reducers/wrapper.slice";
import { AppDispatch } from "@/redux/store";
import { getFundId } from "@/utils/fund_id";
import { useDispatch } from "react-redux";

// Constants
const TABS = [
  { id: FundType.general, label: "عام" },
  { id: FundType.booth, label: "بسطة" },
  { id: FundType.university, label: "جامعة" },
];

// Enhanced Transfer Modal Component with Current Shift Balance Calculation
const EnhancedTransferModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  isPending,
  funds,
  sourceType = null,
  destinationType = "main",
  currentInvoices, // إضافة الفواتير الحالية
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: { amount: number; notes: string }) => void;
  isPending: boolean;
  funds: Array<{
    id: number;
    fundType: "main" | "general" | "booth" | "university";
    currentBalance: number;
    lastUpdate: string;
  }>;
  sourceType?: "general" | "booth" | "university" | "main" | null;
  destinationType?: "main" | "general";
  currentInvoices: any; 
}) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  // Format fund name for display
  const formatFundName = (type: string) => {
    switch (type) {
      case "main":
        return "الرئيسية";
      case "general":
        return "العامة";
      case "booth":
        return "البسطة";
      case "university":
        return "الجامعة";
      default:
        return type;
    }
  };

  // دالة حساب الرصيد الحالي من الفواتير في الواردية النشطة
  const calculateCurrentShiftBalance = (fundType: string) => {

    if (!currentInvoices) {
      console.log("No current invoices data");
      return 0;
    }

    // الحصول على قسم الفواتير المناسب
    const sectionKey = fundType === "general" ? "general" : 
                      fundType === "booth" ? "booth" : 
                      fundType === "university" ? "university" : null;
    
    if (!sectionKey) {
      console.log("Invalid section key for fund type:", fundType);
      return 0;
    }

    console.log("Looking for section:", sectionKey);
    const section = currentInvoices[sectionKey];
    console.log("Section data:", section);

    if (!section) {
      console.log("Section not found");
      return 0;
    }

    // التحقق من هيكل البيانات - قد تكون الفواتير في section.invoices أو مباشرة في section
    let invoices = [];
    if (section.invoices && Array.isArray(section.invoices)) {
      invoices = section.invoices;
    } else if (Array.isArray(section)) {
      invoices = section;
    } else {
      console.log("Invoices not found in expected format");
      return 0;
    }


    // حساب إجمالي الدخل والمصروف من فواتير الواردية الحالية
    const totalIncome = invoices
      .filter((invoice: any) => invoice.invoiceType === 'income' && invoice.paidStatus == true)
      .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0);

    const totalExpense = invoices
      .filter((invoice: any) => invoice.invoiceType === 'expense'  && invoice.paidStatus == true)
      .reduce((sum: number, invoice: any) => sum + (invoice.totalAmount || 0), 0);

    // الرصيد المتاح = الدخل - المصروف
    return totalIncome - totalExpense;
  };

  // Get current balance of the source fund from current shift invoices
  const sourceBalance = sourceType ? calculateCurrentShiftBalance(sourceType) : 0;

  // Get destination fund balance (for display only - not used in validation)
  const destinationBalance = destinationType === "main" 
    ? 0 // الخزينة الرئيسية لا تظهر رصيدها
    : calculateCurrentShiftBalance(destinationType);

  // Get fund color by type (based on your screenshots)
  const getFundColor = (type: string): string => {
    switch (type) {
      case "main":
        return "text-pink-500"; // Pink for main fund
      case "general":
        return "text-cyan-400"; // Cyan for general fund
      case "booth":
        return "text-blue-500"; // Blue for booth fund
      case "university":
        return "text-purple-500"; // Purple for university fund
      default:
        return "text-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800/90 p-6 rounded-lg shadow-xl w-full max-w-md mx-4 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h2 className="text-xl font-bold text-slate-200 mb-6">{title}</h2>

        {/* Fund Balances Section - Styled to match screenshot */}
        <div className="mb-6">
          <div className="text-sm font-medium text-slate-400 mb-2 px-1">
            أرصدة الواردية الحالية
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sourceType && (
              <div className="rounded-lg bg-slate-800/80 border border-slate-700/70 p-4 flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-2">خزينة {formatFundName(sourceType)}</div>
                <div className={`text-lg font-bold ${getFundColor(sourceType)}`}>
                  {sourceBalance.toLocaleString()} ل.س
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  (رصيد الواردية الحالية)
                </div>
              </div>
            )}
            {destinationType === "general" && (
              <div className="rounded-lg bg-slate-800/80 border border-slate-700/70 p-4 flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-2">
                  الصندوق العام
                </div>
                <div className={`text-lg font-bold ${getFundColor(destinationType)}`}>
                  {destinationBalance.toLocaleString()} ل.س
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  (رصيد الواردية الحالية)
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-slate-300"
            >
              المبلغ
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              placeholder="أدخل المبلغ..."
              max={sourceBalance}
            />
            {Number(amount) > sourceBalance && (
              <p className="text-red-400 text-xs">المبلغ أكبر من الرصيد المتاح في الواردية الحالية</p>
            )}
            {sourceBalance <= 0 && (
              <p className="text-yellow-400 text-xs">لا يوجد رصيد متاح في الواردية الحالية</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-slate-300"
            >
              ملاحظات
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/30 min-h-[100px]"
              placeholder="أدخل الملاحظات..."
            />
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                if (!amount || Number(amount) > sourceBalance || sourceBalance <= 0) return;
                onSubmit({ amount: Number(amount), notes });
              }}
              disabled={!amount || isPending || Number(amount) > sourceBalance || sourceBalance <= 0}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                  جاري التحويل...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  تحويل
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Page() {
  // Context and Queries
  const { setSnackbarConfig } = useMokkBar();
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const {
    data: shifts,
    isLoading: isShiftsLoading,
    isSuccess: isShiftsSuccess,
  } = useShifts();
  const [currentShift, setCurrentShift] = useState<{
    shiftType: ShiftType.evening | ShiftType.morning;
  } | null>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<FundType>(FundType.general);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionMode, setTransactionMode] = useState<InvoiceType>(
    InvoiceType.income
  );
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoiceCategory, setSelectedInvoiceCategory] =
    useState<InvoiceCategory | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | undefined>(undefined);

  // Transfer State
  const [showTransferToGeneralModal, setShowTransferToGeneralModal] = useState(false);
  const [showTransferToMainModal, setShowTransferToMainModal] = useState(false);
  const [transferSource, setTransferSource] = useState<"general" | "booth" | "university" | null>(null);

  // Added funds query
  const { data: funds, isLoading: isFundsLoading } = useFunds();
  const { data: invoices, isLoading: isInvoicesLoading } = useInvoices();


  const { hasAnyRole } = useRoles();
  // Derived State
  const lastShiftId = shifts?.reduce(
    (maxId, item) => Math.max(maxId, item.id),
    0
  );
  const lastShift = shifts?.find((item) => item.id === lastShiftId);
  console.log("last shift is : ", lastShift)
  const theShiftIsOpen = shifts?.length! > 0 && (!lastShift?.closeTime && isShiftsSuccess) && lastShift?.status !== "partially_closed";

  const {
    data: currentInvoices,
    isLoading: isCurrentInvoicesLoading,
    refetch: refetchCUrrentInvoices,
  } = useCurrentInvoices(theShiftIsOpen);

  // Mutations and Queries
  const { mutateAsync: openShift, isPending: isOpeningShift } = useOpenShift({
    onSuccess: () => handleOpenShiftSuccess(),
    onError: (error) => handleOpenShiftError(error),
  });
  const { mutateAsync: closeShift, isPending: isClosingShift } = useCloseShift({
    onSuccess: () => {
      setCurrentShift(null);
      setShowCloseShiftModal(false);
      setActiveTab(FundType.booth);
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم اغلاق وردية",
      });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (error) => {
      console.error("Error closing shift:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: error?.response?.data?.message || "فشل في اغلاق الوردية",
      });
    },
  });

  // Transfer Mutations
  const { mutateAsync: transferToGeneral, isPending: isTransferringToGeneral } =
    useTransferAnyToGeneral({
      onSuccess: () => {
        setShowTransferToGeneralModal(false);
        setSnackbarConfig({
          open: true,
          severity: "success",
          message: "تم تحويل المبلغ بنجاح إلى الخزينة العامة",
        });
        queryClient.invalidateQueries({ queryKey: ["funds"] });
      },
      onError: (error) => {
        setSnackbarConfig({
          open: true,
          severity: "error",
          message: error?.response?.data?.message || "فشل في تحويل المبلغ",
        });
      },
    });


  // Updated transfer to main mutation using the new hook
  const { mutateAsync: transferToMain, isPending: isTransferringToMain } =
    useTransferAnyToMain({
      onSuccess: () => {
        setShowTransferToMainModal(false);
        setSnackbarConfig({
          open: true,
          severity: "success",
          message: "تم تحويل المبلغ بنجاح إلى الخزينة ",
        });
        queryClient.invalidateQueries({ queryKey: ["funds"] });
      },
      onError: (error) => {
        setSnackbarConfig({
          open: true,
          severity: "error",
          message: error?.response?.data?.message || "فشل في تحويل المبلغ",
        });
      },
    });

  const { mutateAsync: closeShiftPartially, isPending: isClosingShiftPartially, isSuccess: isPartiallyCloseSuccess } = useCloseShiftPartially({
    onSuccess: () => {
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم إغلاق الوردية جزئياً بنجاح",
      });
      // Reload the page after successful partial close
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error closing shift partially:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: error?.response?.data?.message || "فشل في إغلاق الوردية جزئياً",
      });
    },
  });

  const {
    data: shiftSummary,
    isSuccess: shiftSummarySuccess,
    isLoading: isSummaryLoading,
    refetch: triggerShiftSummary,
  } = useShiftSummary();

  useEffect(() => {
    dispatch(setLoading(isShiftsLoading || isSummaryLoading || isFundsLoading));
    console.log(
      "from app : Loading is set to ( " +
      `${isShiftsLoading || isSummaryLoading || isFundsLoading}` +
      " )"
    );
  }, [dispatch, isShiftsLoading, isSummaryLoading, isFundsLoading]);

  useEffect(() => {
    if (isShiftsLoading && lastShift) {
      updateCurrentShift(lastShift);
    }
  }, [lastShift, isShiftsLoading]);
  useEffect(() => {
    if (isShiftsSuccess && lastShift) {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["currentInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
    }
  }, [lastShift, isShiftsSuccess, queryClient]);

  // Event Handlers
  const handleOpenShiftSuccess = () => {
    setShowShiftModal(false);
    refetchCUrrentInvoices();
    queryClient.refetchQueries({ queryKey: ["invoices"] });
    queryClient.refetchQueries({ queryKey: ["currentInvoices"] });
    queryClient.refetchQueries({ queryKey: ["funds"] });
    setSnackbarConfig({
      open: true,
      severity: "success",
      message: "تم فتح وردية",
    });
  };

  const handleOpenShiftError = (error: any) => {
    setSnackbarConfig({
      open: true,
      severity: "error",
      message: error?.response?.data?.message || "فشل في فتح الوردية",
    });
  };

  const handleShiftTypeSelect = async (type: ShiftType) => {
    try {
      await openShift({
        shiftType: type === "صباحي" ? "morning" : "evening",
      });
      setCurrentShift({
        shiftType: type === "صباحي" ? ShiftType.morning : ShiftType.evening,
      });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    } catch (error) {
      console.error("Failed to open shift:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message: "فشل في فتح الوردية",
      });
    }
  };

  const handleConfirmShiftClose = async ({
    amount,
  }: {
    amount: number;
  }) => {
    if (lastShift?.closeTime) return;
    try {
      await closeShift({ actualAmount: amount });
    } catch (error) {
      console.error("Failed to close shift:", error);
    }
  };

  const handleAddTransaction = (type: FundType, mode: InvoiceType) => {
    setTransactionMode(mode);
    setShowTransactionModal(true);
  };

  // Transfer Handlers
  const handleTransferToGeneral = async (data: {
    amount: number;
    notes: string;
  }) => {
    try {
      const transferData: AnyToGeneralBody = {
        sourceId: activeTab === FundType.booth ? 3 : 4, // booth: 3, university: 4
        amount: data.amount,
        notes: data.notes,
      };

      await transferToGeneral(transferData);
    } catch (error) {
      console.error("Failed to transfer to general:", error);
    }
  };

  // Updated transfer to main handler
  const handleTransferToMain = async (data: {
    amount: number;
    notes: string;
  }) => {
    try {
      await transferToMain({ amount: data.amount, sourceId: getFundId(activeTab), notes: data.notes });
    } catch (error) {
      console.error("Failed to transfer to main:", error);
    }
  };

  // Helper Functions
  const updateCurrentShift = (shift: QueryShiftType) => {
    setCurrentShift(
      shift.status === "closed"
        ? null
        : {
          shiftType:
            shift.shiftType === "morning"
              ? ShiftType.morning
              : ShiftType.evening,
        }
    );
  };

  const getFilteredInvoices = () => {
    if (!currentInvoices) return [];
    const section =
      currentInvoices[
      activeTab === FundType.booth
        ? "booth"
        : activeTab === FundType.general
          ? "general"
          : "university"
      ];
    return section?.invoices || [];
  };

  // Get fund type string based on active tab
  const getActiveFundType = (): "general" | "booth" | "university" => {
    switch (activeTab) {
      case FundType.general:
        return "general";
      case FundType.booth:
        return "booth";
      case FundType.university:
        return "university";
      default:
        return "general";
    }
  };

  // Render Methods
  const renderShiftControls = () => (
    <div className="flex flex-wrap gap-4 mb-8 items-center" dir="rtl">
      {!theShiftIsOpen ? (
        <ActionButton
          icon={<Play className="h-5 w-5" />}
          label="فتح وردية"
          onClick={() => setShowShiftModal(true)}
          variant="success"
        />
      ) : (
        <>
          <ActionButton
            icon={<StopCircle className="h-5 w-5" />}
            label="اغلاق وردية"
            onClick={() => {
              setShowCloseShiftModal(true);
              triggerShiftSummary();
            }}
            variant="danger"
          />
          <ActionButton
            icon={<StopCircle className="h-5 w-5" />}
            label="اغلاق وردية جزئي"
            onClick={() => {
              closeShiftPartially();
            }}
            variant="expense"
          />
        </>
      )}
      {theShiftIsOpen && (
        <span className="text-muted-foreground">
          الوردية الحالية:{" "}
          {currentShift && currentShift.shiftType === ShiftType.morning
            ? "صباحية"
            : "مسائية"}
        </span>
      )}

      {/* Transfer Controls - Only show when shift is open */}
      {theShiftIsOpen && hasAnyRole([Role.ADMIN, Role.ShiftManager]) && (
        <div className="flex gap-3 mx-auto">
          {/* Show transfer to general button only on booth and university tabs */}
          {(activeTab === FundType.booth ||
            activeTab === FundType.university) && (
              <ActionButton
                icon={<ArrowUpRight className="h-5 w-5" />}
                label={`تحويل إلى الخزينة العامة`}
                onClick={() => {
                  setTransferSource(getActiveFundType());
                  setShowTransferToGeneralModal(true);
                }}
                variant="income"
              />
            )}

          {/* Show transfer to main button on any tab */}
          <ActionButton
            icon={<ArrowUpRight className="h-5 w-5" />}
            label="تحويل إلى الخزينة الرئيسية"
            onClick={() => {
              setTransferSource(getActiveFundType());
              setShowTransferToMainModal(true);
            }}
            variant="expense"
          />
        </div>
      )}
    </div>
  );

  const renderTabs = () => (
    <div className="flex gap-4 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 -mb-px text-sm font-medium transition-colors duration-200 ${activeTab === tab.id
            ? "text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // No longer needed - removed fund balance display from main page

  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      <SplineBackground activeTab={activeTab} />
      {(isShiftsLoading || isCurrentInvoicesLoading || isClosingShiftPartially) && <PageSpinner />}
      <AnimatePresence>
        {/* Original Modals */}
        {showShiftModal && (
          <ShiftModal
            isSelecting={isOpeningShift}
            onClose={() => setShowShiftModal(false)}
            onSelect={handleShiftTypeSelect}
          />
        )}
        {showCloseShiftModal && theShiftIsOpen && shiftSummarySuccess && (
          <CloseShiftModal
            onClose={() => setShowCloseShiftModal(false)}
            onConfirm={({ amount }) =>
              handleConfirmShiftClose({ amount })
            }
            shiftType={
              currentShift && currentShift.shiftType === ShiftType.morning
                ? "صباحي"
                : "مسائي"
            }
            shiftSummary={shiftSummary || {}}
            isShiftClosing={isClosingShift}
          />
        )}
        {showTransactionModal && (
          <TransactionTypeModal
            onClose={() => setShowTransactionModal(false)}
            onSelect={(category, subType) => {
              setSelectedInvoiceCategory(category);
              setSelectedSubType(subType);
              setShowTransactionModal(false);
              setShowInvoiceForm(true);
            }}
            mode={transactionMode}
          />
        )}
        {showInvoiceForm && selectedInvoiceCategory && (
          <InvoiceForm
            type={selectedInvoiceCategory}
            mode={transactionMode}
            onClose={() => {
              setShowInvoiceForm(false);
              setSelectedInvoiceCategory(null);
              setSelectedSubType(undefined);
            }}
            fundId={getFundId(activeTab)}
            subType={selectedSubType}
          />
        )}

        {/* Updated Transfer Modals with Fund Balances */}
        {showTransferToGeneralModal && funds && (
          <EnhancedTransferModal
            isOpen={showTransferToGeneralModal}
            onClose={() => setShowTransferToGeneralModal(false)}
            title={`تحويل من ${transferSource === "booth"
              ? "البسطة"
              : transferSource === "university"
                ? "الجامعة"
                : "العامة"
              } إلى الخزينة العامة`}
            onSubmit={handleTransferToGeneral}
            isPending={isTransferringToGeneral}
            funds={funds}
            sourceType={transferSource}
            destinationType="general"
            currentInvoices={currentInvoices}
          />
        )}

        {showTransferToMainModal && funds && (
          <EnhancedTransferModal
            isOpen={showTransferToMainModal}
            onClose={() => setShowTransferToMainModal(false)}
            title={`تحويل من ${transferSource === "general"
              ? "الخزينة العامة"
              : transferSource === "booth"
                ? "البسطة"
                : "الجامعة"
              } إلى الخزينة الرئيسية`}
            onSubmit={handleTransferToMain}
            isPending={isTransferringToMain}
            funds={funds}
            sourceType={transferSource}
            destinationType="main"
            currentInvoices={currentInvoices}

          />
        )}
      </AnimatePresence>
      <div className="relative z-10">
        <Navbar />
        <main className="py-16 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {hasAnyRole([Role.ADMIN, Role.ShiftManager]) &&
              renderShiftControls()}

            {/* Fund balances are now shown inside the transfer modal */}
            {theShiftIsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-8"
                dir="rtl"
              >
                {renderTabs()}
                {currentInvoices && (
                  <TabContent
                    type={activeTab}
                    tableData={
                      isCurrentInvoicesLoading ? [] : getFilteredInvoices()
                    }
                    onAddIncome={() =>
                      handleAddTransaction(activeTab, InvoiceType.income)
                    }
                    onAddExpense={() =>
                      handleAddTransaction(activeTab, InvoiceType.expense)
                    }
                    currentShiftId={currentInvoices.shiftId}
                  />
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}