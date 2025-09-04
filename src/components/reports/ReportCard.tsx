import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Filter,
    ArrowLeft,
    Star,
    Clock,
    Eye,
    Download,
    Zap,
    TrendingUp,
    X
} from 'lucide-react';
import { ReportConfig } from '@/types/reports.type';

interface ReportCardProps {
    report: ReportConfig;
    onOpen: (report: ReportConfig) => void;
    onToggleFavorite?: (reportId: string) => void;
    isFavorite?: boolean;
    isRecent?: boolean;
    categoryColor?: string;
    categoryName?: string;
    viewMode?: 'grid' | 'list';
}

const ReportCard: React.FC<ReportCardProps> = ({
    report,
    onOpen,
    onToggleFavorite,
    isFavorite = false,
    isRecent = false,
    categoryColor = 'from-gray-500/20 to-gray-600/10 border-gray-500/30',
    categoryName = '',
    viewMode = 'grid'
}) => {
    const requiredFilters = report.requiredFilters?.length || 0;
    const totalFilters = report.filters.length;
    const complexity = totalFilters > 8 ? 'high' : totalFilters > 4 ? 'medium' : 'low';

    const getComplexityColor = (level: string) => {
        switch (level) {
            case 'high': return 'text-red-400 bg-red-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'low': return 'text-green-400 bg-green-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getComplexityLabel = (level: string) => {
        switch (level) {
            case 'high': return 'معقد';
            case 'medium': return 'متوسط';
            case 'low': return 'بسيط';
            default: return 'غير محدد';
        }
    };

    if (viewMode === 'list') {
        return (
            <motion.div
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 p-6 cursor-pointer hover:shadow-xl hover:shadow-blue-500/10"
                onClick={() => onOpen(report)}
            >
                <div className="flex items-center space-x-6 rtl:space-x-reverse">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className={`w-16 h-16 bg-gradient-to-br ${categoryColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-3xl">{report.icon}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors duration-200">
                                    {report.title}
                                </h3>
                                <p className="text-slate-400 text-sm mb-3">
                                    {report.description}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                {onToggleFavorite && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleFavorite(report.id);
                                        }}
                                        className={`p-2 rounded-xl transition-all duration-200 ${isFavorite
                                            ? 'text-yellow-400 bg-yellow-500/20'
                                            : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                                            }`}
                                    >
                                        <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                    </button>
                                )}

                                <div className="flex items-center space-x-1 rtl:space-x-reverse text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm font-medium">معاينة</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                {/* Category Badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColor}`}>
                                    {categoryName}
                                </span>

                                {/* Complexity Badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getComplexityColor(complexity)}`}>
                                    {getComplexityLabel(complexity)}
                                </span>

                                {/* Filters Count */}
                                <div className="flex items-center space-x-1 rtl:space-x-reverse text-slate-400">
                                    <Filter className="w-4 h-4" />
                                    <span className="text-sm">{totalFilters} فلتر</span>
                                </div>
                            </div>

                            {/* Status Indicators */}
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                {isRecent && (
                                    <div className="flex items-center space-x-1 rtl:space-x-reverse text-orange-400">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs">حديث</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 p-6 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden"
            onClick={() => onOpen(report)}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

            {/* Top Section */}
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${categoryColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <span className="text-3xl">{report.icon}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {onToggleFavorite && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(report.id);
                                }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isFavorite
                                    ? 'text-yellow-400 bg-yellow-500/20 scale-110'
                                    : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 hover:scale-110'
                                    }`}
                            >
                                <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Title and Description */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                        {report.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                        {report.description}
                    </p>
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${categoryColor} border border-current/20 text-white`}>
                        {categoryName}
                    </span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        {/* Complexity */}
                        <div className={`flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-lg ${getComplexityColor(complexity)}`}>
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-xs font-medium">{getComplexityLabel(complexity)}</span>
                        </div>

                        {/* Filters Count */}
                        <div className="flex items-center space-x-1 rtl:space-x-reverse text-slate-400">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">{totalFilters}</span>
                        </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {isRecent && (
                            <div className="flex items-center space-x-1 rtl:space-x-reverse text-orange-400">
                                <Clock className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>التقدم</span>
                        <span>{requiredFilters}/{totalFilters}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(requiredFilters / totalFilters) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">إنشاء التقرير</span>
                    <ArrowLeft className="w-4 h-4" />
                </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
        </motion.div>
    );
};

export default ReportCard;
