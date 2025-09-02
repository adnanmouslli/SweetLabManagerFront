import { useItemGroups } from "@/hooks/items/useItemGroups";
import { useItems } from "@/hooks/items/useItems";
import { InvoiceCategory } from "@/types/invoice.type";
import { Item } from "@/types/invoice.type";
import { Plus } from "lucide-react";
import React, { useState } from "react";

// Define the form item interface
export interface FormItem {
  id: number;
  quantity: number;
  unitPrice: number;
  unit: string;
  factor: number;
  trayCount?: number;
  subTotal: number;
  itemId: number;
  productionRate?: number; // Added production rate
  item: Item & { productionRate?: number }; // Ensure item includes productionRate
}

interface ProductSelectorProps {
  selectedGroupId: number;
  setSelectedGroupId: React.Dispatch<React.SetStateAction<number>>;
  formItems: FormItem[];
  addFormItem: (newItem: FormItem) => void;
  mode: "income" | "expense";
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ 
  selectedGroupId, 
  setSelectedGroupId, 
  formItems, 
  addFormItem, 
  mode 
}) => {
  const { data: items } = useItems();
  const { data: itemGroups } = useItemGroups();

  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedItemPrice, setSelectedItemPrice] = useState<number>(0);
  const [selectedItemUnit, setSelectedItemUnit] = useState<string>("");
  const [selectedItemFactor, setSelectedItemFactor] = useState<number>(1);
  const [selectedItemProductionRate, setSelectedItemProductionRate] = useState<number>(0);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number>(-1);

  const isPurchaseInvoice = mode === "expense";

  const handleItemSelect = (itemId: number) => {
    setSelectedItem(itemId);
    const selectedProduct = items?.find((item) => item.id === itemId);

    if (selectedProduct) {
      // Set the production rate - ensure it's not null
      setSelectedItemProductionRate(selectedProduct.productionRate || 0);
      
      // Initialize with default unit if available
      if (selectedProduct.units && selectedProduct.units.length > 0) {
        // Find default unit in units array
        const defaultUnitIndex = selectedProduct.units.findIndex(
          (u) => u.unit === selectedProduct.defaultUnit
        );

        // Use default unit or first unit if default not found
        const unitIndex = defaultUnitIndex >= 0 ? defaultUnitIndex : 0;
        const unitInfo = selectedProduct.units[unitIndex];

        setSelectedUnitIndex(unitIndex);
        setSelectedItemUnit(unitInfo.unit);
        setSelectedItemPrice(unitInfo.price);
        setSelectedItemFactor(unitInfo.factor);
      } else {
        // Fallback to empty values if no units are defined
        setSelectedUnitIndex(-1);
        setSelectedItemUnit("");
        setSelectedItemPrice(0);
        setSelectedItemFactor(1);
      }
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitIndex = Number(e.target.value);
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

  const handleAddItem = () => {
    const selectedProduct = items?.find((item) => item.id === selectedItem);
    if (!selectedProduct || quantity <= 0) return;

    const newItem: FormItem = {
      id: Date.now(),
      quantity,
      unitPrice: selectedItemPrice,
      unit: selectedItemUnit,
      factor: selectedItemFactor,
      productionRate: selectedItemProductionRate,
      subTotal: quantity * selectedItemPrice,
      itemId: selectedProduct.id,
      item: {
        groupId: selectedProduct.groupId!,
        id: selectedProduct.id,
        name: selectedProduct.name,
        type: selectedProduct.type,
        price: selectedItemPrice,
        unit: selectedItemUnit,
        productionRate: selectedItemProductionRate, // Ensure production rate is included
        description: selectedProduct.description || '',
      },
    };

    addFormItem(newItem);
    resetItemSelection();
  };

  const resetItemSelection = () => {
    setSelectedItem(0);
    setSelectedItemPrice(0);
    setSelectedItemUnit("");
    setSelectedItemFactor(1);
    setSelectedItemProductionRate(0);
    setSelectedUnitIndex(-1);
    setQuantity(1);
  };

  return (
    <div className="space-y-4">
      {/* Group Selection */}
      <div className="space-y-4">
        <label className="block text-slate-200 mb-2">التصنيف</label>

        {/* Category Clouds Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {mode === "expense"
            ? itemGroups
              ?.filter((itemGroup) => itemGroup.type === "raw")
              .map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setSelectedItem(0); // Reset selected item when group changes
                  }}
                  className={`
                rounded-lg shadow-md p-4 text-center cursor-pointer transition-all duration-200
                border-2 transform hover:scale-105 hover:shadow-lg
                ${selectedGroupId === group.id
                      ? "bg-blue-500/30 border-blue-500/70 text-blue-200"
                      : "bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50"
                    }
              `}
                >
                  <div className="font-medium text-lg">{group.name}</div>
                </div>
              ))
            : itemGroups
              ?.filter((itemGroup) => itemGroup.type === "production")
              .map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setSelectedItem(0); // Reset selected item when group changes
                  }}
                  className={`
                rounded-lg shadow-md p-4 text-center cursor-pointer transition-all duration-200
                border-2 transform hover:scale-105 hover:shadow-lg
                ${selectedGroupId === group.id
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

      {/* Item Selection */}
      {(selectedGroupId > 0 || isPurchaseInvoice) && (
        <>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-slate-200 font-medium">اختيار المنتج</div>
              {selectedItem > 0 && (
                <button
                  onClick={() => setSelectedItem(0)}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  إلغاء الاختيار
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items
                ?.filter((item) => item.groupId === selectedGroupId)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(Number(item.id))}
                    className={`
              rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200
              border-2 transform hover:scale-105 hover:shadow-lg
              ${selectedItem === item.id
                        ? "bg-emerald-500/30 border-emerald-500/70 text-emerald-200"
                        : "bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50"
                      }
            `}
                  >
                    <div className="font-medium text-center">{item.name}</div>
                  </div>
                ))}
            </div>
          </div>

          {selectedItem > 0 && (
            <div className="bg-slate-700/30 rounded-lg p-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Unit Selection */}
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
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

                {/* Factor Input */}
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
                    step="0.01"
                    value={selectedItemPrice}
                    onChange={(e) => setSelectedItemPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                  />
                </div>
                {/* <div className="space-y-2">
                  <label className="block text-slate-200">سعر الانتاج</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={selectedItemProductionRate === null ? 0 : selectedItemProductionRate}
                    onChange={(e) => setSelectedItemProductionRate(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200"
                  />
                </div> */}
              </div>

              {/* Add Item Button */}
              <button
                onClick={handleAddItem}
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
    </div>
  );
};

export default ProductSelector;