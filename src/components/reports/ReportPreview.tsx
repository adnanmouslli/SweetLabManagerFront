import React from 'react';
import { ReportGenerationResult } from '@/types/reports.type';

interface ReportPreviewProps {
    result: ReportGenerationResult | null;
    onClose: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ result, onClose }) => {
    if (!result) return null;

    if (!result.success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">❌</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            فشل في إنشاء التقرير
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {result.error || 'حدث خطأ غير متوقع'}
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        معاينة التقرير
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {result.content ? (
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: result.content }}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">📄</div>
                            <p className="text-gray-600">لا يوجد محتوى للعرض</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 rtl:space-x-reverse p-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        إغلاق
                    </button>
                    {result.filename && (
                        <button
                            onClick={() => {
                                // Trigger download
                                const blob = new Blob([result.content || ''], { type: 'text/html' });
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = result.filename || 'report.html';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            تحميل
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportPreview;
