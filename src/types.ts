export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: TransactionType;
  category: string | null;
  transactionDate: string;
  createdAt: string;
  userId: number;
}

// Matches the JSON Spring sends for a Page<T>
export interface Page<T> {
  content: T[];
  number: number; // current page, 0-based
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseByCategory: CategoryTotal[];
}

// What the add/edit form sends. Category is omitted when left blank.
export interface TransactionInput {
  amount: number;
  description: string;
  type: TransactionType;
  category?: string;
  transactionDate: string;
}
