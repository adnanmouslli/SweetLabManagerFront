"use client";
import { ClipboardCheck, Package, Receipt } from "lucide-react";
import { useState } from "react";

import InvoiceDetailModal from "@/components/common/InvoiceDetailModal";
import Navbar from "@/components/common/Navbar";
import SplineBackground from "@/components/common/SplineBackground";
import { AuditDetailModal } from "@/components/common/warehouse/AuditDetailModal";
import { AuditHistoryTable } from "@/components/common/warehouse/AuditHistoryTable";
import { AuditModal } from "@/components/common/warehouse/AuditModal";
import { InvoicesTable } from "@/components/common/warehouse/InvoicesTable";
import { PageTitle } from "@/components/common/warehouse/PageTitle";
import { Pagination } from "@/components/common/warehouse/Pagination";
import { SearchBar } from "@/components/common/warehouse/SearchBar";
import StoredMaterialsGrid from "@/components/common/warehouse/StoredMaterialsGrid";
import { useAuditHistory, useInventoryItems, useRawMaterialExpenses } from "@/hooks/warehouse/useWarehouse";
import { AuditEntry, WareHouseInvoice } from "@/types/warehouse.type";

// Tabs Component
const WarehouseTabs = ({
  activeTab,
  onTabChange,
}: {
  activeTab: "materials" | "invoices" | "audit";
  onTabChange: (tab: "materials" | "invoices" | "audit") => void;
}) => (
  <div className="flex justify-center mb-8 w-full ">
    <div className="inline-flex bg-white/5 rounded-lg p-1 w-full gap-2">
      <button
        onClick={() => onTabChange("materials")}
        className={`
        w-full
justify-center        px-6 py-2 rounded-lg transition-colors flex items-center gap-2
          ${activeTab === "materials"
            ? "bg-purple-500/20 text-purple-400"
            : "text-slate-300 hover:bg-white/10"
          }
        `}
      >
        <Package className="h-5 w-5" />
        المواد المخزنة
      </button>
      <button
        onClick={() => onTabChange("invoices")}
        className={`
        w-full
        justify-center        px-6 py-2 rounded-lg transition-colors flex items-center gap-2
          ${activeTab === "invoices"
            ? "bg-purple-500/20 text-purple-400"
            : "text-slate-300 hover:bg-white/10"
          }
        `}
      >
        <Receipt className="h-5 w-5" />
        فواتير المشتريات
      </button>
      <button
        onClick={() => onTabChange("audit")}
        className={`
        w-full
        justify-center        px-6 py-2 rounded-lg transition-colors flex items-center gap-2
          ${activeTab === "audit"
            ? "bg-purple-500/20 text-purple-400"
            : "text-slate-300 hover:bg-white/10"
          }
        `}
      >
        <ClipboardCheck className="h-5 w-5" />
        سجل الجرد
      </button>
    </div>
  </div>
);

// Main Warehouse Page Component
const RawMaterialWarehouse = () => {
  const [activeTab, setActiveTab] = useState<"materials" | "invoices" | "audit">(
    "materials"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] =
    useState<WareHouseInvoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditEntry | null>(null);
  const [isAuditDetailModalOpen, setIsAuditDetailModalOpen] = useState(false);
  const { data } = useRawMaterialExpenses();

  const { data: auditData } = useAuditHistory();
  const { data: inventoryData } = useInventoryItems();


  // Handle view invoice details
  const handleViewInvoice = (invoice: WareHouseInvoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  // Handle view audit details
  const handleViewAudit = (audit: AuditEntry) => {
    setSelectedAudit(audit);
    setIsAuditDetailModalOpen(true);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      <SplineBackground activeTab="warehouse" />

      <div className="relative">
        <Navbar />

        <main className="py-32 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Title */}
            <PageTitle />

            {/* Tabs */}
            <WarehouseTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Search Bar (only for materials and invoices) */}
            {activeTab !== "audit" && (
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
              />
            )}

            {/* Content Based on Active Tab */}
            <div className="container mx-auto " dir="rtl">
              {activeTab === "materials" ? (
                inventoryData && inventoryData.length > 0 ? (
                  <>
                    <StoredMaterialsGrid
                      materials={inventoryData.map(item => ({
                        itemId: item.itemId,
                        itemName: item.item.name,
                        totalQuantity: item.currentStock,
                        totalCost: item.totalValue,
                        averageUnitPrice: item.averageUnitPrice,
                        item: {
                          description: item.item.description,
                          units: item.item.units?.map(u => ({ unit: u.unit, price: u.price }))
                        }
                      }))}
                    />
                    {/* Simple summary */}
                    <div className="mt-4 text-center text-gray-400">
                      إجمالي المواد: {inventoryData.length}
                      {(() => {
                        const totalQuantity = inventoryData.reduce((sum, item) => sum + item.currentStock, 0);
                        const totalValue = inventoryData.reduce((sum, item) => sum + item.totalValue, 0);
                        return (
                          <>
                            <span className="mx-2">|</span>
                            إجمالي الكمية: {totalQuantity}
                            <span className="mx-2">|</span>
                            إجمالي القيمة: {totalValue.toFixed(2)} ر.س
                          </>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center text-gray-400">
                    لا توجد مواد مخزنة
                  </div>
                )
              ) : activeTab === "invoices" ? (

                data?.invoices && data.invoices.length > 0 ? (
                  <>
                    {/* Invoices Table */}
                    <InvoicesTable
                      invoices={data.invoices}
                      onViewInvoice={handleViewInvoice}
                    />

                    {/* Pagination */}
                    {data.totalCount > 10 && (
                      <Pagination
                        totalCount={data.totalCount}
                        currentPage={1}
                        onPageChange={() => { }}
                      />
                    )}

                    {/* Results Count */}
                    <div className="mt-4 text-center text-gray-400">
                      إجمالي النتائج: {data.totalCount}
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center text-gray-400">
                    لا توجد فواتير مشتريات
                  </div>
                )

              ) : (
                // Audit History Tab
                <>
                  {/* New Audit Button */}
                  <div className="flex justify-end mb-6">
                    <button
                      onClick={() => setIsAuditModalOpen(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <ClipboardCheck className="h-5 w-5" />
                      جرد جديد
                    </button>
                  </div>

                  {/* Audit History Table */}
                  {auditData?.data && Array.isArray(auditData.data) && auditData.data.length > 0 ? (
                    <>
                      <AuditHistoryTable
                        auditEntries={auditData.data}
                        onViewDetails={handleViewAudit}
                      />

                      {/* Results Count */}
                      <div className="mt-4 text-center text-gray-400">
                        إجمالي عمليات الجرد: {auditData.count || 0}
                      </div>
                    </>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center text-gray-400">
                      لا توجد عمليات جرد سابقة
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <InvoiceDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            invoice={selectedInvoice}
          />
        )}

        {/* Audit Detail Modal */}
        <AuditDetailModal
          isOpen={isAuditDetailModalOpen}
          onClose={() => setIsAuditDetailModalOpen(false)}
          audit={selectedAudit}
        />

        {/* New Audit Modal */}
        {inventoryData && (
          <AuditModal
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
            items={inventoryData.map(item => ({
              id: item.itemId,
              name: item.item.name,
              currentStock: item.currentStock,
              defaultUnit: item.item.defaultUnit || "وحدة"
            }))}
          />
        )}
      </div>
    </div>
  );
};

export default RawMaterialWarehouse;
