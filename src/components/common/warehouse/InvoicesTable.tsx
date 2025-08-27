"use client";
import { WareHouseInvoice } from "@/types/warehouse.type";
import { formatDate, getCustomerDisplayName } from "@/utils/formatters";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

// Invoices Table Component
export const InvoicesTable = ({
  invoices,
  onViewInvoice,
}: {
  invoices: WareHouseInvoice[];
  onViewInvoice: (invoice: WareHouseInvoice) => void;
}) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="text-right text-slate-200 p-4">رقم الفاتورة</th>
            <th className="text-right text-slate-200 p-4">التاريخ</th>
            <th className="text-right text-slate-200 p-4">المورد</th>
            <th className="text-right text-slate-200 p-4">المبلغ</th>
            <th className="text-right text-slate-200 p-4">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <motion.tr
              key={invoice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-t border-white/10 hover:bg-white/5 transition-colors"
            >
              <td className="p-4 text-slate-300">{invoice.invoiceNumber}</td>
              <td className="p-4 text-slate-300">
                {formatDate(invoice.createdAt)}
              </td>
              <td className="p-4 text-slate-300">{getCustomerDisplayName(invoice.customer, invoice.notes)}</td>

              <td className="p-4 text-slate-300">{invoice.totalAmount} ليرة</td>
              <td className="p-4">
                <button
                  onClick={() => onViewInvoice(invoice)}
                  className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
