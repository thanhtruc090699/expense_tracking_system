export interface Expense {
  id: string;
  userId: string;
  merchantId: string | null;
  totalAmount: number;
  expenseDate: string;
  isRecurring: boolean;
  note: string | null;
  createdAt: string;
  merchant?: { name: string; business?: string | null } | null;
}

export interface ExpenseItem {
  id: string;
  expenseId: string;
  itemName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  categoryId: string | null;
  categoryName?: string | null;
  createdAt: string;
}
