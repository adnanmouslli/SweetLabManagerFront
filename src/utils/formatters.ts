// src/utils/formatters.ts
// export const formatDate = (dateString: string | null) => {
//   if (!dateString) return "-";
//   return new Date(dateString).toLocaleDateString("ar-EG", {
//     year: "numeric",
//     month: "numeric",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ar-SY", {
    style: "currency",
    currency: "SYP",
  }).format(amount);
};

export const translateInvoiceType = (type: "expense" | "income") => {
  return type === "expense" ? "صرف" : "دخل";
};

export const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // Convert to Arabic numerals
  const toArabic = (num: number) => num.toString().replace(/[0-9]/g, d => String.fromCharCode(0x0660 + Number(d)));
  return `${toArabic(y)}/${toArabic(m)}/${toArabic(d)}`;
};

/**
 * Extract customer name from notes if customer is null
 * Looks for pattern: w-name (e.g., w-ahmad, w-adnan, w-joe)
 * @param customer - The customer object
 * @param notes - The invoice notes
 * @param fallback - Fallback text if no name found
 * @returns The customer name or extracted name from notes or fallback
 */
export const getCustomerDisplayName = (
  customer: { name: string } | null | undefined,
  notes: string | null | undefined,
  fallback: string = "-"
): string => {
  // If customer exists and has a name, return it
  if (customer?.name) {
    return customer.name;
  }

  // If no customer but notes exist, try to extract name from pattern w-name
  if (notes && notes.trim()) {
    const nameMatch = notes.match(/w-([a-zA-Z\u0600-\u06FF]+)/);
    if (nameMatch && nameMatch[1]) {
      return "ورشة : " + notes.split('w-')[1];
    }
  }

  // Return fallback if no name found
  return fallback;
};
