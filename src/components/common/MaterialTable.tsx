import { Item, ItemType } from "@/types/items.type";
import { Edit2, Trash2, Package, TrendingUp, Truck, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Role, useRoles } from "@/hooks/users/useRoles";
import { useState, useEffect, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { ChevronLeft, ChevronRight, Eye, ArrowUpDown, Pencil } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface MaterialTableProps {
  items: Item[];
  getDefaultUnitPrice: (item: Item) => number;
  activeTab: ItemType | "all";
  onEdit: (item: Item) => void;
  onDelete: (itemId: number) => void;
}

// Pagination Controls
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const result = [1];
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);

      if (leftBound > 2) result.push(-1);
      for (let i = leftBound; i <= rightBound; i++) {
        result.push(i);
      }
      if (rightBound < totalPages - 1) result.push(-2);
      result.push(totalPages);

      return result;
    }
  }, [currentPage, totalPages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 my-4 p-2"
      dir="rtl"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((number, index) => (
          number < 0 ? (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
          ) : (
            <motion.button
              key={number}
              onClick={() => onPageChange(number)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                currentPage === number
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/25"
              }`}
            >
              {number}
            </motion.button>
          )
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

// Mobile Card
const MobileCard: React.FC<{
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (itemId: number) => void;
}> = ({ item, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const { hasAnyRole } = useRoles();

  const typeColor = item.type === "production"
    ? "text-blue-400 bg-blue-400/10"
    : "text-amber-400 bg-amber-400/10";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      className="bg-slate-700/30 rounded-lg overflow-hidden border border-slate-600/30"
    >
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-slate-200 font-medium">{item.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor}`}>
                {item.type === "production" ? "منتج" : "مادة خام"}
              </span>
            </div>
            <span className="text-sm text-slate-400">
              {item.group?.name || "-"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-slate-300 hover:bg-slate-600/30 rounded transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              <Eye className="h-4 w-4" />
            </button>
            {hasAnyRole([Role.ADMIN]) && (
              <>
                <button
                  className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-400 block mb-1">السعر النهائي</span>
            <span className="text-emerald-400 font-medium">{item.price?.toFixed(2) || "0.00"} ل.س</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">الوحدة الافتراضية</span>
            <span className="text-slate-200">{item.defaultUnit}</span>
          </div>
        </div>

        {/* Price Details */}
        <div className="space-y-1 pt-2 border-t border-slate-600/30">
          <div className="flex items-center gap-2 text-xs">
            <DollarSign className="h-3 w-3 text-slate-400" />
            <span className="text-slate-400">أساسي:</span>
            <span className="text-slate-200 font-medium">
              {item.basePrice?.toFixed(2) || "0.00"}
            </span>
          </div>
          
          {(item.packagingPrice ?? 0) > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Package className="h-3 w-3 text-purple-400" />
              <span className="text-slate-400">تكييس:</span>
              <span className="text-purple-300 font-medium">
                +{item.packagingPrice?.toFixed(2)}
              </span>
            </div>
          )}
          
          {(item.deliveryPrice ?? 0) > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Truck className="h-3 w-3 text-blue-400" />
              <span className="text-slate-400">توصيل:</span>
              <span className="text-blue-300 font-medium">
                +{item.deliveryPrice?.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-600/30 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400 block mb-1">الوحدات المتاحة</span>
                  <span className="text-slate-200">
                    {item.units?.map((u) => u.unit).join(", ") || "-"}
                  </span>
                </div>
                {item.cost !== undefined && item.type === "raw" && (
                  <div>
                    <span className="text-slate-400 block mb-1">التكلفة</span>
                    <span className="text-slate-200">{item.cost} ل.س</span>
                  </div>
                )}
                {item.productionRate !== undefined && item.type === "production" && (
                  <div>
                    <span className="text-slate-400 block mb-1">سعر الإنتاج</span>
                    <span className="text-slate-200">{item.productionRate} ل.س</span>
                  </div>
                )}
              </div>

              {item.description && (
                <div className="pt-2 border-t border-slate-600/30">
                  <span className="text-sm text-slate-400 block mb-1">الوصف</span>
                  <p className="text-sm text-slate-300">{item.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MaterialTable: React.FC<MaterialTableProps> = ({
  items,
  getDefaultUnitPrice,
  activeTab,
  onEdit,
  onDelete,
}) => {
  const { hasAnyRole } = useRoles();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Item | "price";
    direction: "asc" | "desc";
  } | null>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const sortedItems = useMemo(() => {
    if (!items) return [];
    
    let itemsToSort = [...items];

    if (sortConfig) {
      itemsToSort.sort((a, b) => {
        if (sortConfig.key === "price") {
          const aPrice = a.price || 0;
          const bPrice = b.price || 0;
          return sortConfig.direction === "asc" ? aPrice - bPrice : bPrice - aPrice;
        } else {
          const aValue = a[sortConfig.key] || "";
          const bValue = b[sortConfig.key] || "";

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sortConfig.direction === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else if (typeof aValue === "number" && typeof bValue === "number") {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
          }
          return 0;
        }
      });
    }

    return itemsToSort;
  }, [items, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  const requestSort = (key: keyof Item | "price") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Item | "price") => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === "asc"
      ? <ChevronRight className="h-4 w-4" />
      : <ChevronLeft className="h-4 w-4" />;
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">لا توجد مواد في هذا التصنيف</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        <motion.div className="space-y-3">
          {paginatedItems.map((item) => (
            <MobileCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </motion.div>
        {sortedItems.length > PAGE_SIZE && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th
                className="px-4 py-3 text-right text-sm font-medium text-slate-300 cursor-pointer hover:bg-slate-700/30"
                onClick={() => requestSort("name")}
              >
                <div className="flex items-center justify-between">
                  <span>الاسم</span>
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-sm font-medium text-slate-300 cursor-pointer hover:bg-slate-700/30"
                onClick={() => requestSort("type")}
              >
                <div className="flex items-center justify-between">
                  <span>النوع</span>
                  {getSortIcon("type")}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                التصنيف
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                الوحدة الافتراضية
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                تفاصيل الأسعار
              </th>
              <th
                className="px-4 py-3 text-right text-sm font-medium text-slate-300 cursor-pointer hover:bg-slate-700/30"
                onClick={() => requestSort("price")}
              >
                <div className="flex items-center justify-between">
                  <span>السعر النهائي</span>
                  {getSortIcon("price")}
                </div>
              </th>
              {hasAnyRole([Role.ADMIN]) && (
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="px-4 py-3 text-slate-200">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-slate-400 mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.type === "production"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {item.type === "production" ? "منتج" : "مادة خام"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {item.group?.name || "-"}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {item.defaultUnit}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign className="h-3 w-3 text-slate-400" />
                      <span className="text-slate-400">أساسي:</span>
                      <span className="text-slate-200 font-medium">
                        {item.basePrice?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    
                    {(item.packagingPrice ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Package className="h-3 w-3 text-purple-400" />
                        <span className="text-slate-400">تكييس:</span>
                        <span className="text-purple-300 font-medium">
                          +{item.packagingPrice?.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {(item.deliveryPrice ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Truck className="h-3 w-3 text-blue-400" />
                        <span className="text-slate-400">توصيل:</span>
                        <span className="text-blue-300 font-medium">
                          +{item.deliveryPrice?.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {item.type === "production" && item.productionRate && (
                      <div className="flex items-center gap-2 text-xs">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        <span className="text-slate-400">إنتاج:</span>
                        <span className="text-emerald-300 font-medium">
                          {item.productionRate.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {(item.packagingPrice ?? 0) === 0 && (item.deliveryPrice ?? 0) === 0 && (
                      <div className="text-xs text-slate-500 italic">
                        لا توجد تكاليف إضافية
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-emerald-400">
                      {item.price?.toFixed(2) || "0.00"}
                    </span>
                    <span className="text-xs text-slate-400">ل.س</span>
                  </div>
                </td>
                {hasAnyRole([Role.ADMIN]) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedItems.length > PAGE_SIZE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};

export default MaterialTable;