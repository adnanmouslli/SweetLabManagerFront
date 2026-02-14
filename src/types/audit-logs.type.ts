// Audit Logs TypeScript Types

export interface AuditLog {
  id: number;
  userId: number | null;
  username: string | null;
  action: string;
  entity: string;
  entityId: number | null;
  description: string | null;
  oldData: any | null;
  newData: any | null;
  metadata: {
    requestBody?: any;
    routeParams?: Record<string, string>;
    queryParams?: Record<string, string>;
    error?: string;
  } | null;
  ipAddress: string | null;
  userAgent: string | null;
  method: string | null;
  route: string | null;
  statusCode: number | null;
  duration: number | null;
  createdAt: string; // ISO date string
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditSummary {
  action: string;
  entity: string;
  count: number;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  entity?: string;
  entityId?: number;
  method?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  search?: string;
  sortBy?: 'createdAt' | 'action' | 'entity' | 'userId';
  sortOrder?: 'asc' | 'desc';
}

// Constants for entities and actions
export const ENTITIES = [
  'Auth',
  'User',
  'Customer',
  'Invoice',
  'Shift',
  'Debt',
  'Item',
  'ItemGroup',
  'Order',
  'OrderItem',
  'OrderCategory',
  'Fund',
  'Advance',
  'Employee',
  'Workshop',
  'CustomerCategory',
  'TrayTracking',
  'System',
] as const;

export const ACTIONS = [
  // General CRUD
  'CREATE',
  'UPDATE',
  'DELETE',
  // Auth
  'LOGIN',
  // Invoice-specific
  'PAY',
  'CONVERT_TO_DEBT',
  'CONVERT_TO_BREAK',
  'TRANSFER_BOOTH_UNIVERSITY_TO_GENERAL',
  'REQUEST_TRANSFER_TO_MAIN',
  'CONFIRM_TRANSFER_TO_MAIN',
  'PERFORM_AUDIT',
  // Shift-specific
  'CLOSE',
  'PARTIAL_CLOSE',
  'COMPLETE_CLOSURE',
  // Debt-specific
  'APPLY_DISCOUNT',
  // Item Group
  'IMPORT_EXCEL',
  // Order-specific
  'CONVERT_TO_INVOICE',
  'STATUS_CHANGE',
  'CANCEL',
  // Fund-specific
  'UPDATE_BALANCE',
  'TRANSFER_TO_MAIN',
  'CREATE_PENDING_TRANSFER',
  'HANDLE_PENDING_TRANSFER',
  // Advance-specific
  'REPAY',
  // Employee-specific
  'ADD_WITHDRAWAL',
  'ADD_PAYMENT',
  'ADD_PRODUCTION',
  'ADD_HOURS',
  // Workshop-specific
  'VERIFY_PASSWORD',
  'SETTLEMENT',
  'UPDATE_PRODUCTION',
  'DELETE_PRODUCTION',
  'UPDATE_HOURS',
  'DELETE_HOURS',
  'ADD_EMPLOYEE',
  'REMOVE_EMPLOYEE',
  // Customer Category
  'IMPORT_CUSTOMERS_EXCEL',
  'IMPORT_SUPPLIERS_EXCEL',
  // Tray
  'RETURN_TRAYS',
  // Backup
  'BACKUP',
  // Failed operations
  'FAILED_CREATE',
  'FAILED_DELETE',
  'FAILED_UPDATE',
  'FAILED_LOGIN',
] as const;

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

// Action labels in Arabic
export const ACTION_LABELS: Record<string, string> = {
  CREATE: 'إنشاء',
  UPDATE: 'تعديل',
  DELETE: 'حذف',
  LOGIN: 'تسجيل دخول',
  PAY: 'دفع',
  CONVERT_TO_DEBT: 'تحويل إلى دين',
  CONVERT_TO_BREAK: 'تحويل إلى كسر',
  TRANSFER_BOOTH_UNIVERSITY_TO_GENERAL: 'تحويل من بوث/جامعة إلى عام',
  REQUEST_TRANSFER_TO_MAIN: 'طلب تحويل للصندوق الرئيسي',
  CONFIRM_TRANSFER_TO_MAIN: 'تأكيد تحويل للصندوق الرئيسي',
  PERFORM_AUDIT: 'إجراء تدقيق',
  CLOSE: 'إغلاق',
  PARTIAL_CLOSE: 'إغلاق جزئي',
  COMPLETE_CLOSURE: 'إغلاق كامل',
  APPLY_DISCOUNT: 'تطبيق خصم',
  IMPORT_EXCEL: 'استيراد من Excel',
  CONVERT_TO_INVOICE: 'تحويل إلى فاتورة',
  STATUS_CHANGE: 'تغيير الحالة',
  CANCEL: 'إلغاء',
  UPDATE_BALANCE: 'تحديث الرصيد',
  TRANSFER_TO_MAIN: 'تحويل للصندوق الرئيسي',
  CREATE_PENDING_TRANSFER: 'إنشاء تحويل معلق',
  HANDLE_PENDING_TRANSFER: 'معالجة تحويل معلق',
  REPAY: 'سداد',
  ADD_WITHDRAWAL: 'إضافة سحب',
  ADD_PAYMENT: 'إضافة دفعة',
  ADD_PRODUCTION: 'إضافة إنتاج',
  ADD_HOURS: 'إضافة ساعات',
  VERIFY_PASSWORD: 'التحقق من كلمة المرور',
  SETTLEMENT: 'تسوية',
  UPDATE_PRODUCTION: 'تعديل إنتاج',
  DELETE_PRODUCTION: 'حذف إنتاج',
  UPDATE_HOURS: 'تعديل ساعات',
  DELETE_HOURS: 'حذف ساعات',
  ADD_EMPLOYEE: 'إضافة موظف',
  REMOVE_EMPLOYEE: 'إزالة موظف',
  IMPORT_CUSTOMERS_EXCEL: 'استيراد زبائن من Excel',
  IMPORT_SUPPLIERS_EXCEL: 'استيراد موردين من Excel',
  RETURN_TRAYS: 'إرجاع صواني',
  BACKUP: 'نسخ احتياطي',
  SUPPLIER_PAYMENT: 'دفعة مورد',
};

// Entity labels in Arabic
export const ENTITY_LABELS: Record<string, string> = {
  Auth: 'المصادقة',
  User: 'المستخدم',
  Customer: 'الزبون',
  Invoice: 'الفاتورة',
  Shift: 'الوردية',
  Debt: 'الدين',
  Item: 'الصنف',
  ItemGroup: 'مجموعة الأصناف',
  Order: 'الطلب',
  OrderItem: 'عنصر الطلب',
  OrderCategory: 'فئة الطلب',
  Fund: 'الصندوق',
  Advance: 'السلفة',
  Employee: 'الموظف',
  Workshop: 'الورشة',
  CustomerCategory: 'فئة الزبائن',
  TrayTracking: 'تتبع الصواني',
  System: 'النظام',
};

// Entity icons (using lucide-react icons)
export const ENTITY_ICONS: Record<string, string> = {
  Auth: 'Lock',
  User: 'User',
  Customer: 'Users',
  Invoice: 'FileText',
  Shift: 'Clock',
  Debt: 'CreditCard',
  Item: 'Package',
  ItemGroup: 'Layers',
  Order: 'ShoppingBag',
  OrderItem: 'List',
  OrderCategory: 'Tags',
  Fund: 'Wallet',
  Advance: 'DollarSign',
  Employee: 'UserCircle',
  Workshop: 'Building',
  CustomerCategory: 'Sitemap',
  TrayTracking: 'Truck',
  System: 'Server',
};

// Helper function to get action label
export const getActionLabel = (action: string): string => {
  if (action.startsWith('FAILED_')) {
    const baseAction = action.replace('FAILED_', '');
    return `فشل ${ACTION_LABELS[baseAction] || baseAction}`;
  }
  return ACTION_LABELS[action] || action;
};

// Helper function to get entity label
export const getEntityLabel = (entity: string): string => {
  return ENTITY_LABELS[entity] || entity;
};

// Action color mapping
export const getActionColor = (action: string): { bg: string; text: string } => {
  if (action.startsWith('FAILED_')) {
    return { bg: '#fecaca', text: '#7f1d1d' }; // Dark Red
  }
  if (action.startsWith('DELETE') || action === 'REMOVE_EMPLOYEE') {
    return { bg: '#fee2e2', text: '#991b1b' }; // Red
  }
  if (action.startsWith('IMPORT') || action.endsWith('_EXCEL')) {
    return { bg: '#ede9fe', text: '#5b21b6' }; // Purple
  }
  if (action.includes('TRANSFER')) {
    return { bg: '#cffafe', text: '#155e75' }; // Cyan
  }
  if (action.startsWith('ADD_') || action === 'CREATE') {
    return { bg: '#dcfce7', text: '#166534' }; // Green
  }
  if (action.startsWith('UPDATE')) {
    return { bg: '#fef3c7', text: '#92400e' }; // Amber/Orange
  }
  if (action === 'LOGIN') {
    return { bg: '#dbeafe', text: '#1e40af' }; // Blue
  }
  if (action === 'PAY' || action === 'ADD_PAYMENT') {
    return { bg: '#ccfbf1', text: '#065f46' }; // Teal
  }
  if (action === 'CLOSE' || action.includes('CLOSE')) {
    return { bg: '#e0e7ff', text: '#3730a3' }; // Indigo
  }
  if (action === 'BACKUP') {
    return { bg: '#f3f4f6', text: '#374151' }; // Gray
  }
  return { bg: '#f1f5f9', text: '#475569' }; // Slate (Default)
};
