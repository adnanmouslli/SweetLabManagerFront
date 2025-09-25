import { getEmployeeOperationFromCategoryAndMode } from "@/types/employees.type";
import { InvoiceCategory } from "@/types/invoice.type";
import React from "react";
import { InvoiceForm as RefactoredInvoiceForm } from "../invoice";

type InvoiceType = "income" | "expense";

interface InvoiceFormProps {
  type: InvoiceCategory;
  mode: InvoiceType;
  fundId: number;
  onClose: () => void;
  customerId?: number;
  subType?: string; // For employee operations
}

const InvoiceForm: React.FC<InvoiceFormProps> = (props) => {
  // Detect if we're dealing with an employee operation based on the InvoiceCategory
  const { type, mode, subType } = props;

  // Check if type is one of the employee categories
  const isEmployeeOperation =
    type === InvoiceCategory.EMPLOYEE_DEBT ||
    type === InvoiceCategory.EMPLOYEE_WITHDRAWAL ||
    type === InvoiceCategory.EMPLOYEE_WITHDRAWAL_RETURN ||
    type === InvoiceCategory.DAILY_EMPLOYEE_RENT ||
    (type === InvoiceCategory.EMPLOYEE && subType);

  let modifiedProps = { ...props };

  // If this is an employee operation, set the type to EMPLOYEE and determine the proper subType
  if (isEmployeeOperation && type !== InvoiceCategory.EMPLOYEE) {
    const operationType = getEmployeeOperationFromCategoryAndMode(type, mode);
    modifiedProps = {
      ...props,
      type: InvoiceCategory.EMPLOYEE,
      subType: operationType || subType,
    };
  }

  // This is just a wrapper to maintain backward compatibility
  return <RefactoredInvoiceForm {...modifiedProps} />;
};

export default InvoiceForm;
