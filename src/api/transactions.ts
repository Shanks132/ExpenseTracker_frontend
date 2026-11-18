import { api } from "./client";
import type { Page, Summary, Transaction, TransactionInput } from "../types";

// month is "YYYY-MM", the same format an <input type="month"> produces
export async function getSummary(month: string): Promise<Summary> {
  const { data } = await api.get<Summary>("/transaction/summary", {
    params: { month },
  });
  return data;
}

export async function getTransactions(
  page: number,
  size: number,
): Promise<Page<Transaction>> {
  const { data } = await api.get<Page<Transaction>>("/transaction", {
    params: { page, size },
  });
  return data;
}

export async function createTransaction(
  body: TransactionInput,
): Promise<Transaction> {
  const { data } = await api.post<Transaction>("/transaction", body);
  return data;
}

export async function updateTransaction(
  id: number,
  body: TransactionInput,
): Promise<Transaction> {
  const { data } = await api.put<Transaction>(`/transaction/${id}`, body);
  return data;
}
export async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/transaction/${id}`);
}