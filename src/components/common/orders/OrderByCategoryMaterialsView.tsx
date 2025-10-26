// components/orders/OrderByCategoryMaterialsView.tsx
"use client";

import React, { useMemo, useState } from "react";
import { OrderResponseDto } from "@/types/orders.type";
import { useOrderCategories } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/formatters";
import { ChevronDown, Eye, MoreVertical, Trash2 } from "lucide-react";
import SearchBar from "./SearchBar";

interface OrderByCategoryMaterialsViewProps {
  orders: OrderResponseDto[];
  isLoading: boolean;
  onViewOrderDetails: (order: OrderResponseDto) => void;
  onDeleteOrder?: (order: OrderResponseDto) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

interface Material {
  id: number;
  name: string;
}

interface OrderItemWithMaterial {
  orderItemId: number;
  quantity: number;
  materialId: number;
  materialName: string;
  unit?: string;
  conversionFactor?: number; // معامل التحويل إلى قطعة
}

interface OrderWithMaterials {
  order: OrderResponseDto;
  materials: OrderItemWithMaterial[];
}

interface CategoryGroup {
  categoryId: number;
  categoryName: string;
  orders: OrderWithMaterials[];
  allMaterials: Material[];
}

// دالة للحصول على معامل التحويل من ItemUnit
const getConversionFactorFromItem = (item: any, currentUnit: string): number => {
  if (!item || !item.units) {
    return 1;
  }
  const unitData = item.units.find(
    (u: any) => u.unit.toLowerCase() === (currentUnit?.toLowerCase() || item.defaultUnit?.toLowerCase())
  );
  return unitData?.factor || 1;
};

const OrderByCategoryMaterialsView: React.FC<OrderByCategoryMaterialsViewProps> = ({
  orders,
  isLoading,
  onViewOrderDetails,
  onDeleteOrder,
  searchTerm,
  onSearchChange,
}) => {
  const { data: categories = [] } = useOrderCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(categories.map((cat) => cat.id))
  );
  const [actionMenuOpen, setActionMenuOpen] = useState<{
    orderId: number;
    categoryId: number;
  } | null>(null);

  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Process orders by category with materials
  const groupedByCategory: CategoryGroup[] = useMemo(() => {
    return categories.map((category) => {
      // Filter orders for this category
      const categoryOrders = orders.filter(
        (order) => order.categoryId === category.id
      );

      // Apply search filter
      const filteredOrders = categoryOrders.filter((order) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.customer?.name?.toLowerCase().includes(searchLower) ||
          order.orderNumber?.toString().includes(searchTerm)
        );
      });

      // Collect all unique materials for this category
      const materialsMap = new Map<number, Material>();
      const ordersWithMaterials: OrderWithMaterials[] = [];

      filteredOrders.forEach((order) => {
        const orderMaterials: OrderItemWithMaterial[] = [];

        // Extract materials from order items - using 'items' instead of 'orderItems'
        order.items?.forEach((item) => {
          if (item.item) {
            const materialId = item.item.id;
            materialsMap.set(materialId, {
              id: materialId,
              name: item.item.name,
            });

            orderMaterials.push({
              orderItemId: item.id!,
              quantity: item.quantity,
              materialId: materialId,
              materialName: item.item.name,
              unit: item.unit,
              conversionFactor: getConversionFactorFromItem(item.item, item.unit),
            });
          }
        });

        ordersWithMaterials.push({
          order,
          materials: orderMaterials,
        });
      });

      // Sort materials alphabetically
      const allMaterials = Array.from(materialsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      return {
        categoryId: category.id,
        categoryName: category.name,
        orders: ordersWithMaterials,
        allMaterials,
      };
    });
  }, [categories, orders, searchTerm]);

  // Get quantity for a specific material in a specific order
  const getQuantityForMaterial = (
    orderWithMaterials: OrderWithMaterials,
    materialId: number
  ): { quantity: number; unit?: string } => {
    const material = orderWithMaterials.materials.find(
      (m) => m.materialId === materialId
    );
    return material 
      ? { quantity: material.quantity, unit: material.unit } 
      : { quantity: 0 };
  };

  // Get total quantity for a material across all orders in a category
  const getTotalForMaterial = (
    ordersInCategory: OrderWithMaterials[],
    materialId: number
  ): { quantity: number; hasUnitPiece: boolean } => {
    let totalQuantityInPieces = 0;
    let hasUnitPiece = false;

    ordersInCategory.forEach((orderWithMaterials) => {
      const material = orderWithMaterials.materials.find(
        (m) => m.materialId === materialId
      );
      if (material) {
        // الحصول على معامل التحويل من ItemUnit
        const conversionFactor = material.conversionFactor || 1;
        
        // حساب الكمية بالقطع = الكمية × معامل التحويل
        const quantityInPieces = material.quantity * conversionFactor;
        totalQuantityInPieces += quantityInPieces;

        if (material.unit?.toLowerCase() === "قطعة" || material.unit?.toLowerCase() === "piece") {
          hasUnitPiece = true;
        }
      }
    });

    // تقريب الرقم لـ 2 منازل عشرية
    const roundedTotal = Math.round(totalQuantityInPieces * 100) / 100;
    return { quantity: roundedTotal, hasUnitPiece };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-slate-400">جاري تحميل البيانات...</div>
      </div>
    );
  }

  const hasAnyOrders = groupedByCategory.some((group) => group.orders.length > 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          placeholder="ابحث حسب اسم الزبون أو رقم الطلب..."
        />
      </div>

      {/* Category Groups */}
      {hasAnyOrders ? (
        groupedByCategory.map((categoryGroup) => {
          if (categoryGroup.orders.length === 0) {
            return null;
          }

          const isExpanded = expandedCategories.has(categoryGroup.categoryId);

          return (
            <div
              key={categoryGroup.categoryId}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryGroup.categoryId)}
                className="w-full px-6 py-4 bg-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      isExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  <h3 className="text-lg font-semibold text-slate-200">
                    {categoryGroup.categoryName}
                  </h3>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                    {categoryGroup.orders.length} طلب
                  </span>
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="p-6">
                  {categoryGroup.allMaterials.length === 0 ? (
                    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 text-center text-slate-400">
                      لا توجد مواد في طلبيات هذا الصنف
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="px-4 py-3 text-center text-slate-400 font-semibold text-sm bg-slate-800/50 w-40 min-w-40">
                                الزبون / الطلب
                              </th>
                              {categoryGroup.allMaterials.map((material) => (
                                <th
                                  key={material.id}
                                  className="px-2 py-3 text-center text-slate-400 font-semibold text-sm bg-slate-800/50 whitespace-normal break-words"
                                  style={{ minWidth: '100px' }}
                                >
                                  <div className="text-center text-xs leading-tight">
                                    {material.name}
                                  </div>
                                </th>
                              ))}
                              <th className="px-4 py-3 text-center text-slate-400 font-semibold text-sm bg-slate-800/50 w-32 min-w-32">
                                ملاحظات
                              </th>
                              <th className="px-4 py-3 text-center text-slate-400 font-semibold text-sm bg-slate-800/50 w-20 min-w-20">
                                الإجراءات
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryGroup.orders.map((orderWithMaterials) => (
                              <tr
                                key={orderWithMaterials.order.id}
                                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                              >
                                <td className="px-4 py-3 w-40 min-w-40">
                                  <div className="flex flex-col text-center">
                                    <span className="font-medium text-slate-200 text-sm">
                                      {orderWithMaterials.order.customer?.name ||
                                        "غير معروف"}
                                    </span>
                                 
                                  </div>
                                </td>
                                {categoryGroup.allMaterials.map((material) => (
                                  <td
                                    key={material.id}
                                    className="px-2 py-3 text-center"
                                    style={{ minWidth: '100px' }}
                                  >
                                    {getQuantityForMaterial(
                                      orderWithMaterials,
                                      material.id
                                    ).quantity > 0 ? (
                                      <span 
                                        className={`inline-flex justify-center items-center bg-primary/20 text-primary px-2 py-1 rounded text-sm font-bold min-w-10 ${
                                          getQuantityForMaterial(orderWithMaterials, material.id).unit?.toLowerCase() === "قطعة" || 
                                          getQuantityForMaterial(orderWithMaterials, material.id).unit?.toLowerCase() === "piece"
                                            ? "border-b-2 border-red-500 pb-1"
                                            : ""
                                        }`}
                                      >
                                        {getQuantityForMaterial(
                                          orderWithMaterials,
                                          material.id
                                        ).quantity}
                                      </span>
                                    ) : (
                                      <span className="text-slate-600">-</span>
                                    )}
                                  </td>
                                ))}
                                <td className="px-4 py-3 w-32 min-w-32">
                                  <span className="text-xs text-slate-400 text-center block">
                                    {orderWithMaterials.order.notes ||
                                      "بدون ملاحظات"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 w-20 min-w-20">
                                  <div className="flex items-center justify-center gap-1 relative">
                                    
                                    <button
                                      onClick={() =>
                                        setActionMenuOpen({
                                          orderId: orderWithMaterials.order.id,
                                          categoryId:
                                            categoryGroup.categoryId,
                                        })
                                      }
                                      className="text-slate-400 hover:text-slate-200 transition-colors"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {/* Action Menu */}
                                    {actionMenuOpen?.orderId ===
                                      orderWithMaterials.order.id && (
                                      <div className="absolute left-0 top-full mt-2 bg-slate-700 rounded-lg shadow-lg border border-slate-600 z-50 whitespace-nowrap">
                                        <button
                                          onClick={() => {
                                            onViewOrderDetails(
                                              orderWithMaterials.order
                                            );
                                            setActionMenuOpen(null);
                                          }}
                                          className="w-full px-4 py-2 text-right text-slate-200 hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm"
                                        >
                                          <Eye className="h-4 w-4" />
                                          عرض التفاصيل
                                        </button>
                                        {onDeleteOrder && (
                                          <button
                                            onClick={() => {
                                              onDeleteOrder(
                                                orderWithMaterials.order
                                              );
                                              setActionMenuOpen(null);
                                            }}
                                            className="w-full px-4 py-2 text-right text-red-400 hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm border-t border-slate-600"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            حذف الطلب
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-slate-700/50 border-t-2 border-slate-600 font-semibold">
                              <td className="px-4 py-3 text-slate-200 w-40 min-w-40 text-center">
                                الإجمالي
                              </td>
                              {categoryGroup.allMaterials.map((material) => (
                                <td
                                  key={material.id}
                                  className="px-2 py-3 text-center text-primary"
                                  style={{ minWidth: '100px' }}
                                >
                                  {getTotalForMaterial(
                                    categoryGroup.orders,
                                    material.id
                                  ).quantity > 0 ? (
                                    <span 
                                      className={`inline-flex justify-center items-center bg-primary/20 px-2 py-1 rounded text-sm font-bold min-w-10 ${
                                        getTotalForMaterial(categoryGroup.orders, material.id).hasUnitPiece
                                          ? "border-b-2 border-red-500 pb-1"
                                          : ""
                                      }`}
                                    >
                                      {getTotalForMaterial(
                                        categoryGroup.orders,
                                        material.id
                                      ).quantity}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>
                              ))}
                              <td className="px-4 py-3 w-32 min-w-32" />
                              <td className="px-4 py-3 w-20 min-w-20" />
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="lg:hidden space-y-4">
                        {categoryGroup.orders.map((orderWithMaterials) => (
                          <div
                            key={orderWithMaterials.order.id}
                            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-slate-200">
                                  {orderWithMaterials.order.customer?.name ||
                                    "غير معروف"}
                                </h4>
                                <p className="text-xs text-slate-400">
                                  #{orderWithMaterials.order.orderNumber}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setActionMenuOpen({
                                    orderId: orderWithMaterials.order.id,
                                    categoryId: categoryGroup.categoryId,
                                  })
                                }
                                className="text-slate-400 hover:text-slate-200"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              {categoryGroup.allMaterials.map((material) => {
                                const quantityData = getQuantityForMaterial(
                                  orderWithMaterials,
                                  material.id
                                );
                                return quantityData.quantity > 0 ? (
                                  <div
                                    key={material.id}
                                    className="bg-slate-800 rounded p-2"
                                  >
                                    <p className="text-xs text-slate-400">
                                      {material.name}
                                    </p>
                                    <p className={`text-sm font-semibold text-primary ${
                                      quantityData.unit?.toLowerCase() === "قطعة" || 
                                      quantityData.unit?.toLowerCase() === "piece"
                                        ? "border-b-2 border-red-500 pb-1 inline-block"
                                        : ""
                                    }`}>
                                      {quantityData.quantity}
                                    </p>
                                  </div>
                                ) : null;
                              })}
                            </div>

                            <div className="text-xs text-slate-400 mb-3">
                              <span>ملاحظات:</span>{" "}
                              {orderWithMaterials.order.notes || "بدون"}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  onViewOrderDetails(
                                    orderWithMaterials.order
                                  )
                                }
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                                عرض
                              </button>
                              {onDeleteOrder && (
                                <button
                                  onClick={() =>
                                    onDeleteOrder(orderWithMaterials.order)
                                  }
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  حذف
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-8 text-center text-slate-400">
          لا توجد طلبيات متطابقة مع البحث
        </div>
      )}

      {/* Click outside to close menu */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
};

export default OrderByCategoryMaterialsView;