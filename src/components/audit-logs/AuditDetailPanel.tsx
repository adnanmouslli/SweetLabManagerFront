"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, ChevronDown, ChevronRight, User, FileText, Settings } from "lucide-react";
import { AuditLog, getActionLabel, getEntityLabel } from "@/types/audit-logs.type";
import toast from "react-hot-toast";

interface AuditDetailPanelProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
  onViewUserActivity: (userId: number) => void;
  onViewEntityHistory: (entity: string, entityId: number) => void;
}

// Render items array as a sub-table
const renderItemsTable = (items: any[]): React.ReactNode => {
  if (!items || items.length === 0) {
    return <span className="text-slate-400 italic">لا توجد عناصر</span>;
  }

  // Get all unique keys from items (excluding the numbered key like #1, #2)
  const allKeys = Array.from(new Set(items.flatMap((item) => Object.keys(item))));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-slate-600/50 rounded">
        <thead className="bg-slate-700/40">
          <tr>
            {allKeys.map((key) => (
              <th key={key} className="p-2 text-slate-300 text-right font-medium border-b border-slate-600/50">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/20">
              {allKeys.map((key) => (
                <td key={key} className="p-2 text-slate-200 text-right">
                  {item[key] !== undefined && item[key] !== null
                    ? typeof item[key] === "number"
                      ? item[key].toLocaleString("ar-SA")
                      : String(item[key])
                    : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to render data in a readable table format
const renderDataAsTable = (data: any, depth: number = 0): React.ReactNode => {
  if (data === null || data === undefined) {
    return <span className="text-slate-400 italic">لا يوجد</span>;
  }

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return <span className="text-slate-200">{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-slate-400 italic">قائمة فارغة</span>;
    }
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="bg-slate-700/20 p-2 rounded border-r-2 border-blue-500">
            <div className="text-xs text-slate-400 mb-1">عنصر #{index + 1}</div>
            {renderDataAsTable(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="text-slate-400 italic">كائن فارغ</span>;
    }

    return (
      <div className="space-y-2">
        <table className="w-full text-sm">
          <tbody>
            {entries.map(([key, value]) => {
              // Render "العناصر" as a special items sub-table
              if (key === "العناصر" && Array.isArray(value)) {
                return (
                  <tr key={key} className="border-b border-slate-700/30">
                    <td colSpan={2} className="p-2">
                      <div className="text-slate-400 font-medium mb-2">{key}</div>
                      {renderItemsTable(value)}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={key} className="border-b border-slate-700/30">
                  <td className="p-2 text-slate-400 font-medium w-1/3 align-top">
                    {key}
                  </td>
                  <td className="p-2 text-slate-200 align-top">
                    {typeof value === "object" && value !== null ? (
                      <div className="pl-2 border-r-2 border-slate-600">
                        {renderDataAsTable(value, depth + 1)}
                      </div>
                    ) : (
                      <span>
                        {typeof value === "number"
                          ? value.toLocaleString("ar-SA")
                          : String(value)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return <span className="text-slate-400">{String(data)}</span>;
};

const AuditDetailPanel: React.FC<AuditDetailPanelProps> = ({
  log,
  isOpen,
  onClose,
  onViewUserActivity,
  onViewEntityHistory,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["oldData", "newData"])
  );
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ إلى الحافظة");
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

  if (!log) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-800 border-l border-slate-700 z-50 overflow-y-auto"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  تفاصيل النشاط #{log.id}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                  <h3 className="text-slate-200 font-medium mb-3">معلومات النشاط</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">المستخدم</label>
                      <div className="flex items-center gap-2">
                        {log.username ? (
                          <button
                            onClick={() => log.userId && onViewUserActivity(log.userId)}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>{log.username}</span>
                          </button>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">العملية</label>
                      <span className="text-slate-200">{getActionLabel(log.action)}</span>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">الكيان</label>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-200">
                          {getEntityLabel(log.entity)}
                          {log.entityId && ` #${log.entityId}`}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">التاريخ والوقت</label>
                      <span className="text-slate-200">{formatDate(log.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {log.description && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <label className="text-sm text-slate-400 mb-2 block">الوصف</label>
                    <p className="text-slate-200">{log.description}</p>
                  </div>
                )}

                {/* DELETE: Show deleted data prominently */}
                {log.action === "DELETE" && log.oldData && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection("oldData")}
                      className="w-full flex items-center justify-between p-4 hover:bg-red-500/15 transition-colors"
                    >
                      <div>
                        <span className="text-red-400 font-medium block">بيانات العنصر المحذوف</span>
                        <span className="text-xs text-slate-400 mt-1">انقر لعرض كامل بيانات العنصر قبل الحذف</span>
                      </div>
                      {expandedSections.has("oldData") ? (
                        <ChevronDown className="h-5 w-5 text-red-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-red-400" />
                      )}
                    </button>
                    {expandedSections.has("oldData") && (
                      <div className="p-4 bg-slate-800/50 border-t border-red-500/20">
                        {renderDataAsTable(log.oldData)}
                      </div>
                    )}
                  </div>
                )}

                {/* Non-DELETE: Old Data */}
                {log.action !== "DELETE" && (
                  <div className="bg-slate-700/30 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection("oldData")}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <span className="text-slate-200 font-medium block">البيانات قبل العملية</span>
                        <span className="text-xs text-slate-400 mt-1">
                          {log.oldData ? "انقر لعرض التفاصيل" : "لا توجد بيانات قديمة (عملية إنشاء)"}
                        </span>
                      </div>
                      {log.oldData && (
                        expandedSections.has("oldData") ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )
                      )}
                    </button>
                    {log.oldData && expandedSections.has("oldData") && (
                      <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
                        {renderDataAsTable(log.oldData)}
                      </div>
                    )}
                  </div>
                )}

                {/* New Data */}
                {log.action !== "DELETE" && (
                  <div className="bg-slate-700/30 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection("newData")}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <span className="text-slate-200 font-medium block">البيانات بعد العملية</span>
                        <span className="text-xs text-slate-400 mt-1">
                          {log.newData ? "انقر لعرض التفاصيل" : "لا توجد بيانات جديدة"}
                        </span>
                      </div>
                      {log.newData && (
                        expandedSections.has("newData") ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )
                      )}
                    </button>
                    {log.newData && expandedSections.has("newData") && (
                      <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
                        {renderDataAsTable(log.newData)}
                      </div>
                    )}
                  </div>
                )}

                {/* Technical Info (Collapsible) */}
                <div className="bg-slate-700/30 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-200 font-medium">معلومات تقنية (للمطورين)</span>
                    </div>
                    {showTechnicalInfo ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                  {showTechnicalInfo && (
                    <div className="p-4 bg-slate-800/50 border-t border-slate-700/50 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-slate-400 mb-1 block">عنوان IP</label>
                          <span className="text-slate-200 font-mono text-xs">
                            {log.ipAddress || "—"}
                          </span>
                        </div>
                        <div>
                          <label className="text-slate-400 mb-1 block">المتصفح</label>
                          <span className="text-slate-200 text-xs truncate block" title={log.userAgent || ""}>
                            {log.userAgent || "—"}
                          </span>
                        </div>
                        <div>
                          <label className="text-slate-400 mb-1 block">نوع الطلب</label>
                          <span className="text-slate-200 font-mono text-xs">
                            {log.method || "—"}
                          </span>
                        </div>
                        <div>
                          <label className="text-slate-400 mb-1 block">المسار</label>
                          <span className="text-slate-200 font-mono text-xs">
                            {log.route || "—"}
                          </span>
                        </div>
                        <div>
                          <label className="text-slate-400 mb-1 block">كود الاستجابة</label>
                          <span className="text-slate-200">
                            {log.statusCode || "—"}
                          </span>
                        </div>
                        <div>
                          <label className="text-slate-400 mb-1 block">المدة</label>
                          <span className="text-slate-200">
                            {log.duration ? `${log.duration}ms` : "—"}
                          </span>
                        </div>
                      </div>
                      {log.metadata && (
                        <div>
                          <label className="text-slate-400 mb-2 block text-sm">بيانات إضافية</label>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(log.metadata, null, 2))}
                            className="mb-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            نسخ JSON
                          </button>
                          <pre className="text-xs text-slate-300 overflow-x-auto font-mono bg-slate-900/50 p-3 rounded">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                  {log.entityId && (
                    <button
                      onClick={() => onViewEntityHistory(log.entity, log.entityId!)}
                      className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      عرض تاريخ الكيان
                    </button>
                  )}
                  {log.userId && (
                    <button
                      onClick={() => onViewUserActivity(log.userId!)}
                      className="flex-1 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      عرض نشاط المستخدم
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuditDetailPanel;
