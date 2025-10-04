import { useActiveAdvances } from "@/hooks/advances/useAdvances";
import {
  useCreateCustomer,
  useCustomersList,
} from "@/hooks/customers/useCustomers";
import { useFetchCategories } from "@/hooks/customers/useCustomersCategories";
import { Advance } from "@/types/advances.type";
import { CustomerTypeEnum, ListCustomerType } from "@/types/customers.type";
import { InvoiceCategory } from "@/types/invoice.type";
import { Loader2, Plus, Tag, User, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Select, { GroupBase, StylesConfig } from "react-select";
import { useMokkBar } from "../providers/MokkBarContext";

// Define interfaces for select options
interface CustomerOption {
  value: number;
  label: string;
  customer: ListCustomerType;
}

interface AdvanceOption {
  value: number;
  label: string;
  advance: Advance;
}

interface FormData {
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  advanceId?: number;
}

// Interface for the customer form
interface CustomerFormData {
  name: string;
  phone: string;
  notes: string;
  categoryId: number;
  customerType: CustomerTypeEnum;
}

interface CustomerSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  type: InvoiceCategory;
  mode: "income" | "expense";
  customerId?: number;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  formData,
  setFormData,
  type,
  mode,
  customerId,
}) => {
  const { setSnackbarConfig } = useMokkBar();
  const { data: customers } = useCustomersList();
  const { data: activeAdvances } = useActiveAdvances();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showFormTypeDialog, setShowFormTypeDialog] = useState(false);
  const [selectedFormType, setSelectedFormType] =
    useState<CustomerTypeEnum | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<ListCustomerType | null>(null);
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);

  const isAdvanceRepay = type === InvoiceCategory.ADVANCE && mode === "expense";
  const isCustomerRequired = type === InvoiceCategory.ADVANCE;
  const isCustomerPreset = isAdvanceRepay && customerId;
  const shouldShowSupplierFormDirectly =
    mode === "expense" && type === InvoiceCategory.PRODUCTS;

  // Setup React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CustomerFormData>({
    defaultValues: {
      name: "",
      phone: "",
      notes: "",
      categoryId: 0,
      customerType:
        mode === "income"
          ? CustomerTypeEnum.CUSTOMER
          : CustomerTypeEnum.SUPPLIER,
    },
  });

  // Find and set the selected customer based on customerId
  useEffect(() => {
    if (customerId && customers) {
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
        setFormData((prev: any) => ({
          ...prev,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
        }));
      }
    }
  }, [customerId, customers, setFormData]);

  // Customer creation mutation
  const createCustomer = useCreateCustomer();

  // Inside the component, add categories data
  const { data: categories } = useFetchCategories();

  // Format customers for react-select
  const customerOptions: CustomerOption[] = useMemo(() => {
    // Filter customers based on mode (income/expense) and other requirements
    let filteredCustomers = customers || [];

    // Filter by customer type based on invoice mode and type
    if (mode === "income" && type === InvoiceCategory.PRODUCTS) {
      // For income with PRODUCTS (بيع منتجات), only show customers (not suppliers)
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.customerType === CustomerTypeEnum.CUSTOMER
      );
    } else if (mode === "expense" && type === InvoiceCategory.PRODUCTS) {
      // For expense invoices with PRODUCTS (شراء منتجات), only show suppliers
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.customerType === CustomerTypeEnum.SUPPLIER
      );
    }
    // For other cases, show all customers (existing behavior)

    // Additional filtering for debt or advance repayment requirements
    if (type === InvoiceCategory.DEBT && mode === "income" && customers) {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.totalDebt > 0
      );
    }

    return filteredCustomers.map((customer) => {
      let balanceInfo = "";

      if (customer.customerType === CustomerTypeEnum.SUPPLIER) {
        // For suppliers, show supplier balance
        balanceInfo =
          customer.supplierBalance > 0
            ? ` - رصيد: ${customer.supplierBalance} ل.س`
            : " - رصيد: 0 ل.س";
      } else {
        // For customers, show debt
        balanceInfo =
          customer.totalDebt > 0
            ? ` - دين: ${customer.totalDebt} ل.س`
            : " - دين: 0 ل.س";
      }

      return {
        value: customer.id,
        label: `${customer.name}${
          customer.phone ? ` - ${customer.phone}` : ""
        }${balanceInfo}`,
        customer,
      };
    });
  }, [customers, type, mode]);

  // Format advances for react-select
  const advanceOptions: AdvanceOption[] = useMemo(() => {
    return (activeAdvances || []).map((advance) => ({
      value: advance.id,
      label: `${advance.customer.name} - ${advance.remainingAmount} ليرة`,
      advance,
    }));
  }, [activeAdvances]);

  // Handle selection change
  const handleCustomerSelectChange = (
    selectedOption: CustomerOption | null
  ) => {
    if (selectedOption) {
      const customer = selectedOption.customer;
      setSelectedCustomer(customer);
      setFormData((prev: any) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
      }));
    } else {
      setSelectedCustomer(null);
      setFormData((prev: any) => ({
        ...prev,
        customerId: undefined,
        customerName: "",
        customerPhone: "",
      }));
    }
  };

  // Handle advance selection change
  const handleAdvanceSelectChange = (selectedOption: AdvanceOption | null) => {
    if (selectedOption) {
      const advance = selectedOption.advance;
      setSelectedAdvance(advance);

      // Convert advance customer to ListCustomerType for consistency
      const listCustomer: ListCustomerType = {
        id: advance.customer.id,
        name: advance.customer.name,
        phone: advance.customer.phone,
        customerType: CustomerTypeEnum.CUSTOMER, // Advances are typically for customers
        supplierBalance: 0,
        category: null,
        totalDebt: 0,
        totalBreakAmount: 0,
        totalOwed: 0,
      };

      setSelectedCustomer(listCustomer);
      setFormData((prev: any) => ({
        ...prev,
        advanceId: advance.id,
        customerId: advance.customerId,
        customerName: advance.customer.name,
        customerPhone: advance.customer.phone,
        totalAmount: advance.remainingAmount,
      }));
    } else {
      setSelectedAdvance(null);
      setSelectedCustomer(null);
      setFormData((prev: any) => ({
        ...prev,
        advanceId: undefined,
        customerId: undefined,
        customerName: "",
        customerPhone: "",
        totalAmount: 0,
      }));
    }
  };

  // Handle add customer button click
  const handleAddCustomerClick = () => {
    if (shouldShowSupplierFormDirectly) {
      // Show supplier form directly
      setSelectedFormType(CustomerTypeEnum.SUPPLIER);
      setValue("customerType", CustomerTypeEnum.SUPPLIER);
      setShowAddCustomer(true);
    } else {
      // Show form type selection dialog
      setShowFormTypeDialog(true);
    }
  };

  // Handle form type selection
  const handleFormTypeSelection = (formType: CustomerTypeEnum) => {
    setSelectedFormType(formType);
    setValue("customerType", formType);
    setShowFormTypeDialog(false);
    setShowAddCustomer(true);
  };

  // Handle cancel add customer
  const handleCancelAddCustomer = () => {
    setShowAddCustomer(false);
    setShowFormTypeDialog(false);
    setSelectedFormType(null);
    reset();
  };

  // Form submission handler for adding a new customer
  const onSubmitNewCustomer: SubmitHandler<CustomerFormData> = async (
    data: CustomerFormData
  ) => {
    try {
      const response = await createCustomer.mutateAsync({
        name: data.name,
        phone: data.phone,
        notes: data.notes || null,
        categoryId: data.categoryId || null,
        customerType: data.customerType,
      });

      // Convert CustomerInfo to ListCustomerType for consistency
      const listCustomer: ListCustomerType = {
        id: response.id,
        name: response.name,
        phone: response.phone,
        customerType: response.customerType,
        supplierBalance: 0, // New customer starts with 0 balance
        category: response.category,
        totalDebt: 0, // New customer starts with 0 debt
        totalBreakAmount: 0, // New customer starts with 0 breakage
        totalOwed: 0, // New customer starts with 0 owed amount
      };

      // Set the newly created customer as selected
      setSelectedCustomer(listCustomer);
      setFormData((prev: any) => ({
        ...prev,
        customerId: response.id,
        customerName: response.name,
        customerPhone: response.phone,
      }));

      // Reset the form and hide it
      reset();
      setShowAddCustomer(false);
      setSelectedFormType(null);

      setSnackbarConfig({
        open: true,
        severity: "success",
        message:
          data.customerType === CustomerTypeEnum.CUSTOMER
            ? "تم إضافة العميل بنجاح"
            : "تم إضافة المورد بنجاح",
      });
    } catch (error) {
      setSnackbarConfig({
        open: true,
        severity: "error",
        message:
          selectedFormType === CustomerTypeEnum.CUSTOMER
            ? "حدث خطأ أثناء إضافة العميل"
            : "حدث خطأ أثناء إضافة المورد",
      });
    }
  };

  // Determine current selection for controlled component
  const currentCustomerValue = useMemo(() => {
    if (formData.customerId && customers) {
      const customer = customers.find((c) => c.id === formData.customerId);
      if (customer) {
        return {
          value: customer.id,
          label: `${customer.name}${
            customer.phone ? ` - ${customer.phone}` : ""
          }`,
          customer,
        };
      }
    }
    return null;
  }, [formData.customerId, customers]);

  // Determine current advance selection
  const currentAdvanceValue = useMemo(() => {
    if (formData.advanceId && activeAdvances) {
      const advance = activeAdvances.find((a) => a.id === formData.advanceId);
      if (advance) {
        return {
          value: advance.id,
          label: `${advance.customer.name} - ${advance.remainingAmount} ليرة`,
          advance,
        };
      }
    }
    return null;
  }, [formData.advanceId, activeAdvances]);

  // Custom styles for react-select - specific to customer options
  const customerSelectStyles: StylesConfig<
    CustomerOption,
    false,
    GroupBase<CustomerOption>
  > = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "rgba(51, 65, 85, 0.5)",
      borderColor:
        isCustomerRequired && !formData.customerId
          ? "rgba(239, 68, 68, 0.5)"
          : "rgba(71, 85, 105, 0.5)",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "rgba(71, 85, 105, 0.8)",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgb(30, 41, 59)",
      border: "1px solid rgba(51, 65, 85, 0.5)",
      borderRadius: "0.5rem",
      zIndex: 9999,
    }),
    option: (provided, { isSelected, isFocused }) => ({
      ...provided,
      backgroundColor: isSelected
        ? "rgba(59, 130, 246, 0.5)"
        : isFocused
        ? "rgba(51, 65, 85, 0.7)"
        : "transparent",
      color: "rgb(226, 232, 240)",
      textAlign: "right",
      "&:hover": {
        backgroundColor: isSelected
          ? "rgba(59, 130, 246, 0.5)"
          : "rgba(51, 65, 85, 0.7)",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "rgb(226, 232, 240)",
      textAlign: "right",
    }),
    input: (provided) => ({
      ...provided,
      color: "rgb(226, 232, 240)",
      textAlign: "right",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgb(148, 163, 184)",
      textAlign: "right",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "rgb(148, 163, 184)",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "rgb(148, 163, 184)",
    }),
  };

  // Custom styles for react-select - specific to advance options
  const advanceSelectStyles: StylesConfig<
    AdvanceOption,
    false,
    GroupBase<AdvanceOption>
  > = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "rgba(51, 65, 85, 0.5)",
      borderColor:
        isCustomerRequired && !formData.customerId
          ? "rgba(239, 68, 68, 0.5)"
          : "rgba(71, 85, 105, 0.5)",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "rgba(71, 85, 105, 0.8)",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgb(30, 41, 59)",
      border: "1px solid rgba(51, 65, 85, 0.5)",
      borderRadius: "0.5rem",
      zIndex: 9999,
    }),
    option: (provided, { isSelected, isFocused }) => ({
      ...provided,
      backgroundColor: isSelected
        ? "rgba(59, 130, 246, 0.5)"
        : isFocused
        ? "rgba(51, 65, 85, 0.7)"
        : "transparent",
      color: "rgb(226, 232, 240)",
      textAlign: "right",
      "&:hover": {
        backgroundColor: isSelected
          ? "rgba(59, 130, 246, 0.5)"
          : "rgba(51, 65, 85, 0.7)",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "rgb(226, 232, 240)",
      textAlign: "right",
    }),
    input: (provided) => ({
      ...provided,
      color: "rgb(226, 232, 240)",
      textAlign: "right",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgb(148, 163, 184)",
      textAlign: "right",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "rgb(148, 163, 184)",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "rgb(148, 163, 184)",
    }),
  };

  // Get the label for customer/vendor type based on type and mode
  const getCustomerLabel = () => {
    if (isAdvanceRepay) {
      return "السلفة";
    }

    if (type === InvoiceCategory.EMPLOYEE) {
      return "الموظف";
    }

    return mode === "income" ? "العميل" : "المورد";
  };

  // Determine if customer selection is optional
  const isCustomerOptional =
    type === InvoiceCategory.DIRECT || type === InvoiceCategory.DEBT;

  return (
    <div className="space-y-4">
      <label className="block text-slate-200">
        {getCustomerLabel()}
        {isCustomerRequired && <span className="text-red-400 mx-1">*</span>}
        {isCustomerOptional && " ( اختياري ) "}
      </label>

      {isCustomerPreset ? (
        // Display selected customer info when customerId is preset
        <div className="bg-slate-800/50 text-slate-200 rounded-lg border border-slate-700/50 py-3 px-4">
          {selectedCustomer?.name ||
            ((mode as string) === "income" ? "العميل المحدد" : "المورد المحدد")}
        </div>
      ) : (
        // React-select for customer selection
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              {isAdvanceRepay ? (
                <Select<AdvanceOption, false, GroupBase<AdvanceOption>>
                  value={currentAdvanceValue}
                  onChange={handleAdvanceSelectChange}
                  options={advanceOptions}
                  styles={advanceSelectStyles}
                  isRtl={true}
                  placeholder="اختر السلفة"
                  noOptionsMessage={() => "لا توجد سلفات متاحة"}
                  isClearable
                  menuPlacement="auto"
                  classNamePrefix="react-select"
                />
              ) : (
                <Select<CustomerOption, false, GroupBase<CustomerOption>>
                  value={currentCustomerValue}
                  onChange={handleCustomerSelectChange}
                  options={customerOptions}
                  styles={customerSelectStyles}
                  isRtl={true}
                  placeholder={
                    mode === "income" ? "اختر العميل" : "اختر المورد"
                  }
                  noOptionsMessage={() =>
                    mode === "income"
                      ? "لا يوجد عملاء متاحون"
                      : "لا يوجد موردون متاحون"
                  }
                  isClearable
                  menuPlacement="auto"
                  classNamePrefix="react-select"
                />
              )}
            </div>
            <button
              onClick={handleAddCustomerClick}
              className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              type="button"
            >
              <Plus className="h-5 w-5" />
              {shouldShowSupplierFormDirectly
                ? "إضافة مورد"
                : showAddCustomer || showFormTypeDialog
                ? "إلغاء"
                : "إضافة"}
            </button>
          </div>

          {/* Form Type Selection Dialog */}
          {showFormTypeDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-slate-200">
                    اختر نوع النموذج
                  </h3>
                  <button
                    onClick={() => setShowFormTypeDialog(false)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() =>
                      handleFormTypeSelection(CustomerTypeEnum.CUSTOMER)
                    }
                    className="w-full p-4 text-right bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20"
                  >
                    <div className="font-medium">إضافة عميل</div>
                    <div className="text-sm opacity-75">لإضافة عميل جديد</div>
                  </button>

                  <button
                    onClick={() =>
                      handleFormTypeSelection(CustomerTypeEnum.SUPPLIER)
                    }
                    className="w-full p-4 text-right bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors border border-green-500/20"
                  >
                    <div className="font-medium">إضافة مورد</div>
                    <div className="text-sm opacity-75">لإضافة مورد جديد</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add New Customer Form */}
          {showAddCustomer && selectedFormType && (
            <form
              onSubmit={handleSubmit(onSubmitNewCustomer)}
              className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg space-y-3"
              noValidate
            >
              <div className="flex items-center justify-between">
                <h3 className="text-blue-400 text-lg font-medium">
                  {selectedFormType === CustomerTypeEnum.CUSTOMER
                    ? "إضافة عميل جديد"
                    : "إضافة مورد جديد"}
                </h3>
                <button
                  type="button"
                  onClick={handleCancelAddCustomer}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Hidden customerType field */}
              <input
                type="hidden"
                name="customerType"
                value={selectedFormType}
              />

              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-slate-200">
                  الاسم
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Controller
                    name="name"
                    control={control}
                    rules={{
                      required: `اسم ${
                        selectedFormType === CustomerTypeEnum.CUSTOMER
                          ? "العميل"
                          : "المورد"
                      } مطلوب`,
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="name"
                        type="text"
                        placeholder={`أدخل اسم ${
                          selectedFormType === CustomerTypeEnum.CUSTOMER
                            ? "العميل"
                            : "المورد"
                        }`}
                        className={`w-full pl-4 pr-12 py-2 bg-slate-700/50 border ${
                          errors.name
                            ? "border-red-500/50"
                            : "border-slate-600/50"
                        } rounded-lg text-slate-200`}
                      />
                    )}
                  />
                </div>

                {errors.name && (
                  <p className="text-red-400 text-sm">
                    {errors.name.message as string}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-slate-200">
                  رقم الهاتف
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="phone"
                      type="text"
                      placeholder="أدخل رقم الهاتف"
                      className={`w-full px-4 py-2 bg-slate-700/50 border ${
                        errors.phone
                          ? "border-red-500/50"
                          : "border-slate-600/50"
                      } rounded-lg text-slate-200`}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div className="space-y-2">
                <label htmlFor="categoryId" className="block text-slate-200">
                  التصنيف
                </label>
                {categories && categories.length > 0 ? (
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="categoryId"
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      >
                        <option value="">بدون تصنيف</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                ) : (
                  <div className="text-sm text-slate-400">
                    لا توجد تصنيفات متاحة. يمكنك{" "}
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new CustomEvent("add-category"))
                      }
                      className="text-purple-400 hover:underline"
                    >
                      إضافة تصنيف جديد
                    </button>{" "}
                    أولاً.
                  </div>
                )}

                {watch("categoryId") && categories && (
                  <div className="mt-2 flex">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Tag className="h-3 w-3" />
                      {
                        categories.find(
                          (c) => c.id === Number(watch("categoryId"))
                        )?.name
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-slate-200">
                  ملاحظات (اختياري)
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="notes"
                      placeholder="أي ملاحظات إضافية"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 resize-none h-20"
                    />
                  )}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  createCustomer.isPending ||
                  (categories && categories.length === 0)
                }
                className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg w-full mt-2 transition-colors disabled:opacity-50"
              >
                {createCustomer.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>جاري الإضافة...</span>
                  </div>
                ) : (
                  <span>
                    {selectedFormType === CustomerTypeEnum.CUSTOMER
                      ? "إضافة العميل"
                      : "إضافة المورد"}
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Customer information display */}
      {selectedCustomer && (
        <>
          {selectedCustomer.customerType === "SUPPLIER"
            ? // For suppliers, show supplier balance
              selectedCustomer.supplierBalance > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 w-fit">
                  الرصيد المستحق للمورد: {selectedCustomer.supplierBalance} ل.س
                </div>
              )
            : // For customers, show debt and breakage
              (() => {
                return (
                  <div className="flex flex-col gap-2">
                    {selectedCustomer.totalDebt > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors disabled:opacity-50 w-fit">
                        الدين الذي عليه: {selectedCustomer.totalDebt} ل.س
                      </div>
                    )}
                    {selectedCustomer.totalBreakAmount > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 w-fit">
                        قيمة الكسر: {selectedCustomer.totalBreakAmount} ل.س
                      </div>
                    )}
                  </div>
                );
              })()}
          {selectedAdvance && isAdvanceRepay && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50 w-fit">
              السلفة النشطة {selectedAdvance.remainingAmount} ليرة
            </div>
          )}
        </>
      )}

      {isCustomerRequired && !formData.customerId && (
        <div className="text-red-400 text-sm mt-1">
          يجب اختيار {mode === "income" ? "عميل" : "مورد"} للسلفة
        </div>
      )}
    </div>
  );
};

export default CustomerSection;
