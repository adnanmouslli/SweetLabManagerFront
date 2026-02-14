"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Clock } from "lucide-react";
import { AuditLog, getActionLabel, getEntityLabel, getActionColor } from "@/types/audit-logs.type";

interface UserActivityPanelProps {
  userId: number;
  username: string;
  logs: AuditLog[];
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onViewDetail: (log: AuditLog) => void;
  onViewEntityHistory: (entity: string, entityId: number) => void;
}

const UserActivityPanel: React.FC<UserActivityPanelProps> = ({
  userId,
  username,
  logs,
  isLoading,
  isOpen,
  onClose,
  onViewDetail,
  onViewEntityHistory,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

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
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-800 border-l border-slate-700 z-50 overflow-y-auto"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">نشاط المستخدم</h2>
                    <p className="text-sm text-slate-400">{username}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Timeline */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-700/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">لا توجد أنشطة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log, index) => {
                    const actionColor = getActionColor(log.action);
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-8 border-r-2 border-slate-700 pb-4 last:border-r-0 last:pb-0"
                      >
                        <div className="absolute -right-2 top-0 w-4 h-4 bg-slate-700 rounded-full border-2 border-slate-800"></div>
                        <div className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                            </div>
                            <button
                              onClick={() => onViewDetail(log)}
                              className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                              عرض التفاصيل
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: actionColor.bg,
                                color: actionColor.text,
                              }}
                            >
                              {getActionLabel(log.action)}
                            </span>
                            <span className="text-slate-300 text-sm">
                              {getEntityLabel(log.entity)}
                              {log.entityId && ` #${log.entityId}`}
                            </span>
                          </div>
                          {log.description && (
                            <p className="text-slate-400 text-sm">{log.description}</p>
                          )}
                          {log.entityId && (
                            <button
                              onClick={() => onViewEntityHistory(log.entity, log.entityId!)}
                              className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                            >
                              عرض تاريخ الكيان →
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserActivityPanel;
