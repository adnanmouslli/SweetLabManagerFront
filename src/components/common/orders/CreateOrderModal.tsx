import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  ChevronDown,
  UserPlus,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFetchCustomers } from "@/hooks/customers/useCustomers";
import { useItems } from "@/hooks/items/useItems";
import { useItemGroups } from "@/hooks/items/useItemGroups";
import {
  useCreateOrder,
  useOrderCategories,
  useUpdateOrder,
  useLastOrderForCustomer,
} from "@/hooks/useOrders";
import { OrderResponseDto, OrderStatus } from "@/types/orders.type";
import { AxiosError } from "axios";
import CombinedCustomerModal from "@/components/common/customers/CombinedCustomerModal";
import { useFetchCategories } from "@/hooks/customers/useCustomersCategories";
import { CustomerTypeEnum } from "@/types/customers.type";

// Type Definitions
interface ItemUnit {
  unit: string;
  price: number;
  factor: number;
}

interface Item {
  id: number;
  name: string;
  type: string;
  units: ItemUnit[];
  defaultUnit: string;
  description: string;
  groupId: number;
}

interface OrderItem {
  id?: number;
  itemId: string | number;
  quantity: number | string;
  unitPrice: number | string;
  unit: string;
  notes: string;
}

interface InvoiceData {
  discount: number;
  additionalAmount: number;
  trayCount: number;
  notes: string;
  isBreak?: boolean;
  initialPayment?: number;
}

interface OrderFormData {
  customerId: string | number;
  categoryId: string | number;
  notes: string;
  paidStatus: boolean;
  isForToday: boolean;
  items: OrderItem[];
  discount: number;
  additionalAmount: number;
  paymentType: "paid" | "unpaid" | "breakage";
  initialPayment: number;
  invoiceNotes: string;
}

interface OrderErrors {
  customerId?: string;
  categoryId?: string;
  initialPayment?: string;
  [key: string]: string | undefined;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  presetCustomerId?: number;
  order?: OrderResponseDto;
  mode?: "create" | "edit";
}

const INITIAL_FORM_DATA: OrderFormData = {
  customerId: "",
  categoryId: "",
  notes: "",
  paidStatus: false,
  isForToday: false,
  paymentType: "paid",
  items: [],
  discount: 0,
  additionalAmount: 0,
  initialPayment: 0,
  invoiceNotes: "",
};

// Component Definition
const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  presetCustomerId,
  order,
  mode = "create",
}) => {
  // Hooks for fetching data
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
    error: customerCategoriesError,
  } = useFetchCategories();

  const {
    data: items = [],
    isLoading: isLoadingItems,
    error: itemsError,
  } = useItems();

  const {
    data: itemGroups = [],
    isLoading: isLoadingItemGroups,
    error: itemGroupsError,
  } = useItemGroups();

  const {
    mutate: createOrder,
    isPending: isCreating,
    error: createOrderError,
  } = useCreateOrder();

  const {
    mutate: updateOrder,
    isPending: isUpdating,
    error: updateOrderError,
  } = useUpdateOrder();

  // State Management
  const [formData, setFormData] = useState<OrderFormData>({
    ...INITIAL_FORM_DATA,
  });
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number>(-1);
  const [itemSearchTerm, setItemSearchTerm] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedItemPrice, setSelectedItemPrice] = useState<number>(0);
  const [isCustomerModalOpen, setIsCustomerModalOpen] =
    useState<boolean>(false);
  const [selectedItemUnit, setSelectedItemUnit] = useState<string>("");
  const [selectedItemFactor, setSelectedItemFactor] = useState<number>(1);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] =
    useState<boolean>(false);
  const [customerMenuSearch, setCustomerMenuSearch] = useState<string>("");

  // Hook to fetch last order for the selected customer - moved after formData declaration
  const { data: lastOrder, isLoading: isLoadingLastOrder } =
    useLastOrderForCustomer(
      formData.customerId ? Number(formData.customerId) : null
    );

  // Initialize form data for editing
  useEffect(() => {
    if (isOpen && mode === "edit" && order) {
      setFormData({
        customerId: order.customer?.id || "",
        categoryId: order.categoryId || "",
        notes: order.notes || "",
        paidStatus: order.paidStatus,
        isForToday: order.scheduledFor
          ? new Date(order.scheduledFor).toDateString() ===
            new Date().toDateString()
          : false,
        paymentType: order.paidStatus
          ? "paid"
          : order.invoice?.isBreak
          ? "breakage"
          : "unpaid",
        items: order.items.map((item) => ({
          id: item.id,
          itemId: item.itemId,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          unit: item.unit,
          notes: item.notes || "",
        })),
        discount: order.invoice?.discount || 0,
        additionalAmount: order.invoice?.additionalAmount || 0,
        initialPayment: order.invoice?.initialPayment || 0,
        invoiceNotes: order.invoice?.notes || "",
      });
      setTotalAmount(order.totalAmount);
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, mode, order]);

  // Effects
  useEffect(() => {
    if (presetCustomerId && customers.length > 0 && mode !== "edit") {
      const customer = customers.find((c) => c.id === presetCustomerId);
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          customerId: customer.id,
        }));
      }
    }
  }, [presetCustomerId, customers, mode]);

  useEffect(() => {
    const errorsToLog = [
      { error: customersError, message: "Customers fetch error" },
      { error: categoriesError, message: "Categories fetch error" },
      { error: itemsError, message: "Items fetch error" },
      { error: itemGroupsError, message: "Item groups fetch error" },
      { error: createOrderError, message: "Create order error" },
      { error: updateOrderError, message: "Update order error" },
    ];

    errorsToLog.forEach(({ error, message }) => {
      if (error) console.error(`${message}:`, error);
    });
  }, [
    customersError,
    categoriesError,
    itemsError,
    itemGroupsError,
    createOrderError,
    updateOrderError,
  ]);

  useEffect(() => {
    try {
      let total = formData.items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity as string) || 0;
        const unitPrice = parseFloat(item.unitPrice as string) || 0;
        return sum + quantity * unitPrice;
      }, 0);

      total =
        total - (formData.discount || 0) + (formData.additionalAmount || 0);
      setTotalAmount(total);
    } catch (error) {
      console.error("Error calculating total amount:", error);
      setTotalAmount(0);
    }
  }, [formData.items, formData.discount, formData.additionalAmount]);

  // Form Handlers
  const resetForm = useCallback(() => {
    setFormData({ ...INITIAL_FORM_DATA });
    if (presetCustomerId) {
      setFormData((prev) => ({
        ...INITIAL_FORM_DATA,
        customerId: presetCustomerId,
      }));
    }
    setErrors({});
    setSelectedGroupId(0);
    setSelectedItem(0);
    setSelectedUnitIndex(-1);
    setItemSearchTerm("");
    setCustomerMenuSearch("");
    setIsCustomerDropdownOpen(false);
    setQuantity(1);
    setSelectedItemPrice(0);
    setSelectedItemUnit("");
    setSelectedItemFactor(1);
  }, [presetCustomerId]);

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
          [name]:
            type === "checkbox"
              ? checked
              : name === "discount" ||
                name === "additionalAmount" ||
                name === "initialPayment"
              ? parseFloat(value) || 0
              : value,
        }));

        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
      } catch (error) {
        console.error("Error handling input change:", error);
      }
    },
    [errors]
  );

  const handleItemInputChange = useCallback(
    (index: number, field: keyof OrderItem, value: string | number) => {
      setFormData((prev) => {
        const updatedItems = [...prev.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // If changing the unit, update the price accordingly
        if (field === "unit") {
          const itemId = updatedItems[index].itemId;
          const itemData = items.find(
            (i) => i.id.toString() === itemId.toString()
          );
          if (itemData) {
            const selectedUnit = itemData.units.find((u) => u.unit === value);
            if (selectedUnit) {
              updatedItems[index].unitPrice = selectedUnit.price.toString();
            }
          }
        }

        return { ...prev, items: updatedItems };
      });
    },
    [items]
  );

  const handleRemoveItem = useCallback((index: number) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems.splice(index, 1);
      return { ...prev, items: updatedItems };
    });
  }, []);

  const handlePaymentTypeChange = (type: "paid" | "unpaid" | "breakage") => {
    setFormData((prev) => ({
      ...prev,
      paymentType: type,
      paidStatus: type === "paid",
      initialPayment: type === "breakage" ? prev.initialPayment : 0,
    }));
  };

  const handleItemChange = useCallback(
    (index: number, field: keyof OrderItem, value: string | number) => {
      try {
        setFormData((prev) => {
          const updatedItems = [...prev.items];
          updatedItems[index] = { ...updatedItems[index], [field]: value };

          if (field === "itemId" && items && value) {
            const selectedItem = items.find(
              (item) => item.id === parseInt(value as string)
            );

            // التحقق من أن المادة من نوع الإنتاج
            if (selectedItem && selectedItem.type !== "production") {
              console.error("يمكن اختيار مواد الإنتاج فقط");
              return prev; // إرجاع الحالة السابقة دون تغيير
            }

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

        if (errors[`${field}-${index}`]) {
          setErrors((prev) => ({ ...prev, [`${field}-${index}`]: undefined }));
        }
      } catch (error) {
        console.error("Error handling item change:", error);
      }
    },
    [errors, items]
  );

  const addItem = useCallback(() => {
    try {
      if (selectedItem > 0) {
        const selectedItemObj = items?.find((item) => item.id === selectedItem);
        // التحقق من أن المادة من نوع الإنتاج
        if (!selectedItemObj || selectedItemObj.type !== "production") {
          console.error("يمكن إضافة مواد الإنتاج فقط");
          return;
        }

        if (quantity <= 0 || selectedUnitIndex < 0) return;

        const newItem: OrderItem = {
          itemId: selectedItem,
          quantity: quantity,
          unitPrice: selectedItemPrice,
          unit: selectedItemUnit,
          notes: "",
        };

        setFormData((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
        }));

        setSelectedItem(0);
        setQuantity(1);
        setSelectedUnitIndex(-1);
        setSelectedItemPrice(0);
        setSelectedItemUnit("");
        setSelectedItemFactor(1);

        return;
      }

      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          { itemId: "", quantity: "1", unitPrice: "0", unit: "", notes: "" },
        ],
      }));
    } catch (error) {
      console.error("Error adding item:", error);
    }
  }, [
    selectedItem,
    items,
    quantity,
    selectedItemPrice,
    selectedItemUnit,
    selectedUnitIndex,
  ]);

  const handleItemSelect = (itemId: number) => {
    setSelectedItem(itemId);
    const selectedProduct = items?.find((item) => item.id === itemId);

    if (selectedProduct) {
      if (selectedProduct.units && selectedProduct.units.length > 0) {
        const defaultUnitIndex = selectedProduct.units.findIndex(
          (u) => u.unit === selectedProduct.defaultUnit
        );

        const unitIndex = defaultUnitIndex >= 0 ? defaultUnitIndex : 0;
        const unitInfo = selectedProduct.units[unitIndex];

        setSelectedUnitIndex(unitIndex);
        setSelectedItemUnit(unitInfo.unit);
        setSelectedItemPrice(unitInfo.price);
        setSelectedItemFactor(unitInfo.factor);
      } else {
        setSelectedUnitIndex(-1);
        setSelectedItemUnit("");
        setSelectedItemPrice(0);
        setSelectedItemFactor(1);
      }
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitIndex = parseInt(e.target.value);
    setSelectedUnitIndex(unitIndex);

    const selectedProduct = items?.find((item) => item.id === selectedItem);
    if (
      selectedProduct &&
      selectedProduct.units &&
      unitIndex >= 0 &&
      unitIndex < selectedProduct.units.length
    ) {
      const unitInfo = selectedProduct.units[unitIndex];
      setSelectedItemUnit(unitInfo.unit);
      setSelectedItemPrice(unitInfo.price);
      setSelectedItemFactor(unitInfo.factor);
    }
  };

  const validateForm = useCallback((): boolean => {
    try {
      const newErrors: OrderErrors = {};
      let isValid = true;

      if (!formData.customerId) {
        newErrors.customerId = "الرجاء اختيار العميل";
        isValid = false;
      }

      if (!formData.categoryId) {
        newErrors.categoryId = "الرجاء اختيار التصنيف";
        isValid = false;
      }

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

      if (formData.paymentType === "breakage") {
        if (formData.initialPayment <= 0) {
          newErrors.initialPayment = "يجب إدخال دفعة أولى أكبر من صفر";
          isValid = false;
        } else if (formData.initialPayment >= totalAmount - formData.discount) {
          newErrors.initialPayment =
            "يجب أن تكون الدفعة الأولى أقل من المبلغ الإجمالي بعد الخصم";
          isValid = false;
        }
      }

      setErrors(newErrors);
      return isValid;
    } catch (error) {
      console.error("Error validating form:", error);
      return false;
    }
  }, [formData, totalAmount]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        if (!validateForm()) {
          const firstError = document.querySelector(".border-red-500");
          if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        const orderData = {
          customerId: parseInt(formData.customerId as string),
          categoryId: parseInt(formData.categoryId as string),
          totalAmount,
          paidStatus: formData.paymentType != "unpaid",
          status: order?.status as OrderStatus | undefined, // Ensure status is OrderStatus | undefined
          items: formData.items.map((item) => ({
            id: item.id,
            itemId: parseInt(item.itemId as string),
            quantity: parseFloat(item.quantity as string),
            unitPrice: parseFloat(item.unitPrice as string),
            unit: item.unit,
            notes: item.notes || "",
          })),
          notes: formData.notes || "",
          isForToday: formData.isForToday,
          invoiceData: {
            discount: formData.discount,
            additionalAmount: formData.additionalAmount,
            trayCount: 0,
            notes: formData.invoiceNotes || "",
            ...(formData.paymentType === "breakage" && {
              isBreak: true,
              initialPayment: formData.initialPayment,
            }),
          },
        };

        if (mode === "edit" && order?.id) {
          updateOrder(
            { orderId: order.id, data: orderData },
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
        } else {
          createOrder(orderData, {
            onSuccess: () => {
              console.log("Order created successfully");
              onClose();
              resetForm();
              if (onSuccess) onSuccess();
            },
            onError: (error) => {
              console.error("Error creating order:", error);
            },
          });
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
    [
      formData,
      totalAmount,
      validateForm,
      createOrder,
      updateOrder,
      onClose,
      resetForm,
      onSuccess,
      mode,
      order,
    ]
  );

  // Utility Functions
  const getCustomerName = useCallback((): string => {
    if (!customers || !formData.customerId) return "";
    const customer = customers.find(
      (c) => c.id === parseInt(formData.customerId as string)
    );
    return customer ? customer.name : "";
  }, [customers, formData.customerId]);

  const getItemName = useCallback(
    (itemId: string | number): string => {
      if (!items || !itemId) return "";
      const item = items.find((i) => i.id === parseInt(itemId as string));
      return item ? item.name : "";
    },
    [items]
  );

  const filteredGroups = useMemo(() => {
    if (!itemGroups || !items) return [];

    // فلترة التصنيفات التي تحتوي على مواد إنتاج فقط
    return itemGroups.filter((group) => {
      // البحث عن مواد إنتاج في هذا التصنيف
      const hasProductionItems = items.some(
        (item) => item.groupId === group.id && item.type === "production"
      );
      return hasProductionItems;
    });
  }, [itemGroups, items]);

  const filteredItems = useMemo(() => {
    let filtered = items || [];

    // فلترة مواد الإنتاج فقط
    filtered = filtered.filter((item) => item.type === "production");

    if (selectedGroupId > 0) {
      filtered = filtered.filter((item) => item.groupId === selectedGroupId);
    }

    if (itemSearchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [items, selectedGroupId, itemSearchTerm]);

  const dropdownCustomers = useMemo(() => {
  // فلترة الموردين فقط
  let filtered = customers.filter(
    (c) => c.customerType === CustomerTypeEnum.CUSTOMER
  );
  
  // ثم تطبيق البحث
  if (!customerMenuSearch.trim()) return filtered;
  
  const term = customerMenuSearch.toLowerCase();
  return filtered.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(customerMenuSearch))
  );
}, [customers, customerMenuSearch]);


  const hasDataLoadingErrors = Boolean(
    customersError || categoriesError || itemsError || itemGroupsError
  );

  // New function to handle repeating last order
  const handleRepeatLastOrder = useCallback(() => {
    if (!lastOrder) return;

    // Map the last order items to the current form structure
    const orderItems = lastOrder.items.map((item) => ({
      id: undefined, // Don't reuse the original item ID
      itemId: item.itemId,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      unit: item.unit,
      notes: item.notes || "",
    }));

    // Calculate the total amount based on the items
    const calculatedTotal =
      lastOrder.totalAmount ||
      orderItems.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.quantity as string) *
            parseFloat(item.unitPrice as string),
        0
      );

    // Use the exact payment status from the last order
    const paymentType = lastOrder.paidStatus
      ? "paid"
      : lastOrder.invoice?.isBreak
      ? "breakage"
      : "unpaid";

    // Set all form data at once to ensure consistency
    setFormData({
      customerId: lastOrder.customerId.toString(),
      categoryId: lastOrder.categoryId.toString(),
      notes: lastOrder.notes || "",
      paidStatus: lastOrder.paidStatus,
      isForToday: false, // Default to today for a new order
      items: orderItems,
      discount: lastOrder.invoice?.discount || 0,
      additionalAmount: lastOrder.invoice?.additionalAmount || 0,
      paymentType: paymentType,
      initialPayment: lastOrder.invoice?.initialPayment || 0,
      invoiceNotes: lastOrder.notes || "", // Use order notes as invoice notes
    });

    // Update the total amount display
    setTotalAmount(calculatedTotal);

    // If the order has items, set up the item selection UI for potential additional items
    if (orderItems.length > 0 && orderItems[0].itemId) {
      const firstItemId = Number(orderItems[0].itemId);
      const itemObject = items.find((item) => item.id === firstItemId);

      if (itemObject) {
        // Set the selected group and item
        setSelectedGroupId(itemObject.groupId || 0);
        setSelectedItem(itemObject.id || 0);

        // Set unit details based on the actual item from the last order
        const selectedUnit = itemObject.units.find(
          (u) => u.unit === orderItems[0].unit
        );
        if (selectedUnit) {
          const unitIndex = itemObject.units.findIndex(
            (u) => u.unit === selectedUnit.unit
          );
          setSelectedUnitIndex(unitIndex >= 0 ? unitIndex : 0);
          setSelectedItemUnit(selectedUnit.unit || "");
          setSelectedItemPrice(selectedUnit.price || 0);
          setSelectedItemFactor(selectedUnit.factor || 1);
        }

        // Set quantity for the new item form
        setQuantity(Number(orderItems[0].quantity) || 1);
      }
    }

    // Clear any previous errors
    setErrors({});
  }, [lastOrder, items]);

  // Render
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => {
          e.stopPropagation();
          if (isCustomerDropdownOpen) setIsCustomerDropdownOpen(false);
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold text-slate-100">
            {mode === "edit" ? "تعديل الطلب" : "إضافة طلب جديد"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <div className="space-y-2">
            <label className="block text-slate-100 font-medium">
              العميل<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 rtl:space-x-reverse items-center">
              <div className="flex-1 relative">
                <button
                  type="button"
                  onClick={() => setIsCustomerDropdownOpen((v) => !v)}
                  className={`w-full px-4 py-2 bg-slate-700/50 border ${
                    errors.customerId ? "border-red-500" : "border-slate-600"
                  } rounded-lg text-slate-200 text-right flex items-center justify-between`}
                >
                  <span className="truncate">
                    {getCustomerName() || "اختر العميل"}
                  </span>
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </button>

                {isCustomerDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg overflow-hidden">
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
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 pr-10 pl-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                  <div className="text-red-500 text-sm mt-1">
                    {errors.customerId}
                  </div>
                )}
              </div>

              {/* Add New Customer Button */}
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                title="إضافة عميل جديد"
              >
                <UserPlus className="h-4 w-4" />
                <span className="text-sm">إضافة عميل</span>
              </button>

              {/* Repeat Last Order Button */}
              {formData.customerId && (
                <button
                  type="button"
                  onClick={handleRepeatLastOrder}
                  disabled={isLoadingLastOrder || !lastOrder}
                  className={`px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2
                                        ${
                                          lastOrder
                                            ? "bg-green-500 text-white"
                                            : "bg-slate-700 text-slate-400"
                                        }`}
                  title={
                    lastOrder
                      ? "تكرار آخر طلب للعميل"
                      : "لا يوجد طلب سابق للعميل"
                  }
                >
                  {isLoadingLastOrder ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>جارٍ التحميل...</span>
                    </>
                  ) : !lastOrder ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>لا يوجد طلب سابق</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>تكرار آخر طلب</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-200">
              التصنيف<span className="text-red-400 mx-1">*</span>
            </label>
            <div className="relative">
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full bg-slate-700/50 border ${
                  errors.categoryId
                    ? "border-red-500/50"
                    : "border-slate-600/50"
                } rounded-lg pl-4 pr-10 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer hover:border-slate-500/50`}
                disabled={isLoadingCategories || !!categoriesError}
              >
                <option value="">اختر التصنيف</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            {errors.categoryId && (
              <div className="text-red-400 text-sm mt-1">
                {errors.categoryId}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isForToday"
                name="isForToday"
                checked={formData.isForToday}
                onChange={handleInputChange}
                className="rounded bg-slate-700/50 border-slate-600/50 text-blue-500 focus:ring-blue-500/30"
              />
              <label
                htmlFor="isForToday"
                className="text-slate-200 flex items-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                تسليم اليوم
              </label>
            </div>
            <p className="text-xs text-slate-400">
              إذا لم يتم التحديد، سيتم جدولة التسليم للغد
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-200">حالة الدفع</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handlePaymentTypeChange("paid")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  formData.paymentType === "paid"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <CreditCard className="h-5 w-5" />
                دفعة كاملة
              </button>
              <button
                type="button"
                onClick={() => handlePaymentTypeChange("unpaid")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  formData.paymentType === "unpaid"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Calendar className="h-5 w-5" />
                غير مدفوع
              </button>
              <button
                type="button"
                onClick={() => handlePaymentTypeChange("breakage")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  formData.paymentType === "breakage"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
                كسر
              </button>
            </div>
          </div>

          {formData.paymentType === "breakage" && (
            <div className="space-y-2">
              <label className="block text-slate-200">الدفعة الأولى</label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="number"
                  name="initialPayment"
                  value={formData.initialPayment}
                  onChange={handleInputChange}
                  className={`w-full pl-4 pr-12 py-2 bg-slate-700/50 border ${
                    errors.initialPayment
                      ? "border-red-500/50"
                      : "border-slate-600/50"
                  } rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  placeholder="أدخل قيمة الدفعة الأولى"
                />
              </div>
              {errors.initialPayment && (
                <div className="text-red-400 text-sm">
                  {errors.initialPayment}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-slate-200 mb-2">التصنيف</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredGroups?.map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setSelectedItem(0);
                  }}
                  className={`
                                        rounded-lg shadow-md p-4 text-center cursor-pointer transition-all duration-200
                                        border-2 transform hover:scale-105 hover:shadow-lg
                                        ${
                                          selectedGroupId === group.id
                                            ? "bg-blue-500/30 border-blue-500/70 text-blue-200"
                                            : "bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50"
                                        }
                                    `}
                >
                  <div className="font-medium text-lg">{group.name}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedGroupId > 0 &&
            filteredGroups.some((group) => group.id === selectedGroupId) && (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-slate-200 font-medium">
                      اختيار المنتج
                    </div>
                    {selectedItem > 0 && (
                      <button
                        onClick={() => setSelectedItem(0)}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                      >
                        إلغاء الاختيار
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemSelect(item.id)}
                        className={`
                                                rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200
                                                border-2 transform hover:scale-105 hover:shadow-lg
                                                ${
                                                  selectedItem === item.id
                                                    ? "bg-emerald-500/30 border-emerald-500/70 text-emerald-200"
                                                    : "bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50"
                                                }
                                            `}
                      >
                        <div className="font-medium text-center">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedItem > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-slate-200">الوحدة</label>
                        <select
                          value={selectedUnitIndex}
                          onChange={handleUnitChange}
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                        >
                          {items
                            ?.find((item) => item.id === selectedItem)
                            ?.units?.map((unit, index) => (
                              <option key={index} value={index}>
                                {unit.unit}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-slate-200">
                          معامل التحويل
                        </label>
                        <input
                          type="number"
                          value={selectedItemFactor}
                          disabled
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-slate-200">الكمية</label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-slate-200">السعر</label>
                        <input
                          type="number"
                          min="1"
                          value={selectedItemPrice}
                          onChange={(e) =>
                            setSelectedItemPrice(Number(e.target.value))
                          }
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addItem}
                      disabled={!selectedItem || selectedUnitIndex < 0}
                      className="flex items-center gap-2 px-4 py-2 mt-4 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5" />
                      إضافة منتج
                    </button>
                  </div>
                )}
              </>
            )}

          {formData.items.length > 0 && (
            <div className="bg-slate-700/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-right text-slate-200 p-3">المنتج</th>
                    <th className="text-right text-slate-200 p-3">الكمية</th>
                    <th className="text-right text-slate-200 p-3">الوحدة</th>
                    <th className="text-right text-slate-200 p-3">السعر</th>
                    <th className="text-right text-slate-200 p-3">
                      معامل التحويل
                    </th>
                    <th className="text-right text-slate-200 p-3">المجموع</th>
                    <th className="text-right text-slate-200 p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-t border-slate-600/30">
                      <td className="p-3 text-slate-300">
                        {getItemName(item.itemId)}
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemInputChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-700/30 border border-slate-500/30 rounded p-1 text-slate-200 text-center"
                          min="0.1"
                          step="0.1"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            handleItemInputChange(index, "unit", e.target.value)
                          }
                          className="w-full bg-slate-700/30 border border-slate-500/30 rounded p-1 text-slate-200 text-center"
                        >
                          {items
                            .find(
                              (i) => i.id.toString() === item.itemId.toString()
                            )
                            ?.units.map((unitOption, unitIndex) => (
                              <option key={unitIndex} value={unitOption.unit}>
                                {unitOption.unit}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemInputChange(
                              index,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-700/30 border border-slate-500/30 rounded p-1 text-slate-200 text-center"
                          min="0"
                          step="1"
                        />
                      </td>
                      <td className="p-3 text-slate-300">
                        {(() => {
                          const itemData = items.find(
                            (i) => i.id.toString() === item.itemId.toString()
                          );
                          const unitData = itemData?.units.find(
                            (u) => u.unit === item.unit
                          );
                          return unitData?.factor || 1;
                        })()}
                      </td>
                      <td className="p-3 text-slate-300">
                        {(parseFloat(item.quantity as string) || 0) *
                          (parseFloat(item.unitPrice as string) || 0)}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(formData.paymentType === "paid" ||
            formData.paymentType === "breakage") && (
            <div>
              <div className="space-y-2 mt-4">
                <label className="block text-slate-200">المبلغ الإضافي</label>
                <div className="relative">
                  <Calculator className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    name="additionalAmount"
                    value={formData.additionalAmount}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                    placeholder="قيمة المبلغ الإضافي"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  يمكنك إضافة مبلغ إضافي على الطلب مثل قيمة التوصيل أو رسوم
                  إضافية
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="block text-slate-200">الخصم</label>
                  <div className="relative">
                    <Calculator className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                      placeholder="قيمة الخصم"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-slate-200">
                    الإجمالي بعد الخصم والإضافات
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      readOnly
                      value={totalAmount}
                      className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="block text-slate-200">ملاحظات الفاتورة</label>
                <div className="relative">
                  <FileText className="absolute right-3 top-4 h-5 w-5 text-slate-400" />
                  <textarea
                    name="invoiceNotes"
                    value={formData.invoiceNotes}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="أدخل ملاحظات الفاتورة (مثال: تم الدفع نقداً)"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 mt-4">
            <label className="block text-slate-200">ملاحظات الطلب</label>
            <div className="relative">
              <FileText className="absolute right-3 top-4 h-5 w-5 text-slate-400" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="أدخل أي ملاحظات إضافية حول الطلب (مثال: توصيل إلى منطقة المزة)"
              />
            </div>
          </div>

          {hasDataLoadingErrors && (
            <div className="bg-red-500/10 text-red-400 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى لاحقًا.
            </div>
          )}

          {createOrderError && (
            <div className="bg-red-500/10 text-red-400 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>
                {createOrderError instanceof AxiosError
                  ? createOrderError.response?.data.message
                  : (createOrderError as any)?.message ||
                    "حدث خطأ أثناء إنشاء الطلبية"}
              </span>
            </div>
          )}
          {updateOrderError && (
            <div className="bg-red-500/10 text-red-400 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>
                {updateOrderError instanceof AxiosError
                  ? updateOrderError.response?.data.message
                  : (updateOrderError as any)?.message ||
                    "حدث خطأ أثناء تحديث الطلبية"}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating || hasDataLoadingErrors}
              className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري {mode === "edit" ? "التحديث" : "الإنشاء"}...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  {mode === "edit" ? "تحديث الطلب" : "إنشاء الطلب"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

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
    </motion.div>
  );
};

export default CreateOrderModal;
