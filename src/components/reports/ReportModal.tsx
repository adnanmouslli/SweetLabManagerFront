import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Eye, Loader2 } from 'lucide-react';
import { ReportConfig, FilterValues } from '@/types/reports.type';
import ReportFilter from './ReportFilter';
import { useReports } from '@/hooks/reports/useReports';
import PageSpinner from '@/components/common/PageSpinner';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: ReportConfig | null;
    onGenerate: (reportId: string, filters: FilterValues) => void;
    onDownload: (reportId: string, filters: FilterValues) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    report,
    onGenerate,
    onDownload
}) => {
    const { modalState, updateFilters, validateFilters } = useReports();
    const [filters, setFilters] = useState<FilterValues>({});
    const [isValid, setIsValid] = useState(false);

    // Update local filters when modal state changes
    useEffect(() => {
        if (modalState.filters) {
            setFilters(modalState.filters);
        }
    }, [modalState.filters]);

    // Validate filters whenever they change
    useEffect(() => {
        if (report) {
            const valid = validateFilters(report, filters);
            setIsValid(valid);
        }
    }, [filters, report, validateFilters]);

    const handleFilterChange = (filterKey: string, value: any) => {
        const newFilters = { ...filters, [filterKey]: value };
        setFilters(newFilters);
        updateFilters(newFilters);
    };

    const handleGenerate = () => {
        if (report && isValid) {
            onGenerate(report.id, filters);
        }
    };

    const handleDownload = () => {
        if (report && isValid) {
            onDownload(report.id, filters);
        }
    };

    const handleClose = () => {
        setFilters({});
        onClose();
    };

    if (!report) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">{report.icon}</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-100">{report.title}</h2>
                                    <p className="text-slate-400 text-sm">إعدادات التقرير</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="space-y-6">
                                <p className="text-slate-300 leading-relaxed">
                                    {report.description}
                                </p>

                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-100 flex items-center space-x-2 rtl:space-x-reverse">
                                        <FileText className="w-5 h-5 text-primary" />
                                        <span>إعدادات التقرير</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {report.filters.map((filter) => (
                                            <ReportFilter
                                                key={filter.key}
                                                filter={filter}
                                                value={filters[filter.key]}
                                                onChange={(value) => handleFilterChange(filter.key, value)}
                                                options={filter.options}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/20">
                            <div className="text-sm text-slate-400">
                                {isValid ? (
                                    <span className="text-green-400">جميع الحقول المطلوبة مكتملة</span>
                                ) : (
                                    <span className="text-yellow-400">يرجى ملء جميع الحقول المطلوبة</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <button
                                    onClick={handleClose}
                                    disabled={modalState.isLoading}
                                    className="px-6 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!isValid || modalState.isLoading}
                                    className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 rtl:space-x-reverse"
                                >
                                    {modalState.isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>جاري الإنشاء...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            <span>معاينة التقرير</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={!isValid || modalState.isLoading}
                                    className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2 rtl:space-x-reverse"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>تحميل التقرير</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ReportModal;
