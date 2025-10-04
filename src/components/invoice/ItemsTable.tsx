import { motion } from "framer-motion";
import { Trash2, Package, Truck, X } from "lucide-react";
import { FormItem } from "./ProductSelector";

interface ItemsTableProps {
  formItems: FormItem[];
  removeItem: (itemId: number) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ formItems, removeItem }) => {
  if (formItems.length === 0) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-8 border border-slate-600/30 text-center">
        <p className="text-slate-400">لم يتم إضافة أي عناصر بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700/50 pb-2">
        العناصر المضافة
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/30">
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                المنتج
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                الكمية
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                الوحدة
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                الخيارات
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                سعر الوحدة
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                المجموع
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">
                إجراء
              </th>
            </tr>
          </thead>
          <tbody>
            {formItems.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="px-4 py-3 text-slate-200">
                  <div>
                    <div className="font-medium">{item.itemName}</div>
                    {/* Price Breakdown */}
                    {(item.withPackaging || item.withDelivery) && (
                      <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                        <div>أساسي: {item.basePrice?.toFixed(2)} ل.س</div>
                        {item.withPackaging && item.packagingPrice > 0 && (
                          <div className="text-purple-300">
                            + تكييس: {item.packagingPrice?.toFixed(2)} ل.س
                          </div>
                        )}
                        {item.withDelivery && item.deliveryPrice > 0 && (
                          <div className="text-blue-300">
                            + توصيل: {item.deliveryPrice?.toFixed(2)} ل.س
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-200 font-medium">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-slate-200">{item.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item.withPackaging && item.packagingPrice > 0 && (
                      <div className="flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded text-xs text-purple-300">
                        <Package className="h-3 w-3" />
                        <span>تكييس</span>
                      </div>
                    )}
                    {item.withDelivery && item.deliveryPrice > 0 && (
                      <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded text-xs text-blue-300">
                        <Truck className="h-3 w-3" />
                        <span>توصيل</span>
                      </div>
                    )}
                    {!item.withPackaging && !item.withDelivery && (
                      <div className="flex items-center gap-1 bg-slate-500/10 px-2 py-1 rounded text-xs text-slate-400">
                        <X className="h-3 w-3" />
                        <span>بدون إضافات</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-emerald-400 font-medium">
                  {item.unitPrice.toFixed(2)} ل.س
                </td>
                <td className="px-4 py-3 text-emerald-400 font-bold">
                  {item.subTotal.toFixed(2)} ل.س
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-700">
              <td
                colSpan={5}
                className="px-4 py-3 text-right text-slate-200 font-bold"
              >
                الإجمالي:
              </td>
              <td className="px-4 py-3 text-emerald-400 font-bold text-lg">
                {formItems
                  .reduce((sum, item) => sum + item.subTotal, 0)
                  .toFixed(2)}{" "}
                ل.س
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {formItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="text-slate-200 font-medium">{item.itemName}</h4>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {item.withPackaging && item.packagingPrice > 0 && (
                    <div className="flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded text-xs text-purple-300">
                      <Package className="h-3 w-3" />
                      <span>تكييس</span>
                    </div>
                  )}
                  {item.withDelivery && item.deliveryPrice > 0 && (
                    <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded text-xs text-blue-300">
                      <Truck className="h-3 w-3" />
                      <span>توصيل</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">الكمية:</span>
                <span className="text-slate-200">
                  {item.quantity} {item.unit}
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-600/50 pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">السعر الأساسي:</span>
                  <span className="text-slate-200">{item.basePrice?.toFixed(2)} ل.س</span>
                </div>
                {item.withPackaging && item.packagingPrice > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">سعر التكييس:</span>
                    <span className="text-purple-300">+{item.packagingPrice?.toFixed(2)} ل.س</span>
                  </div>
                )}
                {item.withDelivery && item.deliveryPrice > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">سعر التوصيل:</span>
                    <span className="text-blue-300">+{item.deliveryPrice?.toFixed(2)} ل.س</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t border-slate-600/50 pt-2">
                <span className="text-slate-400">سعر الوحدة:</span>
                <span className="text-emerald-400 font-medium">
                  {item.unitPrice.toFixed(2)} ل.س
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-200 font-medium">المجموع:</span>
                <span className="text-emerald-400 font-bold">
                  {item.subTotal.toFixed(2)} ل.س
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Mobile Total */}
        <div className="bg-slate-800/50 rounded-lg p-4 border-2 border-emerald-500/30">
          <div className="flex justify-between items-center">
            <span className="text-slate-200 font-bold text-lg">الإجمالي:</span>
            <span className="text-emerald-400 font-bold text-xl">
              {formItems.reduce((sum, item) => sum + item.subTotal, 0).toFixed(2)} ل.س
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;