"use client";

import DebtDetailsModal from "@/components/common/DebtDetailsModal";
import DebtsTable from "@/components/common/DebtTable";
import Navbar from "@/components/common/Navbar";
import PageSpinner from "@/components/common/PageSpinner";
import SplineBackground from "@/components/common/SplineBackground";
import { useDebtsTracking } from "@/hooks/debts/useDebts";
import { Debt } from "@/types/debts.type";
import { formatCurrency } from "@/utils/formatters";
import {
  AlertCircle,
  Box,
  CheckCircle,
  CheckCircle2,
  Clock,
  Search,
  Wallet,
} from "lucide-react";
import { useState } from "react";

// Types
type DebtStatus = "active" | "paid" | "breakage";

interface DebtSummaryProps {
  debts: Debt[];
}

// Add DebtSummary Component
const DebtSummary: React.FC<DebtSummaryProps> = ({ debts }) => {
  const activeDebts = debts.filter((debt) => debt.status === "active");
  const paidDebts = debts.filter((debt) => debt.status === "paid");

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      dir="rtl"
    >
      <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-slate-400" />
          <p className="text-slate-400 text-sm">إجمالي الديون</p>
        </div>
        <p className="text-lg font-semibold text-slate-200 mt-1">
          {debts.length}
        </p>
      </div>
      <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          <p className="text-slate-400 text-sm">الديون النشطة</p>
        </div>
        <p className="text-lg font-semibold text-warning mt-1">
          {activeDebts.length}
        </p>
      </div>
      <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <p className="text-slate-400 text-sm">الديون المدفوعة</p>
        </div>
        <p className="text-lg font-semibold text-success mt-1">
          {paidDebts.length}
        </p>
      </div>
      <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-slate-400 text-sm">المبالغ المتبقية</p>
        </div>
        <p className="text-lg font-semibold text-red-400 mt-1">
          {formatCurrency(
            activeDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0)
          )}
        </p>
      </div>
    </div>
  );
};

// Add DebtTabs Component
const DebtTabs: React.FC<{
  activeTab: DebtStatus;
  onTabChange: (tab: DebtStatus) => void;
  activeCount: number;
  paidCount: number;
  breakageCount?: number; // Add count for breakage records
}> = ({ activeTab, onTabChange, activeCount, paidCount }) => {
  return (
    <div className="border-b border-slate-700/50 mb-6" dir="rtl">
      <div className="flex">
        <button
          onClick={() => onTabChange("active")}
          className={`px-4 py-2 -mb-px flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === "active"
            ? "text-warning border-b-2 border-warning"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Clock className="h-4 w-4" />
          <span>الديون النشطة</span>
          <span className="mx-2 bg-warning/10 text-warning px-2 py-0.5 rounded-full text-xs">
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange("paid")}
          className={`px-4 py-2 -mb-px flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === "paid"
            ? "text-success border-b-2 border-success"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <CheckCircle className="h-4 w-4" />
          <span>الديون المدفوعة</span>
          <span className="mx-2 bg-success/10 text-success px-2 py-0.5 rounded-full text-xs">
            {paidCount}
          </span>
        </button>
      </div>
    </div>
  );
};

// Update Main Page Component
const DebtsManagementPage = () => {
  const { data: debts, isLoading, isError, error } = useDebtsTracking();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DebtStatus>("active");

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-danger">
        {error.message}
      </div>
    );
  }

  const allDebts = debts || [];
  const activeDebts = allDebts.filter((debt) => debt.status === "active");
  const paidDebts = allDebts.filter((debt) => debt.status === "paid");

  const filteredDebts = (
    activeTab === "active" ? activeDebts : paidDebts
  ).filter((debt) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const name = debt.customer?.name?.toLowerCase() || "";
    const phone = debt.customer?.phone?.toLowerCase() || "";
    return name.includes(searchLower) || phone.includes(searchLower);
  });


  const handleViewDetails = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
      <SplineBackground activeTab="الديون" />
      {isLoading && <PageSpinner />}

      <div className="relative z-10">
        <Navbar />
        <main className="pt-32 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between" dir="rtl">
              <div className="flex items-center gap-3">
                <Box className="h-6 w-6 text-slate-400" />
                <h1 className="text-2xl font-bold text-slate-200">
                  إدارة الديون
                </h1>
              </div>
            </div>

            {/* Summary Cards */}
            <DebtSummary debts={allDebts} />

            {/* Search and Tabs */}
            <div className="mb-6">
              <div className="relative" dir="rtl">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث عن طريق اسم العميل أو رقم الهاتف..."
                  className="w-full pl-4 pr-10 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                />
              </div>
            </div>

            {/* Tabs */}
            <DebtTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeCount={activeDebts.length}
              paidCount={paidDebts.length}
            />

            {/* Table/Cards */}
            <DebtsTable
              debts={filteredDebts}
              onViewDetails={handleViewDetails}
            />
          </div>
        </main>
      </div>

      {/* Details Modal */}
      <DebtDetailsModal
        debt={selectedDebt}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDebt(null);
        }}
      />
    </div>
  );
};

export default DebtsManagementPage;
