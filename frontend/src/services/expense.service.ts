import { apiClient } from './api';
import type {
  ApiSuccessResponse,
  TripExpense,
  TripExpenseSummary,
  ExpenseFormPayload,
} from '@/types';

export const expenseService = {
  async getTripExpenses(
    tripId: string
  ): Promise<{ expenses: TripExpense[]; summary: TripExpenseSummary }> {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ expenses: TripExpense[]; summary: TripExpenseSummary }>
    >(`/trips/${tripId}/expenses`);
    return data.data;
  },

  async createExpense(
    tripId: string,
    payload: ExpenseFormPayload
  ): Promise<{ expense: TripExpense; message?: string }> {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ expense: TripExpense }>
    >(`/trips/${tripId}/expenses`, payload);
    return { expense: data.data.expense, message: data.message };
  },

  async updateExpense(
    id: string,
    payload: Partial<ExpenseFormPayload>
  ): Promise<{ expense: TripExpense; message?: string }> {
    const { data } = await apiClient.patch<
      ApiSuccessResponse<{ expense: TripExpense }>
    >(`/expenses/${id}`, payload);
    return { expense: data.data.expense, message: data.message };
  },

  async deleteExpense(id: string): Promise<{ success: boolean; message?: string }> {
    const { data } = await apiClient.delete<
      ApiSuccessResponse<{ success: boolean; message: string }>
    >(`/expenses/${id}`);
    return { success: data.data.success, message: data.data.message || data.message };
  },
};
