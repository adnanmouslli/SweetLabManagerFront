"use client";
import CombinedCustomerModal from "@/components/common/customers/CombinedCustomerModal";
import CustomerCategoryModal from "@/components/common/customers/CustomerCategoryModal";
import CustomerModal from "@/components/common/customers/CustomerModal";
import CustomerSummaryModal from "@/components/common/customers/CustomerSummaryModal";
import SupplierModal from "@/components/common/customers/SupplierModal";
import SupplierPaymentModal from "@/components/common/customers/SupplierPaymentModal";
import Navbar from "@/components/common/Navbar";
import PageSpinner from "@/components/common/PageSpinner";
import SplineBackground from "@/components/common/SplineBackground";
import {
  useCustomerCategories,
  useFetchCustomers,
} from "@/hooks/customers/useCustomers";
import { CustomerCategory } from "@/types/customerCategories.types";
import { AllCustomerType } from "@/types/customers.type";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  DollarSign,
  Edit,
  FileText,
  Filter,
  LayoutGrid,
  Loader2,
  Phone,
  Plus,
  Search,
  Tag,
  Trash2,
  Truck,
  Undo2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-SY", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Main Customers Page Component
const Customers = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByDebt, setFilterByDebt] = useState(false);
  const [filterByCategoryId, setFilterByCategoryId] = useState<number | null>(
    null
  );
  const [filterByCustomerType, setFilterByCustomerType] = useState<
    "all" | "customers" | "suppliers"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // State for customer operations modal
  const [customerModalConfig, setCustomerModalConfig] = useState<{
    isOpen: boolean;
    mode: "create" | "update" | "delete";
    customerData: AllCustomerType | null;
  }>({
    isOpen: false,
    mode: "create",
    customerData: null,
  });

  // State for category operations modal
  const [categoryModalConfig, setCategoryModalConfig] = useState<{
    isOpen: boolean;
    mode: "create" | "update" | "delete";
    categoryData: CustomerCategory | null;
  }>({
    isOpen: false,
    mode: "create",
    categoryData: null,
  });

  // State for supplier payment modal
  const [supplierPaymentModal, setSupplierPaymentModal] = useState<{
    isOpen: boolean;
    supplier: AllCustomerType | null;
  }>({
    isOpen: false,
    supplier: null,
  });

  // Fetch customers using the provided hook
  const {
    data: customersData = [],
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useFetchCustomers();

  // Fetch categories using the provided hook
  const { data: categoriesData = [], isLoading: isLoadingCategories } =
    useCustomerCategories();

  console.log("customersData >>>>>>>>>>>>>>>", customersData);

  const customers = useMemo(() => {
    return customersData.map((customer) => {
      // Calculate total debt from active debts
      const totalDebt = customer.debts
        .filter((debt) => debt.status === "active")
        .reduce((sum, debt) => sum + debt.remainingAmount, 0);

      return {
        ...customer,
        totalDebt,
      };
    });
  }, [customersData]);

  const itemsPerPage = 12;

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterByDebt, filterByCategoryId, filterByCustomerType]);

  // Filter and paginate customers
  const filteredCustomers = customers.filter((customer) => {
    // Apply search filter
    const searchMatch =
      (customer.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (customer.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    // Apply debt filter
    const debtMatch = filterByDebt ? customer.totalDebt > 0 : true;

    // Apply category filter
    const categoryMatch = filterByCategoryId
      ? customer.categoryId === filterByCategoryId
      : true;

    // Apply customer type filter
    const customerTypeMatch =
      filterByCustomerType === "all"
        ? true
        : filterByCustomerType === "customers"
        ? customer.customerType === "CUSTOMER"
        : customer.customerType === "SUPPLIER";

    // Skip customers with missing essential data
    if (!customer.name || !customer.customerType) {
      return false;
    }

    return searchMatch && debtMatch && categoryMatch && customerTypeMatch;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Edit category handler
  const handleEditCategory = (category: CustomerCategory) => {
    setCategoryModalConfig({
      isOpen: true,
      mode: "update",
      categoryData: category,
    });
  };

  // Delete category handler
  const handleDeleteCategory = (category: CustomerCategory) => {
    setCategoryModalConfig({
      isOpen: true,
      mode: "delete",
      categoryData: category,
    });
  };

  const handleViewCustomer = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setIsCustomerModalOpen(true);
  };

  // Handler for adding new customer
  const handleAddCustomer = () => {
    setCustomerModalConfig({
      isOpen: true,
      mode: "create",
      customerData: null,
    });
  };

  // Handler for editing customer
  const handleEditCustomer = (
    customer: AllCustomerType,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering view customer modal
    setCustomerModalConfig({
      isOpen: true,
      mode: "update",
      customerData: customer,
    });
  };

  // Handler for deleting customer
  const handleDeleteCustomer = (
    customer: AllCustomerType,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering view customer modal
    setCustomerModalConfig({
      isOpen: true,
      mode: "delete",
      customerData: customer,
    });
  };

  // Handler for supplier payment
  const handleSupplierPayment = (
    customer: AllCustomerType,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSupplierPaymentModal({
      isOpen: true,
      supplier: customer,
    });
  };

  // Handler for adding new category
  const handleAddCategory = () => {
    setCategoryModalConfig({
      isOpen: true,
      mode: "create",
      categoryData: null,
    });
  };

  // Listen for custom event to open the category modal
  useEffect(() => {
    const handleAddCategoryEvent = () => handleAddCategory();
    window.addEventListener("add-category", handleAddCategoryEvent);
    return () => {
      window.removeEventListener("add-category", handleAddCategoryEvent);
    };
  }, []);

  // Close the customer operations modal
  const closeCustomerModal = () => {
    setCustomerModalConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Close the category operations modal
  const closeCategoryModal = () => {
    setCategoryModalConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Close the supplier payment modal
  const closeSupplierPaymentModal = () => {
    setSupplierPaymentModal({
      isOpen: false,
      supplier: null,
    });
  };

  // Toggle category filter
  const toggleCategoryFilter = (categoryId: number) => {
    if (filterByCategoryId === categoryId) {
      // If clicking the already selected category, clear the filter
      setFilterByCategoryId(null);
    } else {
      // Otherwise, set the filter to this category
      setFilterByCategoryId(categoryId);
    }
  };

  const isLoading = isLoadingCustomers || isLoadingCategories;
  const error = customersError;

  return (
    <div className="min-h-screen bg-slate-900 relative transition-colors duration-300">
      {isLoading && <PageSpinner />}
      <SplineBackground activeTab="customers" />

      <div className="relative z-10">
        <Navbar />

        <main className="py-12 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Title and Description */}
            <div className="text-center mb-6" dir="rtl">
              <h1 className="text-3xl font-bold text-white mb-3">
                {filterByCustomerType === "customers"
                  ? "إدارة العملاء"
                  : filterByCustomerType === "suppliers"
                  ? "إدارة الموردين"
                  : "إدارة العملاء والموردين"}
              </h1>
              <p className="text-base text-gray-300 max-w-2xl mx-auto">
                {filterByCustomerType === "customers"
                  ? "إدارة بيانات العملاء والمبيعات والديون"
                  : filterByCustomerType === "suppliers"
                  ? `إدارة بيانات الموردين والمشتريات. إجمالي الأرصدة المستحقة: ${formatCurrency(
                      customers
                        .filter((c) => c.customerType === "SUPPLIER")
                        .reduce((sum, c) => sum + (c.supplierBalance || 0), 0)
                    )} ل.س`
                  : "إدارة بيانات العملاء والموردين والمبيعات والمشتريات"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mb-4 flex justify-center gap-4">
              <button
                onClick={handleAddCustomer}
                className="flex items-center gap-2 px-5 py-2 rounded-lg 
                         bg-blue-500 text-white hover:bg-blue-600 transition-colors
                         shadow-lg shadow-blue-500/20 text-sm"
                dir="rtl"
              >
                <Plus className="h-4 w-4" />
                {filterByCustomerType === "suppliers"
                  ? "إضافة مورد جديد"
                  : filterByCustomerType === "customers"
                  ? "إضافة عميل جديد"
                  : "إضافة عميل أو مورد جديد"}
              </button>

              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 px-5 py-2 rounded-lg 
                        bg-purple-500 text-white hover:bg-purple-600 transition-colors
                        shadow-lg shadow-purple-500/20 text-sm"
                dir="rtl"
              >
                <Tag className="h-4 w-4" />
                إضافة تصنيف
              </button>
            </div>

            {/* Search and Filters */}
            <div
              className="mb-6 flex flex-col md:flex-row gap-3 px-4"
              dir="rtl"
            >
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    filterByCustomerType === "suppliers"
                      ? "بحث عن مورد..."
                      : filterByCustomerType === "customers"
                      ? "بحث عن عميل..."
                      : "بحث عن عميل أو مورد..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 pr-10 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter by debt */}
              <button
                onClick={() => setFilterByDebt(!filterByDebt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  filterByDebt
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                <Filter className="h-4 w-4" />
                {filterByCustomerType === "suppliers"
                  ? "موردين لديهم ديون"
                  : filterByCustomerType === "customers"
                  ? "عملاء لديهم ديون"
                  : "عملاء وموردين لديهم ديون"}
              </button>

              {/* Customer Type Filter */}
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  onClick={() => setFilterByCustomerType("all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors text-sm ${
                    filterByCustomerType === "all"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  الكل
                </button>
                <button
                  onClick={() => setFilterByCustomerType("customers")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors text-sm ${
                    filterByCustomerType === "customers"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  العملاء
                </button>
                <button
                  onClick={() => setFilterByCustomerType("suppliers")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors text-sm ${
                    filterByCustomerType === "suppliers"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  الموردين
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors text-sm ${
                    viewMode === "grid"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors text-sm ${
                    viewMode === "table"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Categories Filter */}
            {categoriesData.length > 0 && (
              <div className="mb-4" dir="rtl">
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-1.5 px-4 pb-1">
                    {categoriesData.map((category) => (
                      <div key={category.id} className="relative group">
                        <button
                          onClick={() => toggleCategoryFilter(category.id)}
                          className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs transition-colors ${
                            filterByCategoryId === category.id
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                          }`}
                        >
                          <Tag className="h-3 w-3 inline-block mx-1" />
                          {category.name}
                        </button>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                            className="w-full text-right px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 rounded-t-lg"
                          >
                            <Edit className="h-3 w-3 inline-block mx-1" />
                            تعديل
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category);
                            }}
                            className="w-full text-right px-2.5 py-1 text-xs text-red-400 hover:bg-slate-700 rounded-b-lg"
                          >
                            <Trash2 className="h-3 w-3 inline-block mx-1" />
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Customers Content */}
            <div className="container mx-auto px-4" dir="rtl">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                  <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-red-400 mb-2">
                    خطأ في تحميل البيانات
                  </h3>
                  <p className="text-slate-300 text-sm">
                    حدث خطأ أثناء تحميل بيانات العملاء. يرجى المحاولة مرة أخرى.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                  >
                    <Undo2 className="h-3.5 w-3.5 inline-block mx-1.5" />
                    إعادة تحميل
                  </button>
                </div>
              ) : paginatedCustomers.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center text-gray-400">
                  {searchTerm ||
                  filterByDebt ||
                  filterByCategoryId ||
                  filterByCustomerType !== "all"
                    ? "لا توجد نتائج للبحث"
                    : "لا يوجد عملاء أو موردين"}
                </div>
              ) : viewMode === "grid" ? (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {paginatedCustomers.map((customer, index) => (
                      <motion.div
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-white/10 rounded-xl p-3 
                                   hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all duration-300
                                   flex flex-col h-full min-h-[280px]"
                        onClick={() => handleViewCustomer(customer.id)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-base font-medium text-white line-clamp-1 flex-1 mr-2">
                            {customer.name || "بدون اسم"}
                          </h3>
                          <div className="flex gap-1.5 flex-shrink-0">
                            {/* Customer Type Badge */}
                            {customer.customerType && (
                              <div
                                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                  customer.customerType === "SUPPLIER"
                                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}
                              >
                                {customer.customerType === "SUPPLIER"
                                  ? "مورد"
                                  : "عميل"}
                              </div>
                            )}
                            {/* Balance/Debt Badge */}
                            {customer.customerType === "SUPPLIER" ? (
                              customer.supplierBalance > 0 ? (
                                <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                  {formatCurrency(customer.supplierBalance)} ل.س
                                </div>
                              ) : null
                            ) : (
                              customer.totalDebt > 0 && (
                                <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                  {formatCurrency(customer.totalDebt)} ل.س
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-400 mb-0.5">
                              رقم الهاتف
                            </div>
                            <div className="text-white text-xs" dir="ltr">
                              {customer.phone || "بدون رقم"}
                            </div>
                          </div>
                        </div>

                        {customer.category && (
                          <div className="mb-3 flex">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <Tag className="h-3 w-3 inline-block mx-1" />
                              {customer.category.name}
                            </span>
                          </div>
                        )}

                        {/* Supplier Balance Display */}
                        {customer.customerType === "SUPPLIER" && (
                          <div className="mb-2">
                            {customer.supplierBalance > 0 ? (
                              <div className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-medium text-red-400">
                                    رصيد المورد:
                                  </span>
                                  <span className="text-sm font-bold text-red-400 break-words text-right max-w-[90px]">
                                    {formatCurrency(customer.supplierBalance)}{" "}
                                    ل.س
                                  </span>
                                </div>
                                <div className="w-full bg-red-200/30 rounded-full h-1.5 mb-1.5">
                                  <div
                                    className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min(
                                        (customer.supplierBalance / 1000000) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="text-xs text-red-300 text-center font-medium">
                                  مستحق الدفع
                                </div>
                              </div>
                            ) : (
                              <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-emerald-400">
                                    رصيد المورد:
                                  </span>
                                  <span className="text-sm font-bold text-emerald-400">
                                    لا يوجد رصيد
                                  </span>
                                </div>
                                <div className="text-xs text-emerald-300 text-center font-medium">
                                  متوازن
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-1 mt-auto pt-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCustomer(customer.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg 
                                     bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors
                                     border border-blue-500/20 text-xs font-medium"
                          >
                            <FileText className="w-3 h-3" />
                            عرض
                          </button>
                          <button
                            onClick={(e) => handleEditCustomer(customer, e)}
                            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg 
                                     bg-slate-600/30 text-slate-300 hover:bg-slate-600/50 transition-colors
                                     border border-slate-600/30 text-xs font-medium"
                          >
                            <Edit className="w-3 h-3" />
                            تعديل
                          </button>
                          {customer.customerType === "SUPPLIER" &&
                            customer.supplierBalance > 0 && (
                              <button
                                onClick={(e) =>
                                  handleSupplierPayment(customer, e)
                                }
                                className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg 
                                       bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors
                                       border border-green-500/20 text-xs font-medium min-w-0"
                                title={`دفع المستحقات: ${formatCurrency(
                                  customer.supplierBalance
                                )} ل.س`}
                              >
                                <DollarSign className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {formatCurrency(customer.supplierBalance)}
                                </span>
                              </button>
                            )}
                          <button
                            onClick={(e) => handleDeleteCustomer(customer, e)}
                            className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg 
                                     bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors
                                     border border-red-500/20 text-xs font-medium"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                // Table View
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="text-right text-slate-200 p-3 text-sm">
                          الاسم
                        </th>
                        <th className="text-right text-slate-200 p-3 text-sm">
                          رقم الهاتف
                        </th>
                        <th className="text-right text-slate-200 p-3 text-sm">
                          النوع
                        </th>
                        <th className="text-right text-slate-200 p-3 text-sm">
                          التصنيف
                        </th>
                        <th className="text-right text-slate-200 p-3 text-sm">
                          {filterByCustomerType === "suppliers"
                            ? "رصيد المورد"
                            : "الديون"}
                        </th>
                        <th className="text-right text-slate-200 p-3 text-sm">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-t border-white/10 hover:bg-slate-700/20 transition-colors"
                          onClick={() => handleViewCustomer(customer.id)}
                        >
                          <td className="p-3 text-slate-300 font-medium text-sm">
                            {customer.name || "بدون اسم"}
                          </td>
                          <td className="p-3 text-slate-300 text-sm" dir="ltr">
                            {customer.phone || "بدون رقم"}
                          </td>
                          <td className="p-3">
                            {customer.customerType ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                  customer.customerType === "SUPPLIER"
                                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}
                              >
                                {customer.customerType === "SUPPLIER"
                                  ? "مورد"
                                  : "عميل"}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            {customer.category ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {customer.category.name}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            {customer.customerType === "SUPPLIER" ? (
                              <div className="space-y-1.5">
                                {/* Supplier Balance */}
                                {customer.supplierBalance > 0 ? (
                                  <div className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-red-400 font-medium">
                                        رصيد المورد:
                                      </span>
                                      <span className="text-xs font-bold text-red-400 break-words text-right max-w-[70px]">
                                        {formatCurrency(
                                          customer.supplierBalance
                                        )}{" "}
                                        ل.س
                                      </span>
                                    </div>
                                    <div className="w-full bg-red-200/30 rounded-full h-1">
                                      <div
                                        className="bg-red-500 h-1 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${Math.min(
                                            (customer.supplierBalance /
                                              1000000) *
                                              100,
                                            100
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-red-300 text-center mt-0.5">
                                      مستحق الدفع
                                    </div>
                                  </div>
                                ) : (
                                  <div className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="text-center">
                                      <span className="text-xs font-medium text-emerald-400">
                                        لا يوجد رصيد
                                      </span>
                                      <div className="text-xs text-emerald-300 mt-0.5">
                                        متوازن
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {/* Customer Debts */}
                                {customer.totalDebt > 0 && (
                                  <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                    ديون: {formatCurrency(customer.totalDebt)}{" "}
                                    ل.س
                                  </div>
                                )}
                              </div>
                            ) : // Customer debts display
                            customer.totalDebt > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                {formatCurrency(customer.totalDebt)} ل.س
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                لا يوجد
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div
                              className="flex gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleViewCustomer(customer.id)}
                                className="flex items-center gap-1 px-1 py-0.5 rounded-lg 
                                        bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors
                                        border border-blue-500/20 text-xs"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                عرض
                              </button>
                              <button
                                onClick={(e) => handleEditCustomer(customer, e)}
                                className="flex items-center gap-1 px-1 py-0.5 rounded-lg 
                                        bg-slate-600/30 text-slate-300 hover:bg-slate-600/50 transition-colors
                                        border border-slate-600/30 text-xs"
                              >
                                <Edit className="w-2.5 h-2.5" />
                                تعديل
                              </button>
                              {customer.customerType === "SUPPLIER" &&
                                customer.supplierBalance > 0 && (
                                  <button
                                    onClick={(e) =>
                                      handleSupplierPayment(customer, e)
                                    }
                                    className="flex items-center justify-center gap-1 px-1 py-0.5 rounded-lg 
                                          bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors
                                          border border-green-500/20 text-xs min-w-0"
                                    title={`دفع المستحقات: ${formatCurrency(
                                      customer.supplierBalance
                                    )} ل.س`}
                                  >
                                    <DollarSign className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate max-w-10">
                                      {formatCurrency(customer.supplierBalance)}
                                    </span>
                                  </button>
                                )}
                              <button
                                onClick={(e) =>
                                  handleDeleteCustomer(customer, e)
                                }
                                className="flex items-center gap-1 px-1 py-0.5 rounded-lg 
                                        bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors
                                        border border-red-500/20 text-xs"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="mt-6 flex justify-center items-center gap-3"
                dir="rtl"
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors border border-white/10 text-sm"
                >
                  السابق
                </button>

                <div className="flex items-center gap-2" dir="rtl">
                  <span className="text-white text-sm">الصفحة</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
                  >
                    {[...Array(totalPages)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <span className="text-white text-sm">من {totalPages}</span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors border border-white/10 text-sm"
                >
                  التالي
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="mt-3 text-center text-gray-400 text-sm">
              إجمالي النتائج: {filteredCustomers.length}
            </div>
          </div>
        </main>
      </div>

      {/* Customer Summary Modal */}
      <CustomerSummaryModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerId={selectedCustomerId}
      />

      {/* Customer Operations Modal (Create/Update/Delete) */}
      {filterByCustomerType === "all" ? (
        <CombinedCustomerModal
          isOpen={customerModalConfig.isOpen}
          onClose={closeCustomerModal}
          mode={customerModalConfig.mode}
          customerData={customerModalConfig.customerData}
          categories={categoriesData}
        />
      ) : filterByCustomerType === "suppliers" ? (
        <SupplierModal
          isOpen={customerModalConfig.isOpen}
          onClose={closeCustomerModal}
          mode={customerModalConfig.mode}
          supplierData={customerModalConfig.customerData}
          categories={categoriesData}
        />
      ) : (
        <CustomerModal
          isOpen={customerModalConfig.isOpen}
          onClose={closeCustomerModal}
          mode={customerModalConfig.mode}
          customerData={customerModalConfig.customerData}
          categories={categoriesData}
        />
      )}

      {/* Category Operations Modal (Create/Update/Delete) */}
      <CustomerCategoryModal
        isOpen={categoryModalConfig.isOpen}
        onClose={closeCategoryModal}
        mode={categoryModalConfig.mode}
        categoryData={categoryModalConfig.categoryData}
      />

      {/* Supplier Payment Modal */}
      {supplierPaymentModal.supplier && (
        <SupplierPaymentModal
          isOpen={supplierPaymentModal.isOpen}
          onClose={closeSupplierPaymentModal}
          supplier={supplierPaymentModal.supplier}
        />
      )}
    </div>
  );
};

export default Customers;
