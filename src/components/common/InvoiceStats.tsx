import { formatSYP } from "@/hooks/invoices/useInvoiceStats";
import { Invoice } from "@/types/invoice.type";
import { DollarSign, ArrowDownCircle, Scale } from "lucide-react";

interface InvoiceStatsProps {
  data: Invoice[];
}

export const InvoiceStats: React.FC<InvoiceStatsProps> = ({ data }) => {
  const totalIncome = data
    .filter((inv) => inv.invoiceType == "income" && inv.paidStatus == true)
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.discount), 0);

  const totalExpense = data
    .filter((inv) => inv.invoiceType == "expense")
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.discount), 0);

  const totalDifference = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">إجمالي المبيعات</p>
            <p className="text-emerald-400 text-lg font-semibold">
              {formatSYP(totalIncome)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-emerald-400/20" />
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">إجمالي المصروفات</p>
            <p className="text-red-400 text-lg font-semibold">
              {formatSYP(totalExpense)}
            </p>
          </div>
          <ArrowDownCircle className="h-8 w-8 text-red-400/20" />
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">الصافي</p>
            <p className={`text-lg font-semibold ${totalDifference >= 0 ? "text-green-400" : "text-orange-400"}`}>
              {formatSYP(totalDifference)}
            </p>
          </div>
          <Scale className="h-8 w-8 text-blue-400/20" />
        </div>
      </div>
    </div>
  );
};
