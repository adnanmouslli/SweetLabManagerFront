"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  User,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
  Users,
  FileText,
  Clock,
  CreditCard,
  Package,
  Layers,
  ShoppingBag,
  List,
  Tags,
  Wallet,
  DollarSign,
  UserCircle,
  Building,
  Network,
  Truck,
  Server,
} from "lucide-react";
import {
  AuditLog,
  getActionLabel,
  getEntityLabel,
  getActionColor,
} from "@/types/audit-logs.type";

interface AuditTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (log: AuditLog) => void;
  onViewUserActivity: (userId: number) => void;
  onViewEntityHistory: (entity: string, entityId: number) => void;
  onSort?: (field: string, order: "asc" | "desc") => void;
}

const AuditTable: React.FC<AuditTableProps> = ({
  logs,
  isLoading,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onViewUserActivity,
  onViewEntityHistory,
  onSort,
}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    const newOrder =
      sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newOrder);
    onSort?.(field, newOrder);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return formatDate(dateString);
  };

  const getStatusBadge = (statusCode: number | null) => {
    if (!statusCode) return null;
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
          <CheckCircle className="h-3 w-3" />
          نجح
        </span>
      );
    }
    if (statusCode >= 400 && statusCode < 500) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
          <AlertCircle className="h-3 w-3" />
          خطأ
        </span>
      );
    }
    if (statusCode >= 500) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
          <XCircle className="h-3 w-3" />
          فشل
        </span>
      );
    }
    return null;
  };

  const getEntityIcon = (entity: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Auth: Lock,
      User: User,
      Customer: Users,
      Invoice: FileText,
      Shift: Clock,
      Debt: CreditCard,
      Item: Package,
      ItemGroup: Layers,
      Order: ShoppingBag,
      OrderItem: List,
      OrderCategory: Tags,
      Fund: Wallet,
      Advance: DollarSign,
      Employee: UserCircle,
      Workshop: Building,
      CustomerCategory: Network,
      TrayTracking: Truck,
      System: Server,
    };
    return iconMap[entity] || FileText;
  };

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">لا توجد سجلات مطابقة للفلاتر</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/30">
            <tr>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">#</th>
              <th
                className="text-right p-3 text-slate-300 text-sm font-medium cursor-pointer hover:bg-slate-700/50"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  التاريخ والوقت
                  {sortField === "createdAt" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>
              </th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">المستخدم</th>
              <th
                className="text-right p-3 text-slate-300 text-sm font-medium cursor-pointer hover:bg-slate-700/50"
                onClick={() => handleSort("action")}
              >
                <div className="flex items-center gap-1">
                  العملية
                  {sortField === "action" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>
              </th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">الكيان</th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">معرّف الكيان</th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">العميل</th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">نوع الفاتورة</th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">تصنيف الفاتورة</th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">الوصف</th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">الحالة</th>
              <th className="text-right p-3 text-slate-300 text-sm font-medium">تفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => {
              const actionColor = getActionColor(log.action);
              const EntityIcon = getEntityIcon(log.entity);
              const isDelete = log.action.startsWith("DELETE") || log.action === "REMOVE_EMPLOYEE";
              const isFailed = log.action.startsWith("FAILED_");

              return (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`
                    border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors
                    ${isDelete ? "bg-red-500/5 border-l-2 border-l-red-500" : ""}
                    ${isFailed ? "bg-red-600/10 border-l-2 border-l-red-600" : ""}
                  `}
                >
                  <td className="p-3 text-slate-300 text-sm">
                    {startIndex + index + 1}
                  </td>
                  <td className="p-3 text-slate-300 text-sm">
                    <div className="flex flex-col">
                      <span>{formatDate(log.createdAt)}</span>
                      <span className="text-xs text-slate-400" title={getRelativeTime(log.createdAt)}>
                        {getRelativeTime(log.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    {log.username ? (
                      <button
                        onClick={() => log.userId && onViewUserActivity(log.userId)}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span className="text-sm">{log.username}</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: actionColor.bg,
                        color: actionColor.text,
                      }}
                    >
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <EntityIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">{getEntityLabel(log.entity)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {log.entityId ? (
                      <button
                        onClick={() => onViewEntityHistory(log.entity, log.entityId!)}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                      >
                        #{log.entityId}
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="text-slate-300 text-sm">
                      {log.metadata?.customerName || "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-300 text-sm">
                      {log.metadata?.invoiceType || "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-300 text-sm">
                      {log.metadata?.invoiceCategory || "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div
                      className="text-slate-300 text-sm max-w-xs truncate"
                      title={log.description || ""}
                    >
                      {log.description || "—"}
                    </div>
                  </td>
                  <td className="p-3">{getStatusBadge(log.statusCode)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => onViewDetail(log)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">
            عرض {startIndex + 1}-{Math.min(startIndex + pageSize, total)} من {total.toLocaleString("ar-SA")} سجل
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500/50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            الأول
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            السابق
          </button>
          <span className="text-slate-400 text-sm px-2">
            صفحة {currentPage} من {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            التالي
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            الأخير
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;
