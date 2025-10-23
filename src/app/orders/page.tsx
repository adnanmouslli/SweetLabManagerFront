// OrdersPage.tsx
"use client";

import Navbar from "@/components/common/Navbar";
import CategoryManagementModal from "@/components/common/orders/CategoryManagmentModal";
import CategorySection from "@/components/common/orders/CategorySection";
import CreateOrderModal from "@/components/common/orders/CreateOrderModal";
import CustomerOrderCard from "@/components/common/orders/CustomerOrderCard";
import InvoiceOrderConversionModal from "@/components/common/orders/InvoiceOrderConversionModal";
import OrderByCategoryMaterialsView from "@/components/common/orders/OrderByCategoryMaterialsView";
import OrderDetailsModal from "@/components/common/orders/OrderDetailsModal";
import OrderListByDateView from "@/components/common/orders/OrderListByDateView";
import OrdersSummaryComponent from "@/components/common/orders/OrdersSummary";
import OrdersTabs, {
  OrderTabType,
} from "@/components/common/orders/OrdersTabs";
import PageSpinner from "@/components/common/PageSpinner";
import SplineBackground from "@/components/common/SplineBackground";
import {
  useOrderCategories,
  useOrders,
  useOrdersSummary,
} from "@/hooks/useOrders";
import {
  FilterOrders,
  OrderCustomer,
  OrderResponseDto,
} from "@/types/orders.type";
import { CalendarDays, Plus, ShoppingBag, Tags, User, X } from "lucide-react";
import React, { useMemo, useState } from "react";

// Customer Orders Modal Component (unchanged)
interface CustomerOrdersModalProps {
  customer: OrderCustomer;
  categoryId: number | null;
  orders: OrderResponseDto[];
  isOpen: boolean;
  onClose: () => void;
  onViewOrderDetails: (order: OrderResponseDto) => void;
}

const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  customer,
  categoryId,
  orders,
  isOpen,
  onClose,
  onViewOrderDetails,
}) => {
  const { data: categories = [] } = useOrderCategories();
  const category = categories.find((category) => category.id == categoryId);

  if (!isOpen) return null;

  const filteredOrders = orders.filter(
    (order) =>
      order.customerId === customer.id &&
      (categoryId !== null ? order.categoryId === categoryId : true)
  );

  const getCategoryName = () => {
    if (categoryId === null) return "";
    return ` - ${category?.name || `تصنيف #${categoryId}`}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-200">
              طلبات {customer?.name}
              {getCategoryName()}
            </h3>
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              {filteredOrders.length} طلب
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 max-h-[calc(90vh-120px)]">
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-6 text-center text-slate-400">
              لا توجد طلبات لهذا العميل
              {categoryId !== null ? " في هذا التصنيف" : ""}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <CustomerOrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={onViewOrderDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Orders Page Component
const OrdersPage: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<OrderTabType>("forToday");
  const [selectedCustomer, setSelectedCustomer] =
    useState<OrderCustomer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isCustomerOrdersModalOpen, setIsCustomerOrdersModalOpen] =
    useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] =
    useState<boolean>(false);
  const [isInvoiceConversionModalOpen, setIsInvoiceConversionModalOpen] =
    useState<boolean>(false);
const [viewMode, setViewMode] = useState<"byDate" | "byCategory" | "byMaterials">("byDate");
  const [selectedDate, setSelectedDate] = useState<string>(""); // State for selected date
  const [paymentStatus, setPaymentStatus] = useState<
    "all" | "paid" | "unpaid" | "break"
  >("all"); // State for payment status

  // Function to clear date filter
  const handleClearDate = () => {
    setSelectedDate("");
  };

  // Function to handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  // Function to clear date filter (alias)
  const clearDateFilter = () => {
    setSelectedDate("");
  };

  // Function to handle payment status change
  const handlePaymentStatusChange = (
    status: "all" | "paid" | "unpaid" | "break"
  ) => {
    setPaymentStatus(status);
  };

  // Function to clear payment status filter
  const clearPaymentStatusFilter = () => {
    setPaymentStatus("all");
  };

  // Filter parameters (unchanged, as filtering is done client-side)
  const getAllFilters = (): FilterOrders | undefined => {
    if (selectedDate) {
      return { endDate: selectedDate };
    }
    return undefined; // Get all orders without filtering
  };

  const getTodayFilters = (): FilterOrders | undefined => {
    if (selectedDate) {
      return { endDate: selectedDate };
    }
    return { forToday: true };
  };

  const getTomorrowFilters = (): FilterOrders | undefined => {
    if (selectedDate) {
      return { endDate: selectedDate };
    }
    return { forTomorrow: true };
  };

  // Query hooks
  const { data: summary, isLoading: isSummaryLoading } = useOrdersSummary();
  const { data: allOrders = [], isLoading: isAllOrdersLoading } = useOrders(
    getAllFilters()
  );
  const { data: todayOrders = [], isLoading: isTodayOrdersLoading } = useOrders(
    getTodayFilters()
  );
  const { data: tomorrowOrders = [], isLoading: isTomorrowOrdersLoading } =
    useOrders(getTomorrowFilters());
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useOrderCategories();

  // Combined loading state
  const isLoading =
    isSummaryLoading ||
    isAllOrdersLoading ||
    isTodayOrdersLoading ||
    isTomorrowOrdersLoading ||
    isCategoriesLoading;

  // Filter orders based on search term, payment status, and selected date
  const filteredAllOrders = useMemo(() => {
    if (!allOrders) return [];
    let filtered = allOrders;

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter((order) => {
        const orderDate = order.createdAt
          ? new Date(order.createdAt).toISOString().split("T")[0]
          : "";
        return orderDate === selectedDate;
      });
    }

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customer?.name?.toLowerCase().includes(searchLower) ||
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.notes?.toLowerCase().includes(searchLower) ||
          order.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply payment status filter
    if (paymentStatus !== "all") {
      filtered = filtered.filter((order) => {
        if (paymentStatus === "paid") return order.paidStatus === true;
        if (paymentStatus === "break")
          return order.invoice && order.invoice.isBreak;
        if (paymentStatus === "unpaid") return order.paidStatus === false;
        return true;
      });
    }

    return filtered;
  }, [allOrders, searchTerm, paymentStatus, selectedDate]);

  const filteredTodayOrders = useMemo(() => {
    if (!todayOrders) return [];
    let filtered = todayOrders;

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter((order) => {
        const orderDate = order.createdAt
          ? new Date(order.createdAt).toISOString().split("T")[0]
          : "";
        return orderDate === selectedDate;
      });
    }

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customer?.name?.toLowerCase().includes(searchLower) ||
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.notes?.toLowerCase().includes(searchLower) ||
          order.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply payment status filter
    if (paymentStatus !== "all") {
      filtered = filtered.filter((order) => {
        if (paymentStatus === "paid") return order.paidStatus === true;
        if (paymentStatus === "break")
          return order.invoice && order.invoice.isBreak;
        if (paymentStatus === "unpaid") return order.paidStatus === false;
        return true;
      });
    }

    return filtered;
  }, [todayOrders, searchTerm, paymentStatus, selectedDate]);

  const filteredTomorrowOrders = useMemo(() => {
    if (!tomorrowOrders) return [];
    let filtered = tomorrowOrders;

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter((order) => {
        const orderDate = order.createdAt
          ? new Date(order.createdAt).toISOString().split("T")[0]
          : "";
        return orderDate === selectedDate;
      });
    }

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customer?.name?.toLowerCase().includes(searchLower) ||
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.notes?.toLowerCase().includes(searchLower) ||
          order.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply payment status filter
    if (paymentStatus !== "all") {
      filtered = filtered.filter((order) => {
        if (paymentStatus === "paid") return order.paidStatus === true;
        if (paymentStatus === "unpaid")
          return order.paidStatus === false && !order.invoice?.isBreak;
        if (paymentStatus === "break")
          return order.paidStatus == false && order.invoice;
        return true;
      });
    }

    return filtered;
  }, [tomorrowOrders, searchTerm, paymentStatus, selectedDate]);

  // Handle customer selection
  const handleSelectCustomer = (
    customer: OrderCustomer,
    categoryId: number
  ) => {
    setSelectedCustomer(customer);
    setSelectedCustomerId(customer.id);
    setSelectedCategoryId(categoryId);
    setIsCustomerOrdersModalOpen(true);
  };

  // Handle view order details
  const handleViewOrderDetails = (order: OrderResponseDto) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Handle order conversion to invoice
  const handleConvertToInvoice = (order: OrderResponseDto) => {
    setSelectedOrder(order);
    setIsInvoiceConversionModalOpen(true);
  };

  // Create order handler
  const handleCreateOrder = () => {
    setIsCreateModalOpen(true);
  };

  // Create category handler
  const handleCreateCategory = () => {
    setIsCategoryModalOpen(true);
  };

  // Handler to close both modals
  const closeAllModals = () => {
    setIsInvoiceConversionModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
      <SplineBackground activeTab="الطلبات" />
      {isLoading && <PageSpinner />}

      <div className="relative z-10">
        <Navbar />
        <main className="pt-32 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div
              className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              dir="rtl"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-slate-400" />
                <h1 className="text-2xl font-bold text-slate-200">
                  إدارة الطلبات
                </h1>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateCategory}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>إدارة التصنيفات</span>
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة طلب</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <OrdersSummaryComponent />

            {/* View Toggle and Filters */}
            <div
              className="mb-6 flex justify-start items-center gap-4 flex-wrap"
              dir="rtl"
            >
              <div className="bg-slate-800/50 p-1 rounded-lg flex">
                <button
                  onClick={() => setViewMode("byDate")}
                  className={`px-4 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                    viewMode === "byDate"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>عرض حسب الطلبيات</span>
                </button>
                <button
                  onClick={() => setViewMode("byCategory")}
                  className={`px-4 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                    viewMode === "byCategory"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Tags className="h-4 w-4" />
                  <span>عرض حسب الزبون</span>
                </button>
                <button
                  onClick={() => setViewMode("byMaterials")}
                  className={`px-4 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                    viewMode === "byMaterials"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>عرض حسب المواد</span>
                </button>

              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  id="date-filter"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {selectedDate && (
                  <button
                    onClick={clearDateFilter}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    title="إزالة تصفية التاريخ"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  id="payment-status-filter"
                  value={paymentStatus}
                  onChange={(e) =>
                    handlePaymentStatusChange(
                      e.target.value as "all" | "paid" | "unpaid" | "break"
                    )
                  }
                  className="bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">الكل</option>
                  <option value="paid">مدفوع</option>
                  <option value="unpaid">غير مدفوع</option>
                  <option value="break">كسر</option>
                </select>
                {paymentStatus !== "all" && (
                  <button
                    onClick={clearPaymentStatusFilter}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    title="إزالة تصفية حالة الدفع"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <OrdersTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              summary={summary}
            />

            {/* Content */}
            <div dir="rtl">
  {viewMode === "byDate" ? (
    <OrderListByDateView
      todayOrders={filteredTodayOrders}
      tomorrowOrders={filteredTomorrowOrders}
      allOrders={filteredAllOrders}
      isLoading={isLoading}
      activeTab={activeTab}
      onViewOrderDetails={handleViewOrderDetails}
      onSearchChange={setSearchTerm}
      searchTerm={searchTerm}
    />
  ) : viewMode === "byMaterials" ? (
    <OrderByCategoryMaterialsView
      orders={
        activeTab === "forToday"
          ? filteredTodayOrders
          : activeTab === "forTomorrow"
          ? filteredTomorrowOrders
          : filteredAllOrders
      }
      isLoading={isLoading}
      onViewOrderDetails={handleViewOrderDetails}
      // onDeleteOrder={handleCancelOrder}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    />
  ) : categories && categories.length > 0 ? (
    <div>
      {categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          orders={
            activeTab === "forToday"
              ? filteredTodayOrders
              : activeTab === "forTomorrow"
              ? filteredTomorrowOrders
              : filteredAllOrders
          }
          onSelectCustomer={(customer) =>
            handleSelectCustomer(customer, category.id)
          }
          selectedCustomerId={selectedCustomerId}
        />
      ))}
      {!categories.some((category) =>
        category.customers?.some((customer) =>
          (activeTab === "forToday"
            ? filteredTodayOrders
            : activeTab === "forTomorrow"
            ? filteredTomorrowOrders
            : filteredAllOrders
          ).some((order) => order.customerId === customer.id)
        )
      ) && (
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-6 text-center text-slate-400">
          لا توجد طلبات متاحة في هذا التصنيف
        </div>
      )}
    </div>
  ) : (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-6 text-center text-slate-400">
      لا توجد تصنيفات متاحة حاليًا
    </div>
  )}
</div>
          </div>
        </main>
      </div>

      {/* Customer Orders Modal */}
      {selectedCustomer && (
        <CustomerOrdersModal
          customer={selectedCustomer}
          categoryId={selectedCategoryId}
          orders={allOrders || []}
          isOpen={isCustomerOrdersModalOpen}
          onClose={() => {
            setIsCustomerOrdersModalOpen(false);
            setSelectedCustomerId(null);
            setSelectedCategoryId(null);
          }}
          onViewOrderDetails={handleViewOrderDetails}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrder(null);
            setIsInvoiceConversionModalOpen(false);
          }}
          onOrderUpdated={() => {
            // Refetch data when order is updated
          }}
          onConvertToInvoice={handleConvertToInvoice}
        />
      )}

      {/* Invoice Conversion Modal */}
      {selectedOrder && (
        <InvoiceOrderConversionModal
          order={selectedOrder}
          isOpen={isInvoiceConversionModalOpen}
          onClose={() => {
            setIsInvoiceConversionModalOpen(false);
          }}
          onSuccess={closeAllModals}
        />
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Refetch data when order is created
        }}
      />

      {/* Create Category Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};

export default OrdersPage;
