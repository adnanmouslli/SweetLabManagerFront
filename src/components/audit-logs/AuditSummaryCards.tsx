"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  LogIn,
  AlertTriangle,
} from "lucide-react";
import { AuditSummary } from "@/types/audit-logs.type";

interface AuditSummaryCardsProps {
  summary: AuditSummary[];
  isLoading?: boolean;
}

const AuditSummaryCards: React.FC<AuditSummaryCardsProps> = ({
  summary,
  isLoading,
}) => {
  const stats = useMemo(() => {
    if (!summary || summary.length === 0) {
      return {
        total: 0,
        creates: 0,
        updates: 0,
        deletes: 0,
        logins: 0,
        failed: 0,
      };
    }

    const total = summary.reduce((sum, item) => sum + item.count, 0);
    const creates = summary
      .filter((item) => item.action === "CREATE")
      .reduce((sum, item) => sum + item.count, 0);
    const updates = summary
      .filter((item) => item.action === "UPDATE")
      .reduce((sum, item) => sum + item.count, 0);
    const deletes = summary
      .filter(
        (item) =>
          item.action.startsWith("DELETE") ||
          item.action === "REMOVE_EMPLOYEE" ||
          item.action.includes("DELETE")
      )
      .reduce((sum, item) => sum + item.count, 0);
    const logins = summary
      .filter((item) => item.action === "LOGIN")
      .reduce((sum, item) => sum + item.count, 0);
    const failed = summary
      .filter((item) => item.action.startsWith("FAILED_"))
      .reduce((sum, item) => sum + item.count, 0);

    return { total, creates, updates, deletes, logins, failed };
  }, [summary]);

  const cards = [
    {
      label: "إجمالي الأنشطة",
      value: stats.total,
      icon: Activity,
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      label: "عمليات الإنشاء",
      value: stats.creates,
      icon: Plus,
      color: "from-green-500/20 to-green-600/10 border-green-500/30",
      iconColor: "text-green-400",
    },
    {
      label: "عمليات التعديل",
      value: stats.updates,
      icon: Edit,
      color: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
      iconColor: "text-orange-400",
    },
    {
      label: "عمليات الحذف",
      value: stats.deletes,
      icon: Trash2,
      color: "from-red-500/20 to-red-600/10 border-red-500/30",
      iconColor: "text-red-400",
    },
    {
      label: "عمليات تسجيل الدخول",
      value: stats.logins,
      icon: LogIn,
      color: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      label: "العمليات الفاشلة",
      value: stats.failed,
      icon: AlertTriangle,
      color: "from-red-600/20 to-red-700/10 border-red-600/30",
      iconColor: "text-red-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 animate-pulse"
          >
            <div className="h-4 bg-slate-700/50 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-700/50 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative bg-gradient-to-br ${card.color}
              backdrop-blur-lg border rounded-xl p-4
              shadow-sm hover:shadow-md transition-all duration-300
              hover:-translate-y-1 overflow-hidden group
            `}
            dir="rtl"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
                <span className="text-xs font-medium text-slate-300">
                  {card.label}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {card.value.toLocaleString("ar-SA")}
            </div>
            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white/30 group-hover:w-full transition-all duration-300"></div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AuditSummaryCards;
