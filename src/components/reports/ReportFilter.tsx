import React from 'react';
import { ReportFilterConfig, FilterValues, FilterType } from '@/types/reports.type';

interface ReportFilterProps {
    filter: ReportFilterConfig;
    value: any;
    onChange: (value: any) => void;
    options?: Array<{ value: any; label: string }>;
}

const ReportFilter: React.FC<ReportFilterProps> = ({ filter, value, onChange, options = [] }) => {
    const renderInput = () => {
        switch (filter.type) {
            case FilterType.TEXT:
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={filter.placeholder || `أدخل ${filter.label}`}
                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                        dir="rtl"
                    />
                );

            case FilterType.NUMBER:
                return (
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                        placeholder={filter.placeholder || `أدخل ${filter.label}`}
                        min={filter.min}
                        max={filter.max}
                        step={filter.step}
                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                        dir="rtl"
                    />
                );

            case FilterType.DATE:
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                        dir="rtl"
                    />
                );

            case FilterType.SELECT:
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                        dir="rtl"
                    >
                        <option value="">اختر {filter.label}</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case FilterType.MULTISELECT:
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <div className="space-y-3">
                        {/* Selected items as tags */}
                        {selectedValues.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedValues.map((selectedValue) => {
                                    // Handle both string and number comparisons
                                    const option = options.find(opt =>
                                        opt.value === selectedValue ||
                                        opt.value === String(selectedValue) ||
                                        opt.value === Number(selectedValue)
                                    );

                                    return (
                                        <span
                                            key={selectedValue}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        >
                                            {option?.label || `Item ${selectedValue}`}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newValues = selectedValues.filter(v => v !== selectedValue);
                                                    onChange(newValues);
                                                }}
                                                className="mr-2 hover:text-blue-100"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        {/* Dropdown select */}
                        <select
                            value=""
                            onChange={(e) => {
                                if (e.target.value) {
                                    // Convert to number if the original value is a number
                                    const newValue = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);

                                    // Check if not already selected (handle both string and number comparisons)
                                    const isAlreadySelected = selectedValues.some(val =>
                                        val === newValue ||
                                        val === String(newValue) ||
                                        val === Number(newValue)
                                    );

                                    if (!isAlreadySelected) {
                                        onChange([...selectedValues, newValue]);
                                    }
                                }
                                e.target.value = "";
                            }}
                            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                            dir="rtl"
                        >
                            <option value="" disabled>اختر {filter.label}</option>
                            {options
                                .filter(option => {
                                    // Handle both string and number comparisons for filtering
                                    return !selectedValues.some(val =>
                                        val === option.value ||
                                        val === String(option.value) ||
                                        val === Number(option.value)
                                    );
                                })
                                .map((option) => (
                                    <option key={option.value} value={option.value} className="text-slate-100 bg-slate-900">
                                        {option.label}
                                    </option>
                                ))}
                        </select>
                    </div>
                );

            case FilterType.BOOLEAN:
                return (
                    <div className="flex space-x-6 rtl:space-x-reverse">
                        <label className="flex items-center space-x-2 rtl:space-x-reverse p-3 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <input
                                type="radio"
                                name={filter.key}
                                value="true"
                                checked={value === true}
                                onChange={() => onChange(true)}
                                className="h-4 w-4 text-blue-500 focus:ring-blue-500/50 border-slate-600"
                            />
                            <span className="text-sm text-slate-100">نعم</span>
                        </label>
                        <label className="flex items-center space-x-2 rtl:space-x-reverse p-3 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <input
                                type="radio"
                                name={filter.key}
                                value="false"
                                checked={value === false}
                                onChange={() => onChange(false)}
                                className="h-4 w-4 text-blue-500 focus:ring-blue-500/50 border-slate-600"
                            />
                            <span className="text-sm text-slate-100">لا</span>
                        </label>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-100">
                {filter.label}
                {filter.required && <span className="text-red-400 mr-1">*</span>}
            </label>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
                {renderInput()}
            </div>
        </div>
    );
};

export default ReportFilter;
