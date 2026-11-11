import { ExpenseCategory, Currency } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { CreateExpenseInput, UpdateExpenseInput } from '../schemas/expense.schema';
import { formatDateOnly, parseDateOnly, TripService } from './trip.service';

export const CATEGORY_META: Record<
  ExpenseCategory,
  { nameRu: string; color: string; icon: string }
> = {
  TRANSPORT: { nameRu: 'Транспорт', color: '#0284c7', icon: 'Car' },
  FOOD: { nameRu: 'Питание', color: '#10b981', icon: 'Utensils' },
  LODGING: { nameRu: 'Жильё', color: '#8b5cf6', icon: 'Hotel' },
  ENTERTAINMENT: { nameRu: 'Развлечения', color: '#f59e0b', icon: 'Ticket' },
  SHOPPING: { nameRu: 'Покупки', color: '#ec4899', icon: 'ShoppingBag' },
  OTHER: { nameRu: 'Прочее', color: '#64748b', icon: 'MoreHorizontal' },
};

export function serializeExpense(item: any) {
  const cat = item.category as ExpenseCategory;
  const meta = CATEGORY_META[cat] || CATEGORY_META.OTHER;
  return {
    id: item.id,
    tripId: item.tripId,
    category: cat,
    categoryNameRu: meta.nameRu,
    categoryColor: meta.color,
    amount: Number(item.amount),
    currency: item.currency as Currency,
    expenseDate: formatDateOnly(item.expenseDate),
    description: item.description || '',
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function computeExpenseSummary(
  tripBudget: number,
  tripCurrency: Currency,
  expenses: any[]
) {
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingBudget = Math.round((tripBudget - totalSpent) * 100) / 100;
  const spentPercentage =
    tripBudget > 0 ? Math.round((totalSpent / tripBudget) * 1000) / 10 : 0;

  const categoryTotals: Record<ExpenseCategory, { total: number; count: number }> = {
    TRANSPORT: { total: 0, count: 0 },
    FOOD: { total: 0, count: 0 },
    LODGING: { total: 0, count: 0 },
    ENTERTAINMENT: { total: 0, count: 0 },
    SHOPPING: { total: 0, count: 0 },
    OTHER: { total: 0, count: 0 },
  };

  for (const e of expenses) {
    const cat = e.category as ExpenseCategory;
    if (categoryTotals[cat]) {
      categoryTotals[cat].total += Number(e.amount);
      categoryTotals[cat].count += 1;
    }
  }

  const byCategory = (Object.keys(CATEGORY_META) as ExpenseCategory[]).map((cat) => {
    const data = categoryTotals[cat];
    const catTotal = Math.round(data.total * 100) / 100;
    const catPercentage =
      totalSpent > 0 ? Math.round((catTotal / totalSpent) * 1000) / 10 : 0;
    return {
      category: cat,
      nameRu: CATEGORY_META[cat].nameRu,
      color: CATEGORY_META[cat].color,
      icon: CATEGORY_META[cat].icon,
      totalAmount: catTotal,
      percentage: catPercentage,
      count: data.count,
    };
  });

  let status: 'under_budget' | 'near_budget' | 'over_budget' = 'under_budget';
  if (totalSpent > tripBudget && tripBudget > 0) {
    status = 'over_budget';
  } else if (spentPercentage >= 80) {
    status = 'near_budget';
  }

  return {
    plannedBudget: tripBudget,
    totalSpent: Math.round(totalSpent * 100) / 100,
    remainingBudget,
    spentPercentage,
    status,
    currency: tripCurrency,
    byCategory,
  };
}

export class ExpenseService {
  static async listTripExpenses(userId: string, tripId: string) {
    const trip = await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const expenses = await prisma.tripExpense.findMany({
      where: { tripId },
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    });

    const summary = computeExpenseSummary(
      Number(trip.budget),
      trip.currency as Currency,
      expenses
    );

    return {
      expenses: expenses.map(serializeExpense),
      summary,
    };
  }

  static async createTripExpense(userId: string, tripId: string, input: CreateExpenseInput) {
    const trip = await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const expenseDate = parseDateOnly(input.expenseDate);

    const created = await prisma.tripExpense.create({
      data: {
        tripId,
        category: input.category as ExpenseCategory,
        amount: input.amount,
        currency: (input.currency as Currency) || (trip.currency as Currency),
        expenseDate,
        description: input.description ?? '',
      },
    });

    return serializeExpense(created);
  }

  static async getExpenseById(userId: string, expenseId: string) {
    const expense = await prisma.tripExpense.findUnique({
      where: { id: expenseId },
      include: { trip: true },
    });

    if (!expense) {
      throw new AppError('Расход не найден', 404, 'EXPENSE_NOT_FOUND');
    }

    if (expense.trip.userId !== userId) {
      throw new AppError('У вас нет прав для просмотра этого расхода', 403, 'FORBIDDEN');
    }

    return serializeExpense(expense);
  }

  static async updateExpense(userId: string, expenseId: string, input: UpdateExpenseInput) {
    await this.getExpenseById(userId, expenseId);

    const dataToUpdate: any = {};
    if (input.category) dataToUpdate.category = input.category as ExpenseCategory;
    if (input.amount !== undefined) dataToUpdate.amount = input.amount;
    if (input.currency) dataToUpdate.currency = input.currency as Currency;
    if (input.expenseDate) dataToUpdate.expenseDate = parseDateOnly(input.expenseDate);
    if (input.description !== undefined) dataToUpdate.description = input.description;

    const updated = await prisma.tripExpense.update({
      where: { id: expenseId },
      data: dataToUpdate,
    });

    return serializeExpense(updated);
  }

  static async deleteExpense(userId: string, expenseId: string) {
    await this.getExpenseById(userId, expenseId);

    await prisma.tripExpense.delete({
      where: { id: expenseId },
    });

    return { success: true, message: 'Расход успешно удален' };
  }
}
