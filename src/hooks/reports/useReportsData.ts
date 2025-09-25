import { useQuery } from "@tanstack/react-query";
import {
  useCustomersList,
  useCustomerCategories,
  useCustomerCategoriesList,
} from "@/hooks/customers/useCustomers";
import { useItems } from "@/hooks/items/useItems";
import { useItemGroups } from "@/hooks/items/useItemGroups";
import { useDebtsTracking } from "@/hooks/debts/useDebts";
import { useShifts } from "@/hooks/shifts/useShifts";
import {
  CustomerType,
  CustomerTypeEnum,
  ListCustomerType,
} from "@/types/customers.type";
import { Item } from "@/types/items.type";
import { ItemGroup } from "@/types/items.type";
import { Debt } from "@/types/debts.type";
import { CustomerCategory } from "@/types/customerCategories.types";
import { useEmployee, useEmployeesList } from "../employees";
import { useWorkshops } from "../workshops";
import { useOrderCategories } from "../useOrders";

// Hook to get all data needed for reports
export const useReportsData = () => {
  const { data: employees = [], isLoading: employeesLoading } =
    useEmployeesList();

  const { data: workshops = [], isLoading: workshopsLoading } = useWorkshops();
  const { data: orderCategories = [], isLoading: orderCategoriesLoading } =
    useOrderCategories();

  // Fetch customers
  const { data: customers = [], isLoading: customersLoading } =
    useCustomersList();

  // Fetch customer categories
  const { data: customerCategories = [], isLoading: categoriesLoading } =
    useCustomerCategoriesList();

  // Fetch items
  const { data: items = [], isLoading: itemsLoading } = useItems();

  // Fetch item groups
  const { data: itemGroups = [], isLoading: itemGroupsLoading } =
    useItemGroups();

  // Fetch debts
  const { data: debts = [], isLoading: debtsLoading } = useDebtsTracking();

  // Fetch shifts
  const { data: shifts = [], isLoading: shiftsLoading } = useShifts();

  // Transform data for report filters
  const customerOptions = customers
    .filter((item) => item.customerType == CustomerTypeEnum.CUSTOMER)
    .map((customer: ListCustomerType) => ({
      value: customer.id,
      label: customer.name,
    }));

  const customerCategoryOptions = customerCategories.map(
    (category: CustomerCategory) => {
      return {
        value: category.id,
        label: category.name,
      };
    }
  );

  const itemOptionsRaw = items
    .filter((item) => item.type == "raw")
    .map((item: Item) => ({
      value: item.id,
      label: item.name,
    }));

  const itemOptionsProduction = items
    .filter((item) => item.type == "production")
    .map((item: Item) => ({
      value: item.id,
      label: item.name,
    }));

  const itemGroupOptions = itemGroups.map((group: ItemGroup) => ({
    value: group.id,
    label: group.name,
  }));

  const debtOptions = debts.map((debt: Debt) => ({
    value: debt.id,
    label: `دين #${debt.id} - ${debt.customer.name}`,
  }));

  const shiftOptions = shifts.map((shift) => ({
    value: shift.id,
    label: `واردية #${shift.id} - ${
      shift.shiftType === "morning" ? "صباحية" : "مسائية"
    }`,
  }));

  const isLoading =
    customersLoading ||
    categoriesLoading ||
    itemsLoading ||
    itemGroupsLoading ||
    debtsLoading ||
    shiftsLoading;

  return {
    // Raw data
    customers,
    customerCategories,
    items,
    itemGroups,
    debts,
    shifts,
    employees,
    workshops,
    orderCategories,

    // Transformed options for filters
    customerOptions,
    customerCategoryOptions,
    itemOptionsRaw,
    itemOptionsProduction,
    itemGroupOptions,
    debtOptions,
    shiftOptions,

    // Loading states
    isLoading,
    orderCategoriesLoading,
    workshopsLoading,
    employeesLoading,
    customersLoading,
    categoriesLoading,
    itemsLoading,
    itemGroupsLoading,
    debtsLoading,
    shiftsLoading,
  };
};

export default useReportsData;
