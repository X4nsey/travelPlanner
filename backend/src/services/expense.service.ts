import { ExpenseCategory, Currency } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { CreateExpenseInput, UpdateExpenseInput } from '../schemas/expense.schema';
import { calculateDurationDays, formatDateOnly, parseDateOnly, TripService } from './trip.service';
import {
  convertAmount,
  ExchangeRateService,
  ExchangeRatesResult,
  getExchangeRate,
} from './exchange-rate.service';

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

export interface ComputeExpenseSummaryOptions {
  durationDays?: number;
  travelersCount?: number;
  exchangeRates?: ExchangeRatesResult;
}

export function serializeExpense(
  item: any,
  tripCurrency?: Currency,
  rates?: Record<Currency, number>
) {
  const cat = item.category as ExpenseCategory;
  const meta = CATEGORY_META[cat] || CATEGORY_META.OTHER;
  const amount = Number(item.amount);
  const expCurrency = item.currency as Currency;
  const targetCurrency = (tripCurrency || item.trip?.currency || expCurrency) as Currency;

  const exchangeRateUsed =
    expCurrency === targetCurrency || !rates
      ? 1
      : getExchangeRate(expCurrency, targetCurrency, rates);
  const convertedAmount =
    expCurrency === targetCurrency || !rates
      ? Math.round(amount * 100) / 100
      : convertAmount(amount, expCurrency, targetCurrency, rates);

  return {
    id: item.id,
    tripId: item.tripId,
    category: cat,
    categoryNameRu: meta.nameRu,
    categoryColor: meta.color,
    amount,
    currency: expCurrency,
    convertedAmount,
    exchangeRateUsed,
    expenseDate: typeof item.expenseDate === 'string' ? item.expenseDate : formatDateOnly(item.expenseDate),
    description: item.description || '',
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
  };
}

export function computeExpenseSummary(
  tripBudget: number,
  tripCurrency: Currency,
  expenses: any[],
  options: ComputeExpenseSummaryOptions = {}
) {
  const exchangeRates =
    options.exchangeRates ?? ExchangeRateService.getFallbackRatesForBase(tripCurrency);
  const durationDays = Math.max(1, options.durationDays ?? 1);
  const travelersCount = Math.max(1, options.travelersCount ?? 1);

  const categoryTotals: Record<ExpenseCategory, { total: number; count: number }> = {
    TRANSPORT: { total: 0, count: 0 },
    FOOD: { total: 0, count: 0 },
    LODGING: { total: 0, count: 0 },
    ENTERTAINMENT: { total: 0, count: 0 },
    SHOPPING: { total: 0, count: 0 },
    OTHER: { total: 0, count: 0 },
  };

  const dayTotals = new Map<string, { total: number; count: number }>();
  let rawTotalSpent = 0;

  for (const e of expenses) {
    const expCurrency = (e.currency as Currency) || tripCurrency;
    const converted =
      typeof e.convertedAmount === 'number'
        ? e.convertedAmount
        : convertAmount(Number(e.amount), expCurrency, tripCurrency, exchangeRates.rates);

    rawTotalSpent += converted;

    const cat = e.category as ExpenseCategory;
    if (categoryTotals[cat]) {
      categoryTotals[cat].total += converted;
      categoryTotals[cat].count += 1;
    }

    const dateStr =
      typeof e.expenseDate === 'string' ? e.expenseDate : formatDateOnly(e.expenseDate);
    const existingDay = dayTotals.get(dateStr) || { total: 0, count: 0 };
    existingDay.total += converted;
    existingDay.count += 1;
    dayTotals.set(dateStr, existingDay);
  }

  const totalSpent = Math.round(rawTotalSpent * 100) / 100;
  const remainingBudget = Math.round((tripBudget - totalSpent) * 100) / 100;
  const spentPercentage =
    tripBudget > 0 ? Math.round((totalSpent / tripBudget) * 1000) / 10 : 0;

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

  const byDay = Array.from(dayTotals.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, data]) => ({
      date,
      totalAmount: Math.round(data.total * 100) / 100,
      count: data.count,
    }));

  const dailyAverage = Math.round((totalSpent / durationDays) * 100) / 100;
  const perTravelerAverage = Math.round((totalSpent / travelersCount) * 100) / 100;

  let status: 'under_budget' | 'near_budget' | 'over_budget' = 'under_budget';
  if (totalSpent > tripBudget && tripBudget > 0) {
    status = 'over_budget';
  } else if (spentPercentage >= 80) {
    status = 'near_budget';
  }

  return {
    plannedBudget: tripBudget,
    totalSpent,
    remainingBudget,
    spentPercentage,
    status,
    currency: tripCurrency,
    byCategory,
    dailyAverage,
    perTravelerAverage,
    byDay,
    exchangeRates: {
      baseCurrency: exchangeRates.baseCurrency,
      rates: exchangeRates.rates,
      updatedAt: exchangeRates.updatedAt,
      source: exchangeRates.source,
      isFallback: exchangeRates.isFallback,
    },
  };
}

export class ExpenseService {
  static async listTripExpenses(userId: string, tripId: string) {
    const trip = await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const expenses = await prisma.tripExpense.findMany({
      where: { tripId },
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    });

    const tripCurrency = trip.currency as Currency;
    const exchangeRates = await ExchangeRateService.getRatesForBase(tripCurrency);
    const durationDays = calculateDurationDays(
      formatDateOnly(trip.startDate),
      formatDateOnly(trip.endDate)
    );

    const serializedExpenses = expenses.map((e) =>
      serializeExpense(e, tripCurrency, exchangeRates.rates)
    );

    const summary = computeExpenseSummary(
      Number(trip.budget),
      tripCurrency,
      serializedExpenses,
      {
        durationDays,
        travelersCount: trip.travelersCount,
        exchangeRates,
      }
    );

    return {
      expenses: serializedExpenses,
      summary,
    };
  }

  static async createTripExpense(userId: string, tripId: string, input: CreateExpenseInput) {
    const trip = await TripService.getTripAndVerifyOwner(userId, tripId, false);
    const tripCurrency = trip.currency as Currency;

    const expenseDate = parseDateOnly(input.expenseDate);

    const created = await prisma.tripExpense.create({
      data: {
        tripId,
        category: input.category as ExpenseCategory,
        amount: input.amount,
        currency: (input.currency as Currency) || tripCurrency,
        expenseDate,
        description: input.description ?? '',
      },
    });

    const exchangeRates = await ExchangeRateService.getRatesForBase(tripCurrency);
    return serializeExpense(created, tripCurrency, exchangeRates.rates);
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

    const tripCurrency = expense.trip.currency as Currency;
    const exchangeRates = await ExchangeRateService.getRatesForBase(tripCurrency);
    return serializeExpense(expense, tripCurrency, exchangeRates.rates);
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
      include: { trip: true },
    });

    const tripCurrency = updated.trip.currency as Currency;
    const exchangeRates = await ExchangeRateService.getRatesForBase(tripCurrency);
    return serializeExpense(updated, tripCurrency, exchangeRates.rates);
  }

  static async deleteExpense(userId: string, expenseId: string) {
    await this.getExpenseById(userId, expenseId);

    await prisma.tripExpense.delete({
      where: { id: expenseId },
    });

    return { success: true, message: 'Расход успешно удален' };
  }
}
