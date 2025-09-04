'use client';

import { useMemo, useState, useCallback } from 'react';

import Navbar from '@/components/common/Navbar';
import PageSpinner from '@/components/common/PageSpinner';
import SplineBackground from '@/components/common/SplineBackground';
import ReportCard from '@/components/reports/ReportCard';
import ReportModal from '@/components/reports/ReportModal';
import ReportPreview from '@/components/reports/ReportPreview';
import { useReports } from '@/hooks/reports/useReports';
import { useReportsData } from '@/hooks/reports/useReportsData';
import { ReportConfig, ReportGenerationResult, ReportCategory } from '@/types/reports.type';
import { CATEGORIES, generateReportsConfig } from '@/utils/reportsConfig';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BarChart3,
    FileText,
    Filter,
    Search,
    Sparkles,
    Grid3X3,
    List,
    SortAsc,
    SortDesc,
    Clock,
    Star,
    TrendingUp,
    Zap,
    X,
    ChevronDown,
    Eye,
    Download
} from 'lucide-react';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
};

const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

// Sort options
const SORT_OPTIONS = [
    { value: 'name-asc', label: 'الاسم (أ-ي)', icon: SortAsc },
    { value: 'name-desc', label: 'الاسم (ي-أ)', icon: SortDesc },
    { value: 'category', label: 'الفئة', icon: Filter },
    { value: 'complexity', label: 'التعقيد', icon: TrendingUp },
    { value: 'recent', label: 'الأحدث', icon: Clock },
];

// View modes
const VIEW_MODES = {
    GRID: 'grid',
    LIST: 'list',
} as const;

type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

const ReportsPage = () => {
    const {
        modalState,
        openReportModal,
        closeReportModal,
        generateReport,
        downloadReport,
        isLoading
    } = useReports();

    const {
        customerOptions,
        customerCategoryOptions,
        itemOptions,
        itemGroupOptions,
        debtOptions,
        shiftOptions,
        isLoading: dataLoading
    } = useReportsData();

    const [previewResult, setPreviewResult] = useState<ReportGenerationResult | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('name-asc');
    const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.GRID);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [recentReports, setRecentReports] = useState<Set<string>>(new Set());

    // Generate reports configuration with real data
    const reports = useMemo(() => {
        return generateReportsConfig({
            customerOptions,
            customerCategoryOptions,
            itemOptions,
            itemGroupOptions,
            debtOptions,
            shiftOptions
        });
    }, [customerOptions, customerCategoryOptions, itemOptions, itemGroupOptions, debtOptions, shiftOptions]);

    // Filter and sort reports
    const filteredAndSortedReports = useMemo(() => {
        let filtered = reports;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(report =>
                report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(report => report.category === selectedCategory);
        }

        // Sort reports
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.title.localeCompare(b.title, 'ar');
                case 'name-desc':
                    return b.title.localeCompare(a.title, 'ar');
                case 'category':
                    return a.category.localeCompare(b.category, 'ar');
                case 'complexity':
                    return b.filters.length - a.filters.length;
                case 'recent':
                    return recentReports.has(b.id) ? 1 : recentReports.has(a.id) ? -1 : 0;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [reports, searchTerm, selectedCategory, sortBy, recentReports]);

    // Get active filters for display
    const activeFilters = useMemo(() => {
        const filters = [];
        if (searchTerm) filters.push({ key: 'search', label: `البحث: "${searchTerm}"` });
        if (selectedCategory) {
            const category = CATEGORIES.find(cat => cat.id === selectedCategory);
            if (category) filters.push({ key: 'category', label: `الفئة: ${category.name}` });
        }
        return filters;
    }, [searchTerm, selectedCategory]);

    // Handler functions
    const handleOpenReport = useCallback((report: ReportConfig) => {
        // Add to recent reports
        setRecentReports(prev => new Set([report.id, ...Array.from(prev).slice(0, 9)]));
        openReportModal(report);
    }, [openReportModal]);

    const handleGenerateReport = async (reportId: string, filters: any) => {
        const result = await generateReport(reportId, filters);
        if (result.success) {
            setPreviewResult(result);
            setShowPreview(true);
        }
    };

    const handleDownloadReport = async (reportId: string, filters: any) => {
        await downloadReport(reportId, filters);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setPreviewResult(null);
    };

    const handleToggleFavorite = useCallback((reportId: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(reportId)) {
                newFavorites.delete(reportId);
            } else {
                newFavorites.add(reportId);
            }
            return newFavorites;
        });
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedCategory(null);
    }, []);

    const handleRemoveFilter = useCallback((filterKey: string) => {
        if (filterKey === 'search') setSearchTerm('');
        if (filterKey === 'category') setSelectedCategory(null);
    }, []);

    const getCategoryColor = useCallback((category: ReportCategory) => {
        const colors = {
            [ReportCategory.ORDERS]: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
            [ReportCategory.WAREHOUSE]: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
            [ReportCategory.BOOTH]: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
            [ReportCategory.ITEMS]: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
            [ReportCategory.DEBTS]: 'from-red-500/20 to-red-600/10 border-red-500/30',
            [ReportCategory.PRODUCTS]: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
            [ReportCategory.FUNDS]: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
            [ReportCategory.SHIFTS]: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
            [ReportCategory.CUSTOMERS]: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
            [ReportCategory.SALES]: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
        };
        return colors[category] || 'from-gray-500/20 to-gray-600/10 border-gray-500/30';
    }, []);

    const getCategoryName = useCallback((category: ReportCategory) => {
        const categoryObj = CATEGORIES.find(cat => cat.id === category);
        return categoryObj?.name || category;
    }, []);

    if (isLoading || dataLoading) {
        return (
            <div className="min-h-screen bg-background relative">
                <SplineBackground activeTab="reports" />
                <div className="flex items-center justify-center min-h-screen">
                    <PageSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative transition-colors duration-300">
            <SplineBackground activeTab="reports" />
            <div className="relative z-10">
                <Navbar />
                <main className="py-16 p-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Unified Reports Grid */}
                        <motion.div
                            variants={gridVariants}
                            initial="hidden"
                            animate="visible"
                            className="mb-12"
                        >
                            {filteredAndSortedReports.length > 0 ? (
                                <div className={`grid gap-6 ${viewMode === VIEW_MODES.GRID
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    : 'grid-cols-1'
                                    }`}>
                                    {filteredAndSortedReports.map((report, index) => (
                                        <motion.div
                                            key={report.id}
                                            variants={itemVariants}
                                            layout
                                            className="group"
                                        >
                                            <div className="relative">
                                                <ReportCard
                                                    report={report}
                                                    onOpen={handleOpenReport}
                                                    onToggleFavorite={handleToggleFavorite}
                                                    isFavorite={favorites.has(report.id)}
                                                    isRecent={recentReports.has(report.id)}
                                                    categoryColor={getCategoryColor(report.category)}
                                                    categoryName={getCategoryName(report.category)}
                                                    viewMode={viewMode}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <Search className="w-16 h-16 text-slate-400" />
                                    </div>
                                    <h3 className="text-3xl font-semibold text-slate-100 mb-4">
                                        لم يتم العثور على تقارير
                                    </h3>
                                    <p className="text-slate-400 mb-8 text-lg">
                                        جرب البحث بكلمات مختلفة أو اختر فئة أخرى
                                    </p>
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg font-semibold shadow-xl"
                                    >
                                        إعادة تعيين الفلاتر
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Report Modal */}
                        <AnimatePresence>
                            <ReportModal
                                isOpen={modalState.isOpen}
                                onClose={closeReportModal}
                                report={modalState.selectedReport}
                                onGenerate={handleGenerateReport}
                                onDownload={handleDownloadReport}
                            />
                        </AnimatePresence>

                        {/* Report Preview */}
                        <AnimatePresence>
                            {showPreview && (
                                <ReportPreview
                                    result={previewResult}
                                    onClose={handleClosePreview}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReportsPage;