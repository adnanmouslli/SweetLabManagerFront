"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  LogIn,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import PageSpinner from "@/components/common/PageSpinner";
import SplineBackground from "@/components/common/SplineBackground";
import AuditSummaryCards from "@/components/audit-logs/AuditSummaryCards";
import AuditFilters from "@/components/audit-logs/AuditFilters";
import AuditTable from "@/components/audit-logs/AuditTable";
import AuditDetailPanel from "@/components/audit-logs/AuditDetailPanel";
import UserActivityPanel from "@/components/audit-logs/UserActivityPanel";
import EntityHistoryPanel from "@/components/audit-logs/EntityHistoryPanel";
import { useAuditLogs, useAuditSummary, useUserActivity, useEntityHistory } from "@/hooks/audit-logs/useAuditLogs";
import { AuditLogQuery, AuditLog } from "@/types/audit-logs.type";
import { useUsers } from "@/hooks/users/useUsers";
import { Role, useRoles } from "@/hooks/users/useRoles";
import toast from "react-hot-toast";

const AuditLogsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasRole } = useRoles();
  const { data: users } = useUsers();

  // Check authorization
  const isAuthorized = hasRole(Role.SUPER_ADMIN);
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background relative">
        <SplineBackground activeTab="audit-logs" />
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">غير مصرح</h2>
              <p className="text-slate-400">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<AuditLogQuery>(() => {
    const params: AuditLogQuery = {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
      sortBy: (searchParams.get("sortBy") as AuditLogQuery["sortBy"]) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    if (searchParams.get("search")) params.search = searchParams.get("search")!;
    if (searchParams.get("entity")) params.entity = searchParams.get("entity")!;
    if (searchParams.get("action")) params.action = searchParams.get("action")!;
    if (searchParams.get("userId")) params.userId = Number(searchParams.get("userId"));
    if (searchParams.get("method")) params.method = searchParams.get("method")!;
    if (searchParams.get("startDate")) params.startDate = searchParams.get("startDate")!;
    if (searchParams.get("endDate")) params.endDate = searchParams.get("endDate")!;

    return params;
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    router.replace(`/audit-logs?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  // Fetch data
  const { data: auditLogsData, isLoading, refetch } = useAuditLogs(filters);
  const { data: summary, isLoading: summaryLoading } = useAuditSummary(
    filters.startDate,
    filters.endDate
  );

  // Panel states
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{ entity: string; entityId: number } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // User activity and entity history queries
  const { data: userActivity, isLoading: userActivityLoading } = useUserActivity(
    selectedUserId || 0,
    50,
    !!selectedUserId
  );
  const { data: entityHistory, isLoading: entityHistoryLoading } = useEntityHistory(
    selectedEntity?.entity || "",
    selectedEntity?.entityId || 0,
    !!selectedEntity
  );

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetch();
      setLastRefresh(new Date());
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Get selected user's username
  const selectedUsername = useMemo(() => {
    if (!selectedUserId) return "";
    return users?.find((u) => u.id === selectedUserId)?.username || "";
  }, [selectedUserId, users]);

  // Quick filter presets
  const applyQuickFilter = (preset: string) => {
    const today = new Date().toISOString().split("T")[0];
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    switch (preset) {
      case "deletes":
        setFilters({ ...filters, action: "DELETE", page: 1 });
        break;
      case "failed":
        setFilters({ ...filters, search: "FAILED_", page: 1 });
        break;
      case "logins":
        setFilters({ ...filters, action: "LOGIN", entity: "Auth", page: 1 });
        break;
      case "financial":
        setFilters({ ...filters, action: "PAY", page: 1 });
        break;
      case "today":
        setFilters({ ...filters, startDate: today, endDate: today, page: 1 });
        break;
      case "lastHour":
        setFilters({ ...filters, startDate: oneHourAgo.split("T")[0], page: 1 });
        break;
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!auditLogsData?.data) return;

    const headers = [
      "ID",
      "التاريخ",
      "المستخدم",
      "العملية",
      "الكيان",
      "معرّف الكيان",
      "الوصف",
      "IP",
      "المدة (ms)",
      "كود الاستجابة",
    ];

    const rows = auditLogsData.data.map((log) => [
      log.id,
      new Date(log.createdAt).toLocaleString("ar-SA"),
      log.username || "",
      log.action,
      log.entity,
      log.entityId || "",
      log.description || "",
      log.ipAddress || "",
      log.duration || "",
      log.statusCode || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("تم تصدير البيانات");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        // Focus search input (handled by filters component)
      }
      if (e.key === "Escape") {
        setSelectedLog(null);
        setSelectedUserId(null);
        setSelectedEntity(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRelativeTime = (date: Date): string => {
    const diffMs = Date.now() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `منذ ${diffSecs} ثانية`;
    const diffMins = Math.floor(diffSecs / 60);
    return `منذ ${diffMins} دقيقة`;
  };

  if (isLoading && !auditLogsData) {
    return (
      <div className="min-h-screen bg-background relative">
        <SplineBackground activeTab="audit-logs" />
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <PageSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      <SplineBackground activeTab="audit-logs" />
      <div className="relative z-10">
        <Navbar />
        <main className="py-16 p-4" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">سجل المراقبة والتدقيق</h1>
                  <p className="text-slate-400">مراقبة جميع أنشطة المستخدمين في النظام</p>
                </div>
                <div className="flex items-center gap-3">
                  {autoRefresh && (
                    <div className="text-xs text-slate-400">
                      تم التحديث {getRelativeTime(lastRefresh)}
                    </div>
                  )}
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded-lg transition-colors ${
                      autoRefresh
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-slate-700/50 text-slate-400"
                    }`}
                    title={autoRefresh ? "إيقاف التحديث التلقائي" : "تفعيل التحديث التلقائي"}
                  >
                    <RefreshCw className={`h-5 w-5 ${autoRefresh ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => {
                      refetch();
                      setLastRefresh(new Date());
                    }}
                    className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    title="تحديث"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    title="تصدير CSV"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Quick Filter Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => applyQuickFilter("deletes")}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  عمليات الحذف
                </button>
                <button
                  onClick={() => applyQuickFilter("failed")}
                  className="px-3 py-1.5 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/30 transition-colors text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  العمليات الفاشلة
                </button>
                <button
                  onClick={() => applyQuickFilter("logins")}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  تسجيلات الدخول
                </button>
                <button
                  onClick={() => applyQuickFilter("financial")}
                  className="px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors text-sm flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  العمليات المالية
                </button>
                <button
                  onClick={() => applyQuickFilter("today")}
                  className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  نشاط اليوم
                </button>
                <button
                  onClick={() => applyQuickFilter("lastHour")}
                  className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  آخر ساعة
                </button>
              </div>
            </motion.div>

            {/* Summary Cards */}
            <AuditSummaryCards summary={summary || []} isLoading={summaryLoading} />

            {/* Filters */}
            <AuditFilters filters={filters} onFiltersChange={setFilters} />

            {/* Table */}
            <AuditTable
              logs={auditLogsData?.data || []}
              isLoading={isLoading}
              currentPage={filters.page || 1}
              pageSize={filters.limit || 20}
              total={auditLogsData?.pagination.total || 0}
              onPageChange={(page) => setFilters({ ...filters, page })}
              onPageSizeChange={(size) => setFilters({ ...filters, limit: size, page: 1 })}
              onViewDetail={setSelectedLog}
              onViewUserActivity={(userId) => setSelectedUserId(userId)}
              onViewEntityHistory={(entity, entityId) =>
                setSelectedEntity({ entity, entityId })
              }
              onSort={(field, order) =>
                setFilters({ ...filters, sortBy: field as any, sortOrder: order })
              }
            />
          </div>
        </main>

        {/* Detail Panel */}
        <AuditDetailPanel
          log={selectedLog}
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          onViewUserActivity={(userId) => {
            setSelectedLog(null);
            setSelectedUserId(userId);
          }}
          onViewEntityHistory={(entity, entityId) => {
            setSelectedLog(null);
            setSelectedEntity({ entity, entityId });
          }}
        />

        {/* User Activity Panel */}
        <UserActivityPanel
          userId={selectedUserId || 0}
          username={selectedUsername}
          logs={userActivity || []}
          isLoading={userActivityLoading}
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onViewDetail={setSelectedLog}
          onViewEntityHistory={(entity, entityId) => {
            setSelectedUserId(null);
            setSelectedEntity({ entity, entityId });
          }}
        />

        {/* Entity History Panel */}
        <EntityHistoryPanel
          entity={selectedEntity?.entity || ""}
          entityId={selectedEntity?.entityId || 0}
          logs={entityHistory || []}
          isLoading={entityHistoryLoading}
          isOpen={!!selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onViewDetail={setSelectedLog}
          onViewUserActivity={(userId) => {
            setSelectedEntity(null);
            setSelectedUserId(userId);
          }}
        />
      </div>
    </div>
  );
};

export default AuditLogsPage;
