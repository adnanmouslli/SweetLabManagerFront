import React from "react";
import { Trash2 } from "lucide-react";
import { FormItem } from "./ProductSelector";

interface ItemsTableProps {
  formItems: FormItem[];
  removeItem: (itemId: number) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ formItems, removeItem }) => {
  if (formItems.length === 0) {
    return null;
  }

  return (
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
            {/* <th className="text-right text-slate-200 p-3">سعر الانتاج</th> */}
            <th className="text-right text-slate-200 p-3">المجموع</th>
            <th className="text-right text-slate-200 p-3"></th>
          </tr>
        </thead>
        <tbody>
          {formItems.map((item) => (
            <tr key={item.id} className="border-t border-slate-600/30">
              <td className="p-3 text-slate-300">{item.item.name}</td>
              <td className="p-3 text-slate-300">{item.quantity}</td>
              <td className="p-3 text-slate-300">{item.unit}</td>
              <td className="p-3 text-slate-300">{item.unitPrice.toFixed(2)}</td>
              <td className="p-3 text-slate-300">{item.factor}</td>
              {/* <td className="p-3 text-slate-300">{(item.productionRate ?? 0).toFixed(2)}</td> */}
              <td className="p-3 text-slate-300">{item.subTotal.toFixed(2)}</td>
              <td className="p-3">
                <button
                  onClick={() => removeItem(item.id)}
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
  );
};

export default ItemsTable;