import { useQuery } from '@tanstack/react-query';
import { useCustomersList, useCustomerCategories } from '@/hooks/customers/useCustomers';
import { useItems } from '@/hooks/items/useItems';
import { useItemGroups } from '@/hooks/items/useItemGroups';
import { useDebtsTracking } from '@/hooks/debts/useDebts';
import { useShifts } from '@/hooks/shifts/useShifts';
import { CustomerType } from '@/types/customers.type';
import { Item } from '@/types/items.type';
import { ItemGroup } from '@/types/items.type';
import { Debt } from '@/types/debts.type';
import { CustomerCategory } from '@/types/customerCategories.types';

// Hook to get all data needed for reports
export const useReportsData = () => {
    // Fetch customers
    const { data: customers = [], isLoading: customersLoading } = useCustomersList();

    // Fetch customer categories
    const { data: customerCategories = [], isLoading: categoriesLoading } = useCustomerCategories();

    // Fetch items
    const { data: items = [], isLoading: itemsLoading } = useItems();

    // Fetch item groups
    const { data: itemGroups = [], isLoading: itemGroupsLoading } = useItemGroups();

    // Fetch debts
    const { data: debts = [], isLoading: debtsLoading } = useDebtsTracking();

    // Fetch shifts
    const { data: shifts = [], isLoading: shiftsLoading } = useShifts();

    // Transform data for report filters
    const customerOptions = customers.map((customer: CustomerType) => ({
        value: customer.id,
        label: customer.name
    }));

    const customerCategoryOptions = customerCategories.map((category: CustomerCategory) => ({
        value: category.id,
        label: category.name
    }));

    const itemOptions = items.map((item: Item) => ({
        value: item.id,
        label: item.name
    }));

    const itemGroupOptions = itemGroups.map((group: ItemGroup) => ({
        value: group.id,
        label: group.name
    }));

    const debtOptions = debts.map((debt: Debt) => ({
        value: debt.id,
        label: `دين #${debt.id} - ${debt.customer.name}`
    }));

    const shiftOptions = shifts.map((shift) => ({
        value: shift.id,
        label: `واردية #${shift.id} - ${shift.shiftType === 'morning' ? 'صباحية' : 'مسائية'}`
    }));

    const isLoading = customersLoading || categoriesLoading || itemsLoading ||
        itemGroupsLoading || debtsLoading || shiftsLoading;

    return {
        // Raw data
        customers,
        customerCategories,
        items,
        itemGroups,
        debts,
        shifts,

        // Transformed options for filters
        customerOptions,
        customerCategoryOptions,
        itemOptions,
        itemGroupOptions,
        debtOptions,
        shiftOptions,

        // Loading states
        isLoading,
        customersLoading,
        categoriesLoading,
        itemsLoading,
        itemGroupsLoading,
        debtsLoading,
        shiftsLoading
    };
};

export default useReportsData;
