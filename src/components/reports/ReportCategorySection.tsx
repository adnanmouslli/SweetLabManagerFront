import React from 'react';
import { motion } from 'framer-motion';
import { ReportConfig, ReportCategory } from '@/types/reports.type';
import ReportCard from './ReportCard';

interface ReportCategorySectionProps {
    category: {
        id: ReportCategory;
        name: string;
        icon: string;
        color: string;
    };
    reports: ReportConfig[];
    onOpenReport: (report: ReportConfig) => void;
}

const ReportCategorySection: React.FC<ReportCategorySectionProps> = ({
    category,
    reports,
    onOpenReport
}) => {
    if (reports.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
        >
            {/* Category Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className={`bg-gradient-to-r ${category.color} rounded-2xl p-6 border border-border/50`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">{category.icon}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-1">
                                    {category.name}
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    {reports.length} تقرير متاح
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/20 text-foreground px-4 py-2 rounded-xl text-sm font-medium">
                            {reports.length}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Reports Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {reports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                    >
                        <ReportCard
                            report={report}
                            onOpen={onOpenReport}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default ReportCategorySection;
