"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    Filter,
    X
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import SplineBackground from "@/components/common/SplineBackground";
import PageSpinner from "@/components/common/PageSpinner";
import { reportsService } from "@/services/reports.service";
import { REPORTS, CATEGORIES, getReportsByCategory } from "@/utils/reportsConfig";
import { ReportConfig, FilterValues, ReportCategory, FilterType } from "@/types/reports.type";

const ReportsPage = () => {
    const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<FilterValues>({});

    const handleReportSelect = (report: ReportConfig) => {
        setSelectedReport(report);
        setShowReportModal(true);
        setFilters({});
    };

    const handleFilterChange = (filterKey: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
    };

    const generateReport = async () => {
        if (!selectedReport) return;

        // Validate required filters
        const missingRequiredFilters = selectedReport.requiredFilters?.filter(
            filterKey => !filters[filterKey] || filters[filterKey] === ''
        ) || [];

        if (missingRequiredFilters.length > 0) {
            alert(`يرجى ملء الحقول المطلوبة: ${missingRequiredFilters.join(', ')}`);
            return;
        }

        setIsLoading(true);
        try {
            // Add download parameter
            const params = {
                ...filters,
                download: true
            };

            console.log('Generating report with params:', params);

            // Use the reports service to generate and download the report
            await reportsService.downloadReport(selectedReport.endpoint, params);

            // Close modal after successful download
            setShowReportModal(false);
        } catch (error) {
            console.error("Error generating report:", error);
            alert(`خطأ في تحميل التقرير: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderFilter = (filter: any) => {
        const value = filters[filter.key] || "";

        switch (filter.type) {
            case FilterType.TEXT:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                );

            case FilterType.NUMBER:
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                );

            case FilterType.DATE:
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                );

            case FilterType.SELECT:
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <option value="">اختر...</option>
                        {filter.options?.map((option: any) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case FilterType.MULTISELECT:
                return (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filter.options?.map((option: any) => {
                            const isSelected = Array.isArray(value) && value.includes(option.value);
                            return (
                                <label key={option.value} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                            const currentValues = Array.isArray(value) ? value : [];
                                            if (e.target.checked) {
                                                handleFilterChange(filter.key, [...currentValues, option.value]);
                                            } else {
                                                handleFilterChange(filter.key, currentValues.filter((v: any) => v !== option.value));
                                            }
                                        }}
                                        className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/30"
                                    />
                                    <span className="text-slate-300 text-sm">{option.label}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case FilterType.BOOLEAN:
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value === 'true')}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <option value="">اختر...</option>
                        <option value="true">نعم</option>
                        <option value="false">لا</option>
                    </select>
                );

            default:
                return null;
        }
    };

    // Group reports by category
    const reportsByCategory = CATEGORIES.map(category => ({
        ...category,
        reports: getReportsByCategory(category.id)
    })).filter(category => category.reports.length > 0);

    return (
        <div className="min-h-screen bg-slate-900 relative transition-colors duration-300">
            <SplineBackground activeTab="reports" />
            {isLoading && <PageSpinner />}

            <div className="relative z-10">
                <Navbar />
                <main className="py-16 p-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Page Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                التقارير والإحصائيات
                            </h1>
                            <p className="text-slate-400">
                                توليد تقارير شاملة ومفصلة لجميع أنشطة المؤسسة
                            </p>
                        </div>

                        {/* All Reports by Category */}
                        <div className="space-y-12">
                            {reportsByCategory.map((category, categoryIndex) => (
                                <div key={category.id} className="space-y-6">
                                    {/* Category Header */}
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                                        <div className={`p-2 bg-gradient-to-br ${category.color} rounded-lg border border-white/10`}>
                                            <span className="text-2xl">{category.icon}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">
                                                {category.name}
                                            </h2>
                                            <p className="text-slate-400 text-sm">
                                                {category.reports.length} تقرير متاح
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reports Grid for this Category */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {category.reports.map((report, reportIndex) => (
                                            <motion.div
                                                key={report.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: (categoryIndex * 0.1) + (reportIndex * 0.05) }}
                                                className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                                                onClick={() => handleReportSelect(report)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                        <span className="text-2xl">{report.icon}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-white mb-2">
                                                            {report.title}
                                                        </h3>
                                                        <p className="text-slate-400 text-sm leading-relaxed">
                                                            {report.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">
                                                        {report.filters.length} فلتر
                                                    </span>
                                                    <div className="flex items-center gap-2 text-blue-400">
                                                        <Download className="h-4 w-4" />
                                                        <span className="text-sm">توليد</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && selectedReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowReportModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                            dir="rtl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <span className="text-2xl">{selectedReport.icon}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            {selectedReport.title}
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Filter className="h-5 w-5 text-slate-400" />
                                    <h3 className="text-lg font-medium text-white">فلاتر التقرير</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedReport.filters.map((filter) => (
                                        <div key={filter.key} className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">
                                                {filter.label}
                                                {filter.required && <span className="text-red-400 mr-1">*</span>}
                                            </label>
                                            {renderFilter(filter)}
                                        </div>
                                    ))}
                                </div>

                                {/* Generate Button */}
                                <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                                    <div className="text-sm text-slate-400">
                                        {selectedReport.requiredFilters && selectedReport.requiredFilters.length > 0 && (
                                            <span>الحقول المطلوبة: {selectedReport.requiredFilters.join(', ')}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={generateReport}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                                جاري التوليد...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                توليد التقرير
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportsPage;