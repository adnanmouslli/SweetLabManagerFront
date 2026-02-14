"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { AuditLogQuery, ENTITIES, ACTIONS, HTTP_METHODS, getActionLabel, getEntityLabel } from "@/types/audit-logs.type";
import { useUsers } from "@/hooks/users/useUsers";

interface AuditFiltersProps {
  filters: AuditLogQuery;
  onFiltersChange: (filters: AuditLogQuery) => void;
}

const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: users } = useUsers();

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.entity) count++;
    if (filters.action) count++;
    if (filters.userId) count++;
    if (filters.method) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters]);

  // Filter actions based on selected entity
  const filteredActions = useMemo(() => {
    if (!filters.entity) return ACTIONS;
    // You can add logic here to filter actions based on entity
    return ACTIONS;
  }, [filters.entity]);

  const handleFilterChange = (key: keyof AuditLogQuery, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    });
  };

  const removeFilter = (key: keyof AuditLogQuery) => {
    handleFilterChange(key, undefined);
  };

  // Debounced search
  const [searchValue, setSearchValue] = useState(filters.search || "");
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        handleFilterChange("search", searchValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 mb-6" dir="rtl">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <span className="text-slate-200 font-medium">الفلاتر المتقدمة</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </div>

      {/* Filters Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Active Filters Chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-700/50">
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      بحث: {filters.search}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter("search");
                          setSearchValue("");
                        }}
                        className="hover:text-blue-300"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.entity && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      كيان: {getEntityLabel(filters.entity)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter("entity");
                        }}
                        className="hover:text-blue-300"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.action && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      عملية: {getActionLabel(filters.action)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter("action");
                        }}
                        className="hover:text-blue-300"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.userId && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      مستخدم: {users?.find((u) => u.id === filters.userId)?.username || filters.userId}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter("userId");
                        }}
                        className="hover:text-blue-300"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.method && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      طريقة: {filters.method}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter("method");
                        }}
                        className="hover:text-blue-300"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(filters.startDate || filters.endDate) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      تاريخ: {filters.startDate || "..."} - {filters.endDate || "..."}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter("startDate");
                          removeFilter("endDate");
                        }}
                        className="hover:text-blue-300"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Filter Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="بحث (الوصف، المسار، اسم المستخدم)"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full pl-4 pr-12 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Entity */}
                <select
                  value={filters.entity || ""}
                  onChange={(e) => handleFilterChange("entity", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">جميع الكيانات</option>
                  {ENTITIES.map((entity) => (
                    <option key={entity} value={entity}>
                      {getEntityLabel(entity)}
                    </option>
                  ))}
                </select>

                {/* Action */}
                <select
                  value={filters.action || ""}
                  onChange={(e) => handleFilterChange("action", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">جميع العمليات</option>
                  {filteredActions.map((action) => (
                    <option key={action} value={action}>
                      {getActionLabel(action)}
                    </option>
                  ))}
                </select>

                {/* User */}
                <select
                  value={filters.userId || ""}
                  onChange={(e) =>
                    handleFilterChange("userId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">جميع المستخدمين</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>

                {/* HTTP Method */}
                <select
                  value={filters.method || ""}
                  onChange={(e) => handleFilterChange("method", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">جميع الطرق</option>
                  {HTTP_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>

                {/* Start Date */}
                <input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500/50"
                />

                {/* End Date */}
                <input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  min={filters.startDate || undefined}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500/50"
                />

                {/* Sort By */}
                <select
                  value={filters.sortBy || "createdAt"}
                  onChange={(e) =>
                    handleFilterChange("sortBy", e.target.value as AuditLogQuery["sortBy"])
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="createdAt">التاريخ</option>
                  <option value="action">العملية</option>
                  <option value="entity">الكيان</option>
                  <option value="userId">المستخدم</option>
                </select>

                {/* Sort Order */}
                <select
                  value={filters.sortOrder || "desc"}
                  onChange={(e) =>
                    handleFilterChange("sortOrder", e.target.value as "asc" | "desc")
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="desc">تنازلي</option>
                  <option value="asc">تصاعدي</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    مسح الفلاتر
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditFilters;
