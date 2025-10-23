import { useFetchCustomers } from "@/hooks/customers/useCustomers";
import { useItems } from "@/hooks/items/useItems";
import { useOrderCategories, useUpdateOrder } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/formatters";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  Package,
  Plus,
  Save,
  Tag,
  User,
  X,
  Search,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { OrderResponseDto, UpdateOrder } from "@/types/orders.type";
import CombinedCustomerModal from "@/components/common/customers/CombinedCustomerModal";
import { useFetchCategories } from "@/hooks/customers/useCustomersCategories";

interface ItemUnit {
  unit: string;
  price: number;
  factor: number;
}

interface Item {
  id: number;
  name: string;
  units: ItemUnit[];
  defaultUnit: string;
}

interface OrderItem {
  id?: number;
  itemId: string | number;
  quantity: number | string;
  unitPrice: number | string;
  unit: string;
  notes: string;
}

interface OrderFormData {
  customerId: string | number;
  categoryId: string | number;
  notes: string;
  paidStatus: boolean;
  isForToday: boolean;
  items: OrderItem[];
}

interface OrderErrors {
  customerId?: string;
  categoryId?: string;
  [key: string]: string | undefined;
}

interface EditOrderModalProps {
  order: OrderResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Query hooks
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError,
    refetch: refetchCustomers,
  } = useFetchCustomers();

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useOrderCategories();

  const {
    data: customerCategories = [],
    isLoading: isLoadingCustomerCategories,
  } = useFetchCategories();

  const {
    data: items = [],
    isLoading: isLoadingItems,
    error: itemsError,
  } = useItems();

  const {
    mutate: updateOrder,
    isPending,
    error: updateOrderError,
  } = useUpdateOrder();

  // State for form data
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: "",
    categoryId: "",
    notes: "",
    paidStatus: false,
    isForToday: false, // Default to false
    items: [{ itemId: "", quantity: "1", unitPrice: "0", unit: "", notes: "" }],
  });

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] =
    useState<boolean>(false);
  const [customerMenuSearch, setCustomerMenuSearch] = useState<string>("");
  const [itemSearchTerm, setItemSearchTerm] = useState<string>("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] =
    useState<boolean>(false);

  // Initialize form with order data when available
  useEffect(() => {
    if (order && isOpen) {
      const isToday = checkIfToday(order.scheduledFor);

      setFormData({
        customerId: order.customerId,
        categoryId: order.categoryId,
        notes: order.notes || "",
        paidStatus: order.paidStatus || false,
        isForToday: isToday,
        items: order.items.map((item) => ({
          id: item.id,
          itemId: item.itemId,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          unit: item.unit,
          notes: item.notes || "",
        })),
      });

      setTotalAmount(order.totalAmount);
      setActiveItemIndex(0);
      setErrors({});
      setIsEditingNotes(false);
      setCustomerMenuSearch("");
      setIsCustomerDropdownOpen(false);
      setItemSearchTerm("");
    }
  }, [order, isOpen]);

  // Helper function to check if a date is today
  const checkIfToday = (dateString?: string): boolean => {
    if (!dateString) return false;

    const date = new Date(dateString);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Log errors to console
  useEffect(() => {
    if (customersError) {
      console.error("Customers fetch error:", customersError);
    }

    if (categoriesError) {
      console.error("Categories fetch error:", categoriesError);
    }

    if (itemsError) {
      console.error("Items fetch error:", itemsError);
    }

    if (updateOrderError) {
      console.error("Update order error:", updateOrderError);
    }
  }, [customersError, categoriesError, itemsError, updateOrderError]);

  // Calculate total amount
  useEffect(() => {
    try {
      const total = formData.items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity as string) || 0;
        const unitPrice = parseFloat(item.unitPrice as string) || 0;
        return sum + quantity * unitPrice;
      }, 0);
      setTotalAmount(total);
    } catch (error) {
      console.error("Error calculating total amount:", error);
      setTotalAmount(0);
    }
  }, [formData.items]);

  // Handle input changes
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      try {
        const { name, value, type } = e.target;
        const checked =
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : undefined;

        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error when field is filled
        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
      } catch (error) {
        console.error("Error handling input change:", error);
      }
    },
    [errors]
  );

  // Handle item changes
  const handleItemChange = useCallback(
    (index: number, field: keyof OrderItem, value: string | number) => {
      try {
        setFormData((prev) => {
          const updatedItems = [...prev.items];
          updatedItems[index] = { ...updatedItems[index], [field]: value };

          // If item changes, update unit and price if possible
          if (field === "itemId" && items && value) {
            const selectedItem = items.find(
              (item) => item.id === parseInt(value as string)
            );
            if (
              selectedItem &&
              selectedItem.units &&
              selectedItem.units.length > 0
            ) {
              const defaultUnit =
                selectedItem.units.find(
                  (u) => u.unit === selectedItem.defaultUnit
                ) || selectedItem.units[0];
              if (defaultUnit) {
                updatedItems[index].unit = defaultUnit.unit;
                updatedItems[index].unitPrice = defaultUnit.price.toString();
              }
            }
          }

          return { ...prev, items: updatedItems };
        });

        // Clear error when field is filled
        if (errors[`${field}-${index}`]) {
          setErrors((prev) => ({ ...prev, [`${field}-${index}`]: undefined }));
        }
      } catch (error) {
        console.error("Error handling item change:", error);
      }
    },
    [errors, items]
  );

  // Add a new item
  const addItem = useCallback(() => {
    try {
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          { itemId: "", quantity: "1", unitPrice: "0", unit: "", notes: "" },
        ],
      }));
      setActiveItemIndex(formData.items.length);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  }, [formData.items.length]);

  // Remove an item
  const removeItem = useCallback(
    (index: number) => {
      try {
        if (formData.items.length > 1) {
          setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
          }));

          // Adjust active index if needed
          if (activeItemIndex >= index && activeItemIndex > 0) {
            setActiveItemIndex(activeItemIndex - 1);
          } else if (activeItemIndex >= formData.items.length - 1) {
            setActiveItemIndex(formData.items.length - 2);
          }
        } else {
          console.error("Cannot remove the last item");
        }
      } catch (error) {
        console.error("Error removing item:", error);
      }
    },
    [formData.items.length, activeItemIndex]
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    try {
      const newErrors: OrderErrors = {};
      let isValid = true;

      // Validate basic fields
      if (!formData.customerId) {
        newErrors.customerId = "الرجاء اختيار العميل";
        isValid = false;
      }

      if (!formData.categoryId) {
        newErrors.categoryId = "الرجاء اختيار التصنيف";
        isValid = false;
      }

      // Validate items
      formData.items.forEach((item, index) => {
        if (!item.itemId) {
          newErrors[`item-${index}`] = "الرجاء اختيار المنتج";
          isValid = false;
        }

        const quantity = parseFloat(item.quantity as string);
        if (!item.quantity || isNaN(quantity) || quantity <= 0) {
          newErrors[`quantity-${index}`] = "الرجاء إدخال كمية صحيحة";
          isValid = false;
        }

        const unitPrice = parseFloat(item.unitPrice as string);
        if (!item.unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
          newErrors[`price-${index}`] = "الرجاء إدخال سعر صحيح";
          isValid = false;
        }

        if (!item.unit) {
          newErrors[`unit-${index}`] = "الرجاء اختيار الوحدة";
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    } catch (error) {
      console.error("Error validating form:", error);
      return false;
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!order || !order.id) {
        console.error("No order ID available for update");
        return;
      }

      try {
        if (!validateForm()) {
          // Scroll to first error
          const firstError = document.querySelector(".border-red-500");
          if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        // Prepare order data for update
        const updateData: UpdateOrder = {
          customerId: parseInt(formData.customerId as string),
          categoryId: parseInt(formData.categoryId as string),
          totalAmount,
          paidStatus: formData.paidStatus,
          notes: formData.notes,
          // Use existing items structure but with updated values
          items: formData.items.map((item) => ({
            id: item.id, // Keep original ID if exists
            itemId: parseInt(item.itemId as string),
            quantity: parseFloat(item.quantity as string),
            unitPrice: parseFloat(item.unitPrice as string),
            unit: item.unit,
            notes: item.notes,
          })),
        };

        // Submit update
        updateOrder(
          {
            orderId: order.id as number,
            data: updateData,
          },
          {
            onSuccess: () => {
              console.log("Order updated successfully");
              onClose();
              if (onSuccess) onSuccess();
            },
            onError: (error) => {
              console.error("Error updating order:", error);
            },
          }
        );
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
    [
      formData,
      totalAmount,
      validateForm,
      updateOrder,
      onClose,
      onSuccess,
      order,
    ]
  );

  // Customers filtered by in-menu search
  const dropdownCustomers = useMemo(() => {
    if (!customerMenuSearch.trim()) return customers;
    const term = customerMenuSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(customerMenuSearch))
    );
  }, [customers, customerMenuSearch]);

  // Filter items based on search term for the active item
  const filteredItems = useMemo(() => {
    if (!itemSearchTerm.trim()) return items;

    return items.filter((item) =>
      item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
    );
  }, [items, itemSearchTerm]);

  // Helper functions for display
  const getCustomerName = useCallback((): string => {
    if (!customers || !formData.customerId) return "";
    const customer = customers.find(
      (c) => c.id === parseInt(formData.customerId as string)
    );
    return customer ? customer.name : "";
  }, [customers, formData.customerId]);

  const getCategoryName = useCallback((): string => {
    if (!categories || !formData.categoryId) return "";
    const category = categories.find(
      (c) => c.id === parseInt(formData.categoryId as string)
    );
    return category ? category.name : "";
  }, [categories, formData.categoryId]);

  const getItemUnits = useCallback(
    (itemId: string | number) => {
      if (!items || !itemId) return [];
      const item = items.find((i) => i.id === parseInt(itemId as string));
      return item?.units || [];
    },
    [items]
  );

  const getItemName = useCallback(
    (itemId: string | number): string => {
      if (!items || !itemId) return "";
      const item = items.find((i) => i.id === parseInt(itemId as string));
      return item ? item.name : "";
    },
    [items]
  );

  const formatItemTitle = useCallback(
    (index: number, item: OrderItem): string => {
      const itemName = getItemName(item.itemId);
      const quantity = parseFloat(item.quantity as string) || 0;
      const unitPrice = parseFloat(item.unitPrice as string) || 0;
      const amount = quantity * unitPrice;

      if (!itemName) return `العنصر #${index + 1}`;
      return `${itemName} - ${formatCurrency(amount)}`;
    },
    [getItemName]
  );

  // Flag for loading/error states
  const hasDataLoadingErrors = Boolean(
    customersError || categoriesError || itemsError
  );

  // Early return if modal is closed or no order
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden my-4"
        dir="rtl"
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            تعديل الطلب #{order.orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-700/50 p-1"
            aria-label="إغلاق"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {hasDataLoadingErrors && (
          <div className="m-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-200 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">حدث خطأ أثناء تحميل البيانات</p>
              <p className="text-sm">
                يرجى تحديث الصفحة والمحاولة مرة أخرى. إذا استمرت المشكلة، تواصل
                مع الدعم الفني.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-64px)]"
        >
          {/* Customer and Category Section */}
          <div className="bg-slate-850/60 p-4 border-b border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              {/* Customer Selection */}
              <div className="relative">
                <label
                  htmlFor="customerId"
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
                >
                  <User className="h-4 w-4 text-primary" />
                  العميل *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomerDropdownOpen((v) => !v)}
                  className={`w-full px-4 py-2 bg-slate-700/40 border ${
                    errors.customerId ? "border-red-500" : "border-slate-600"
                  } rounded-lg text-slate-200 text-right flex items-center justify-between`}
                >
                  <span className="truncate">
                    {getCustomerName() || "اختر العميل"}
                  </span>
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </button>

                {isCustomerDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-700">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="ابحث بالاسم أو الهاتف..."
                          value={customerMenuSearch}
                          onChange={(e) =>
                            setCustomerMenuSearch(e.target.value)
                          }
                          className="w-full bg-slate-700/40 border border-slate-600 rounded-lg py-2 pr-10 pl-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, customerId: "" }));
                          setIsCustomerDropdownOpen(false);
                        }}
                        className="w-full text-right px-4 py-2 text-slate-400 hover:bg-slate-700/50"
                      >
                        اختر العميل
                      </button>
                      {dropdownCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              customerId: customer.id,
                            }));
                            setIsCustomerDropdownOpen(false);
                          }}
                          className={`w-full text-right px-4 py-2 hover:bg-slate-700/70 text-slate-200 ${
                            formData.customerId &&
                            Number(formData.customerId) === customer.id
                              ? "bg-slate-700/60"
                              : ""
                          }`}
                        >
                          {customer.name}
                          {customer.phone ? ` - ${customer.phone}` : ""}
                        </button>
                      ))}
                      {dropdownCustomers.length === 0 && (
                        <div className="px-4 py-3 text-slate-400 text-right">
                          لا توجد نتائج
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {errors.customerId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.customerId}
                  </p>
                )}
                {formData.customerId && (
                  <p className="text-primary text-xs mt-1">
                    {getCustomerName()}
                  </p>
                )}
              </div>

              {/* Add New Customer Button */}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20 text-sm"
                  title="إضافة عميل جديد"
                >
                  <UserPlus className="h-4 w-4" />
                  إضافة عميل جديد
                </button>
              </div>

              {/* Category Selection */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"
                >
                  <Tag className="h-4 w-4 text-primary" />
                  التصنيف *
                </label>
                <div className="relative">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-700/40 border ${
                      errors.categoryId ? "border-red-500" : "border-slate-600"
                    } rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none`}
                    disabled={isLoadingCategories || !!categoriesError}
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-400">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.categoryId}
                  </p>
                )}
                {formData.categoryId && (
                  <p className="text-primary text-xs mt-1">
                    {getCategoryName()}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Option */}
            <div className="flex items-center gap-2 mt-4 p-2 bg-slate-700/20 rounded-lg border border-slate-700/30 hover:border-primary/30 transition-colors cursor-pointer">
              <input
                type="checkbox"
                id="isForToday"
                name="isForToday"
                checked={formData.isForToday}
                onChange={handleInputChange}
                className="rounded bg-slate-700/30 border-slate-600 text-primary focus:ring-primary/30"
              />
              <label
                htmlFor="isForToday"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer w-full"
              >
                <Calendar className="h-4 w-4 text-warning" />
                تسليم اليوم
                <span className="text-xs text-slate-400 mx-2">
                  (إذا لم يتم التحديد، سيتم جدولة التسليم للغد)
                </span>
              </label>
            </div>
          </div>

          {/* Items Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-slate-300 font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                عناصر الطلب *
              </h4>
            </div>

            {/* Items Tabs */}
            <div className="flex mb-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {formData.items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveItemIndex(index)}
                  className={`px-3 py-1.5 mx-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-1 transition-all ${
                    activeItemIndex === index
                      ? "bg-primary text-white shadow-md"
                      : "bg-slate-700/40 text-slate-300 hover:bg-slate-700/60"
                  }`}
                >
                  {formatItemTitle(index, item)}
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(index);
                      }}
                      className="mx-2 p-0.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      aria-label="حذف العنصر"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex items-center gap-1 bg-slate-700/20 text-slate-300 hover:bg-slate-700/40 transition-colors"
                disabled={isLoadingItems || !!itemsError}
              >
                <Plus className="h-4 w-4" />
                إضافة عنصر
              </button>
            </div>

            {/* Active Item Form */}
            <div className="bg-slate-700/20 p-4 rounded-lg mb-4 border border-slate-700/50 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Item Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Package className="h-4 w-4 text-primary" />
                    المنتج *
                  </label>

                  {/* Search box for items */}
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="بحث عن منتج..."
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      className="w-full bg-slate-700/30 border border-slate-600 rounded-lg py-2 pr-10 pl-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={formData.items[activeItemIndex]?.itemId || ""}
                      onChange={(e) =>
                        handleItemChange(
                          activeItemIndex,
                          "itemId",
                          e.target.value
                        )
                      }
                      className={`w-full bg-slate-700/40 border ${
                        errors[`item-${activeItemIndex}`]
                          ? "border-red-500"
                          : "border-slate-600"
                      } rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none`}
                      disabled={isLoadingItems || !!itemsError}
                    >
                      <option value="">اختر المنتج</option>
                      {filteredItems.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-400">
                      <svg
                        className="h-4 w-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors[`item-${activeItemIndex}`] && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[`item-${activeItemIndex}`]}
                    </p>
                  )}
                  {formData.items[activeItemIndex]?.itemId && (
                    <p className="text-primary text-xs mt-1">
                      {getItemName(formData.items[activeItemIndex].itemId)}
                    </p>
                  )}
                </div>

                {/* Unit Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Tag className="h-4 w-4 text-primary" />
                    الوحدة *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.items[activeItemIndex]?.unit || ""}
                      onChange={(e) => {
                        try {
                          const selectedUnit = getItemUnits(
                            formData.items[activeItemIndex].itemId
                          ).find((u) => u.unit === e.target.value);

                          handleItemChange(
                            activeItemIndex,
                            "unit",
                            e.target.value
                          );

                          if (selectedUnit) {
                            handleItemChange(
                              activeItemIndex,
                              "unitPrice",
                              selectedUnit.price.toString()
                            );
                          }
                        } catch (error) {
                          console.error("Error handling unit change:", error);
                        }
                      }}
                      className={`w-full bg-slate-700/40 border ${
                        errors[`unit-${activeItemIndex}`]
                          ? "border-red-500"
                          : "border-slate-600"
                      } rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none`}
                      disabled={
                        !formData.items[activeItemIndex]?.itemId ||
                        isLoadingItems ||
                        !!itemsError
                      }
                    >
                      <option value="">اختر الوحدة</option>
                      {getItemUnits(
                        formData.items[activeItemIndex]?.itemId || ""
                      ).map((unit, i) => (
                        <option key={i} value={unit.unit}>
                          {unit.unit} - {formatCurrency(unit.price)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-400">
                      <svg
                        className="h-4 w-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors[`unit-${activeItemIndex}`] && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[`unit-${activeItemIndex}`]}
                    </p>
                  )}
                  {formData.items[activeItemIndex]?.unit && (
                    <p className="text-primary text-xs mt-1">
                      {formData.items[activeItemIndex].unit}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Quantity */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Package className="h-4 w-4 text-primary" />
                    الكمية *
                  </label>
                  <input
                    type="number"
                    value={formData.items[activeItemIndex]?.quantity || ""}
                    onChange={(e) =>
                      handleItemChange(
                        activeItemIndex,
                        "quantity",
                        e.target.value
                      )
                    }
                    onBlur={(e) => {
                      // Ensure quantity is never less than 0.01
                      const value = parseFloat(e.target.value);
                      if (!value || value <= 0) {
                        handleItemChange(activeItemIndex, "quantity", "0.01");
                      }
                    }}
                    className={`w-full bg-slate-700/40 border ${
                      errors[`quantity-${activeItemIndex}`]
                        ? "border-red-500"
                        : "border-slate-600"
                    } rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
                    min="0.01"
                    step="0.01"
                  />
                  {errors[`quantity-${activeItemIndex}`] && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[`quantity-${activeItemIndex}`]}
                    </p>
                  )}
                </div>

                {/* Unit Price */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    سعر الوحدة *
                  </label>
                  <input
                    type="number"
                    value={formData.items[activeItemIndex]?.unitPrice || ""}
                    onChange={(e) =>
                      handleItemChange(
                        activeItemIndex,
                        "unitPrice",
                        e.target.value
                      )
                    }
                    onBlur={(e) => {
                      // Ensure price is never less than 0.01
                      const value = parseFloat(e.target.value);
                      if (!value || value <= 0) {
                        handleItemChange(activeItemIndex, "unitPrice", "0.01");
                      }
                    }}
                    className={`w-full bg-slate-700/40 border ${
                      errors[`price-${activeItemIndex}`]
                        ? "border-red-500"
                        : "border-slate-600"
                    } rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
                    min="0.01"
                    step="0.01"
                  />
                  {errors[`price-${activeItemIndex}`] && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[`price-${activeItemIndex}`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Item Notes */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  ملاحظات العنصر
                </label>
                <input
                  type="text"
                  value={formData.items[activeItemIndex]?.notes || ""}
                  onChange={(e) =>
                    handleItemChange(activeItemIndex, "notes", e.target.value)
                  }
                  className="w-full bg-slate-700/40 border border-slate-600 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="أضف ملاحظات لهذا العنصر (اختياري)"
                />
              </div>

              {/* Item Total */}
              <div className="mt-3 p-2 bg-slate-700/30 rounded-lg flex items-center justify-between">
                <span className="text-sm text-slate-300">إجمالي العنصر:</span>
                <span className="font-bold text-primary">
                  {formatCurrency(
                    (parseFloat(
                      formData.items[activeItemIndex]?.unitPrice as string
                    ) || 0) *
                      (parseFloat(
                        formData.items[activeItemIndex]?.quantity as string
                      ) || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Order Notes and Payment Section */}
          <div className="p-4 border-t border-slate-700/30 bg-slate-900/20">
            {/* Notes Toggle */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="flex items-center justify-between w-full p-2 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <FileText className="h-4 w-4 text-primary" />
                  ملاحظات الطلب
                </span>
                <span className="text-xs text-slate-400">
                  {isEditingNotes
                    ? "إغلاق"
                    : formData.notes
                    ? "تعديل الملاحظات"
                    : "إضافة ملاحظات"}
                </span>
              </button>

              {isEditingNotes && (
                <div className="mt-2">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/40 border border-slate-600 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="أضف ملاحظات للطلب (اختياري)"
                  />
                </div>
              )}
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2 p-3 bg-slate-700/20 rounded-lg border border-slate-700/30 hover:border-primary/30 transition-colors cursor-pointer mb-4">
              <input
                type="checkbox"
                id="paidStatus"
                name="paidStatus"
                checked={formData.paidStatus}
                onChange={handleInputChange}
                className="rounded bg-slate-700/30 border-slate-600 text-primary focus:ring-primary/30"
              />
              <label
                htmlFor="paidStatus"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer w-full"
              >
                <CreditCard className="h-4 w-4 text-primary" />
                تم الدفع
              </label>
            </div>

            {/* Order Total */}
            <div className="bg-slate-700/40 p-4 rounded-lg mb-4 border border-slate-700/50 shadow-inner">
              <div className="flex justify-between items-center">
                <h4 className="text-slate-300 font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  إجمالي الطلب:
                </h4>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isPending || hasDataLoadingErrors}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    حفظ التعديلات
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Customer Modal */}
      <CombinedCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          refetchCustomers(); // Refresh customers list when modal closes
        }}
        mode="create"
        customerData={null}
        categories={customerCategories}
      />
    </div>
  );
};

export default EditOrderModal;
