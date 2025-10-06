import { useItemGroups } from "@/hooks/items/useItemGroups";
import { useItems } from "@/hooks/items/useItems";
import { Item } from "@/types/items.type";
import { Plus, Package, Truck } from "lucide-react";
import React, { useState, useEffect } from "react";

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
  itemName: string;
  productionRate?: number;
  withPackaging: boolean;
  withDelivery: boolean;
  basePrice: number;
  packagingPrice: number;
  deliveryPrice: number;
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
  const [withPackaging, setWithPackaging] = useState<boolean>(true);
  const [withDelivery, setWithDelivery] = useState<boolean>(true);

  const isPurchaseInvoice = mode === "expense";

  // Update price when packaging or delivery changes
  useEffect(() => {
    if (mode !== "income" || selectedItem === 0) return;
    
    const selectedProduct = items?.find((item) => item.id === selectedItem);
    if (!selectedProduct) return;

    const basePrice = selectedProduct.basePrice || 0;
    const packagingPrice = withPackaging ? (selectedProduct.packagingPrice || 0) : 0;
    const deliveryPrice = withDelivery ? (selectedProduct.deliveryPrice || 0) : 0;
    const finalPrice = basePrice + packagingPrice + deliveryPrice;
    
    const unitInfo = selectedProduct.units?.[selectedUnitIndex];
    if (unitInfo) {
      const calculatedPrice = unitInfo.unit === selectedProduct.defaultUnit 
        ? finalPrice 
        : finalPrice * (unitInfo.conversionFactor || 1);
        
      setSelectedItemPrice(calculatedPrice);
    }
  }, [withPackaging, withDelivery, selectedItem, selectedUnitIndex, mode, items]);

  const handleItemSelect = (itemId: number) => {
    setSelectedItem(itemId);
    const selectedProduct = items?.find((item) => item.id === itemId);

    if (selectedProduct) {
      setSelectedItemProductionRate(selectedProduct.productionRate || 0);
      
      if (selectedProduct.units && selectedProduct.units.length > 0) {
        const defaultUnitIndex = selectedProduct.units.findIndex(
          (u) => u.unit === selectedProduct.defaultUnit
        );

        const unitIndex = defaultUnitIndex >= 0 ? defaultUnitIndex : 0;
        const unitInfo = selectedProduct.units[unitIndex];

        setSelectedUnitIndex(unitIndex);
        setSelectedItemUnit(unitInfo.unit);
        
        // Calculate price based on packaging and delivery for income mode
        if (mode === "income") {
          const basePrice = selectedProduct.basePrice || 0;
          const packagingPrice = withPackaging ? (selectedProduct.packagingPrice || 0) : 0;
          const deliveryPrice = withDelivery ? (selectedProduct.deliveryPrice || 0) : 0;
          const finalPrice = basePrice + packagingPrice + deliveryPrice;
          
          // Apply factor for non-default units
          const calculatedPrice = unitInfo.unit === selectedProduct.defaultUnit 
            ? finalPrice 
            : finalPrice * (unitInfo.conversionFactor || 1);
            
          setSelectedItemPrice(calculatedPrice);
        } else {
          setSelectedItemPrice(unitInfo.price);
        }
        
        setSelectedItemFactor(unitInfo.conversionFactor);
      } else {
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
      setSelectedItemFactor(unitInfo.conversionFactor);
      
      // Calculate price for income mode
      if (mode === "income") {
        const basePrice = selectedProduct.basePrice || 0;
        const packagingPrice = withPackaging ? (selectedProduct.packagingPrice || 0) : 0;
        const deliveryPrice = withDelivery ? (selectedProduct.deliveryPrice || 0) : 0;
        const finalPrice = basePrice + packagingPrice + deliveryPrice;
        
        const calculatedPrice = unitInfo.unit === selectedProduct.defaultUnit 
          ? finalPrice 
          : finalPrice * (unitInfo.conversionFactor || 1);
          
        setSelectedItemPrice(calculatedPrice);
      } else {
        setSelectedItemPrice(unitInfo.price);
      }
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
      itemName: selectedProduct.name,
      withPackaging: mode === "income" ? withPackaging : false,
      withDelivery: mode === "income" ? withDelivery : false,
      basePrice: selectedProduct.basePrice || 0,
      packagingPrice: selectedProduct.packagingPrice || 0,
      deliveryPrice: selectedProduct.deliveryPrice || 0,
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
    setWithPackaging(true);
    setWithDelivery(true);
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
                    setSelectedItem(0);
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
                    setSelectedItem(0);
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
            <div className="bg-slate-700/30 rounded-lg p-4 mt-4 space-y-4">
              {/* Packaging and Delivery Options - Only for income */}
              {mode === "income" && (() => {
                const selectedProduct = items?.find((item) => item.id === selectedItem);
                return selectedProduct && ((selectedProduct.packagingPrice || 0) > 0 || (selectedProduct.deliveryPrice || 0) > 0) && (
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <div className="flex items-center gap-6">
                      {(selectedProduct.packagingPrice || 0) > 0 && (
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={withPackaging}
                            onChange={(e) => setWithPackaging(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-700/50 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800 cursor-pointer"
                          />
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-400" />
                            <span className="text-slate-200 group-hover:text-slate-100">
                              مع تكييس
                            </span>
                            <span className="text-purple-300 text-sm">
                              (+{selectedProduct.packagingPrice?.toFixed(2)} ل.س)
                            </span>
                          </div>
                        </label>
                      )}

                      {(selectedProduct.deliveryPrice || 0) > 0 && (
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={withDelivery}
                            onChange={(e) => setWithDelivery(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-700/50 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800 cursor-pointer"
                          />
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-400" />
                            <span className="text-slate-200 group-hover:text-slate-100">
                              مع توصيل
                            </span>
                            <span className="text-blue-300 text-sm">
                              (+{selectedProduct.deliveryPrice?.toFixed(2)} ل.س)
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })()}

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