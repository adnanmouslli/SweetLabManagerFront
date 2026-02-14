/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useMokkBar } from "@/components/providers/MokkBarContext";
import {
  useFetchInvoiceById,
  useUpdateInvoice,
} from "@/hooks/invoices/useInvoice";
import { useItems } from "@/hooks/items/useItems";
import { Invoice, Item, SingleFetchedInvoice } from "@/types/invoice.type";
import { sweetShopUnits } from "@/utils/constants";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useCustomersList } from "@/hooks/customers/useCustomers";
import { Calculator, DollarSign, Loader2, Plus, Trash2, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

interface EditInvoiceModalProps {
  invoice: Invoice | { id: number };
  onClose: () => void;
}

interface FormItem {
  id: number;
  quantity: number;
  unitPrice: number;
  unit: string;
  subTotal: number;
  itemId: number;
  item: Item;
}

interface FormValues {
  discount: number;
  trayCount: number | null;
  items: FormItem[];
  totalAmount: number;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  invoice,
  onClose,
}) => {
  const { setSnackbarConfig } = useMokkBar();
  const { data: items } = useItems();
  const { data: customers } = useCustomersList();
  const [invoiceType, setInvoiceType] = useState<"income" | "expense">(
    "income"
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [invoiceCategory, setInvoiceCategory] = useState<string>("");
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);

  // State for adding new items
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [selectedItemPrice, setSelectedItemPrice] = useState<number>(0);
  const [selectedItemUnit, setSelectedItemUnit] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Set up react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      discount: 0,
      trayCount: null,
      items: [],
      totalAmount: 0,
    },
  });

  // Setup field array for dynamic items
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch values for calculations
  const watchedItems = watch("items");

  // Calculate total amount when items change
  useEffect(() => {
    if (watchedItems && watchedItems.length > 0) {
      const total = watchedItems.reduce((sum, item) => sum + item.subTotal, 0);
      setValue("totalAmount", total);
    } else {
      setValue("totalAmount", 0);
    }
  }, [watchedItems, setValue]);

  // Fetch invoice details if only ID is provided
  const { data: fetchedInvoice, isLoading: isLoadingInvoice } =
    useFetchInvoiceById(invoice.id, {
      enabled: true,
    });

  // Update mutation
  const updateInvoice = useUpdateInvoice({
    onSuccess: () => {
      setSnackbarConfig({
        open: true,
        severity: "success",
        message: "تم تحديث الفاتورة بنجاح",
      });
      onClose();
    },
    onError: (error: AxiosError) => {
      console.error("Update error:", error);
      setSnackbarConfig({
        open: true,
        severity: "error",
        message:
          // @ts-ignore
          error?.response?.data?.message || "حدث خطأ أثناء تحديث الفاتورة",
      });
    },
  });

  // Initialize form with invoice data
  const initializeFormWithInvoice = (data: SingleFetchedInvoice) => {
    console.log("Initializing form with data:", data);

    // Store the customerId but don't make it editable
    setCustomerId(data.customerId);

    // Ensure discount is a number
    const discountValue =
      data.discount !== undefined && data.discount !== null
        ? Number(data.discount)
        : 0;

    console.log("Setting discount as number:", discountValue);
    setValue("discount", discountValue);

    // Store invoice category for conditional logic
    setInvoiceCategory(data.invoiceCategory || "");

    // Only initialize items and trayCount if invoiceCategory is "products"
    if (data.invoiceCategory === "products") {
      setValue(
        "trayCount",
        data.trayCount !== undefined ? data.trayCount : null
      );

      // Initialize items
      if (data.items && data.items.length > 0) {
        console.log("Setting items:", data.items);

        // Clear existing items first
        setValue("items", []);

        // Add each item from the invoice
        data.items.forEach((item) => {
          const itemDetails = items?.find((i) => i.id === item.itemId);

          append({
            id: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit:
              itemDetails?.defaultUnit ||
              (item.item?.unit ? item.item.unit : ""),
            subTotal: item.quantity * item.unitPrice,
            itemId: item.itemId,
            item: {
              id: itemDetails ? itemDetails.id : item.itemId,
              name: itemDetails ? itemDetails.name : item.item.name,
              price: itemDetails ? itemDetails.cost : item.unitPrice,
              unit: itemDetails
                ? itemDetails.defaultUnit
                : item.item?.unit || "",
              description: itemDetails ? itemDetails.description || "" : "",
              groupId: itemDetails ? itemDetails.groupId || 0 : 0,
              type: itemDetails ? itemDetails.type : "production",
            },
          });
        });

        // Calculate initial total
        const total = data.items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        );
        setValue("totalAmount", total);
      }
    } else {
      // If not products category, set total amount directly
      setValue("totalAmount", data.totalAmount || 0);
    }

    setInvoiceType(data.invoiceType);
    setInvoiceNumber(data.invoiceNumber);
  };

  // Handle initialization when component mounts
  useEffect(() => {
    // If we have a complete invoice object, use it
    if ("items" in invoice && invoice.items) {
      console.log("Using provided complete invoice for initialization");
      initializeFormWithInvoice(invoice as SingleFetchedInvoice);
    }
  }, []);

  // Handle initialization when fetched data arrives
  useEffect(() => {
    // If we have fetched data, use it
    if (fetchedInvoice) {
      console.log("Using fetched invoice for initialization");
      initializeFormWithInvoice(fetchedInvoice);
    }
  }, [fetchedInvoice, items]);

  // Handle item selection
  const handleItemSelect = (itemId: number) => {
    setSelectedItem(itemId);
    const selectedProduct = items?.find((item) => item.id === itemId);
    if (selectedProduct) {
      setSelectedItemPrice(selectedProduct.cost || 0);
      setSelectedItemUnit(selectedProduct.defaultUnit || "");
    }
  };

  // Add new item to the form
  const addItem = () => {
    const selectedProduct = items?.find((item) => item.id === selectedItem);
    if (!selectedProduct || quantity <= 0) return;

    append({
      id: Date.now(), // Temporary ID for UI purposes
      quantity,
      unitPrice: selectedItemPrice,
      unit: selectedItemUnit,
      subTotal: quantity * selectedItemPrice,
      itemId: selectedProduct.id,
      item: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        description: selectedProduct.description || "",
        type: selectedProduct.type,
        price: selectedItemPrice,
        unit: selectedItemUnit,
        groupId: selectedProduct.groupId || 0,
      },
    });

    // Reset selection fields
    setSelectedItem(0);
    setSelectedItemPrice(0);
    setSelectedItemUnit("");
    setQuantity(1);
  };

  // Check if we need to validate trays
  const isTrayValidationRequired =
    invoiceType === "income" && invoiceCategory === "products";

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Check trayCount only if invoice is income products
      if (
        isTrayValidationRequired &&
        (data.trayCount === null || data.trayCount < 0)
      ) {
        setSnackbarConfig({
          open: true,
          severity: "error",
          message: "يجب إدخال عدد الفوارغ وأن لا يكون أقل من صفر",
        });
        return;
      }

      // Create base update data
      const baseUpdateData = {
        id: invoice.id,
        customerId: customerId, // Use the stored customerId that's not editable
        // Explicitly convert to number
        discount: Number(data.discount),
      };

      // Create update data with only the required fields based on invoice category
      let updateData;

      if (invoiceCategory === "products") {
        updateData = {
          ...baseUpdateData,
          trayCount: data.trayCount || 0,
          // Map items to include only the required fields in the exact format specified
          items: data.items.map((item) => ({
            itemId: item.itemId,
            unitPrice: Number(item.unitPrice),
            quantity: Number(item.quantity),
            unit: item.unit || 'قطعة',
            subTotal: Number(item.quantity * item.unitPrice),
          })),
        };
      } else {
        // For non-products invoices, don't include items and trayCount
        updateData = {
          ...baseUpdateData,
          totalAmount: Number(data.totalAmount),
        };
      }

      console.log("Submitting update data:", updateData);
      await updateInvoice.mutateAsync(updateData);
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  // Show loading state while fetching invoice
  if (isLoadingInvoice && !("items" in invoice)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-800 p-6 rounded-lg shadow-xl"
        >
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-slate-200">
              جاري تحميل بيانات الفاتورة...
            </span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Determine if we should show the products section
  const showProductsSection = invoiceCategory === "products";

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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold text-slate-100">
            تعديل الفاتورة #{invoiceNumber}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="block text-slate-200">العميل</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={customerId || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomerId(value ? Number(value) : undefined);
                }}
                className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
              >
                <option value="">بدون عميل</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.phone ? `- ${customer.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Section - Only show if invoice category is products */}
          {showProductsSection && (
            <>
              {/* Item Selection */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Product Selection */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-slate-200">إضافة منتج</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => handleItemSelect(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                  >
                    <option value={0}>اختر المنتج</option>
                    {items?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItem > 0 && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-slate-200">السعر</label>
                      <input
                        type="number"
                        value={selectedItemPrice}
                        onChange={(e) =>
                          setSelectedItemPrice(Number(e.target.value))
                        }
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                      />
                    </div>
                    {/* Unit Selection */}
                    <div className="space-y-2">
                      <label className="block text-slate-200">الوحدة</label>
                      <select
                        value={selectedItemUnit}
                        onChange={(e) => setSelectedItemUnit(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                      >
                        <option value="" className="bg-slate-800">
                          اختر الوحدة
                        </option>
                        {sweetShopUnits.map((unit) => (
                          <option
                            key={unit}
                            value={unit}
                            className="bg-slate-800 py-2"
                          >
                            {unit}
                          </option>
                        ))}
                      </select>
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
                  </>
                )}
              </div>

              {/* Add Item Button */}
              <button
                type="button"
                onClick={addItem}
                disabled={!selectedItem}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                إضافة منتج
              </button>

              {/* Items Table */}
              {fields.length > 0 && (
                <div className="bg-slate-700/30 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="text-right text-slate-200 p-3">
                          المنتج
                        </th>
                        <th className="text-right text-slate-200 p-3">
                          الكمية
                        </th>
                        <th className="text-right text-slate-200 p-3">السعر</th>
                        <th className="text-right text-slate-200 p-3">
                          المجموع
                        </th>
                        <th className="text-right text-slate-200 p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-600/30"
                        >
                          <td className="p-3 text-slate-300">
                            <Controller
                              control={control}
                              name={`items.${index}.item.name`}
                              render={({ field }) => <span>{field.value}</span>}
                            />
                          </td>
                          <td className="p-3 text-slate-300">
                            <Controller
                              control={control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <span>
                                  {field.value} {watchedItems[index]?.unit}
                                </span>
                              )}
                            />
                          </td>
                          <td className="p-3 text-slate-300">
                            <Controller
                              control={control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => <span>{field.value}</span>}
                            />
                          </td>
                          <td className="p-3 text-slate-300">
                            <Controller
                              control={control}
                              name={`items.${index}.subTotal`}
                              render={({ field }) => <span>{field.value}</span>}
                            />
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-600/30 bg-slate-700/30">
                        <td
                          colSpan={3}
                          className="p-3 text-slate-200 font-medium"
                        >
                          المجموع الكلي
                        </td>
                        <td
                          colSpan={2}
                          className="p-3 text-emerald-400 font-medium"
                        >
                          <Controller
                            control={control}
                            name="totalAmount"
                            render={({ field }) => <span>{field.value}</span>}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Trays Count - Only if invoiceType is income */}
              {isTrayValidationRequired && (
                <div className="space-y-2">
                  <label className="block text-slate-200">عدد الفوارغ</label>
                  <div className="relative">
                    <Controller
                      name="trayCount"
                      control={control}
                      rules={{ required: isTrayValidationRequired }}
                      render={({ field }) => (
                        <input
                          type="number"
                          min="0"
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : Number(e.target.value);
                            field.onChange(value);
                          }}
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                        />
                      )}
                    />
                    {errors.trayCount && (
                      <div className="text-red-400 text-sm mt-1">
                        يجب إدخال عدد الفوارغ
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Total Amount - Only for non-products invoices */}
{!showProductsSection && (
  <div className="space-y-2">
    <label className="block text-slate-200">المبلغ الإجمالي</label>
    <div className="relative">
      <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      <Controller
        name="totalAmount"
        control={control}
        rules={{
          required: !showProductsSection,
          min: 0,
        }}
        render={({ field }) => (
          <input
            type="number"
            min="0"
            step="any"
            value={field.value}
            onChange={(e) => {
              const numValue = e.target.value === "" ? 0 : Number(e.target.value);
              field.onChange(numValue);
            }}
            className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
            placeholder="المبلغ الإجمالي"
          />
        )}
      />
      {errors.totalAmount && (
        <div className="text-red-400 text-sm mt-1">
          يجب إدخال المبلغ الإجمالي
        </div>
      )}
    </div>
  </div>
)}

          {/* Discount */}
          <div className="space-y-2">
            <label className="block text-slate-200">الخصم</label>
            <div className="relative">
              <Calculator className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Controller
                name="discount"
                control={control}
                rules={{
                  min: 0,
                }}
                render={({ field }) => (
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={field.value}
                    onChange={(e) => {
                      // Ensure numeric value
                      const numValue =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      field.onChange(numValue);
                    }}
                    className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                    placeholder="قيمة الخصم"
                  />
                )}
              />
              {errors.discount && (
                <div className="text-red-400 text-sm mt-1">
                  يجب أن يكون الخصم أكبر من أو يساوي صفر
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-200">الإجمالي بعد الخصم</label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                readOnly
                value={watch("totalAmount") - watch("discount")}
                className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
              />
            </div>
          </div>
          
          
          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={
              updateInvoice.isPending ||
              (showProductsSection && watch("totalAmount") <= 0) ||
              (!showProductsSection && watch("totalAmount") <= 0) || // Add this condition
              (isTrayValidationRequired &&
                (watch("trayCount") === null || watch("trayCount")! < 0))
            }
              className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateInvoice.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>جاري التحديث...</span>
                </div>
              ) : (
                <span>تحديث الفاتورة</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700/50 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditInvoiceModal;
