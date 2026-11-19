import crypto from 'node:crypto';
import { Currency, Prisma, TripShare } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { UpdateTripShareInput } from '../schemas/trip-share.schema';
import {
  calculateDurationDays,
  formatDateOnly,
  TripService,
} from './trip.service';
import { sortEventsChronologically } from './event.service';
import { PACKING_CATEGORY_META, sortPackingItems } from './packing-list.service';
import { CountryService } from './country.service';
import { computeExpenseSummary, serializeExpense } from './expense.service';
import { ExchangeRateService } from './exchange-rate.service';
import { DocumentService } from './document.service';

export function generateShareToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function serializeTripShare(share: TripShare) {
  return {
    id: share.id,
    tripId: share.tripId,
    token: share.token,
    isActive: share.isActive,
    showItinerary: share.showItinerary,
    showPackingList: share.showPackingList,
    showCountryInfo: share.showCountryInfo,
    showExpenses: share.showExpenses,
    viewsCount: share.viewsCount,
    createdAt: share.createdAt.toISOString(),
    updatedAt: share.updatedAt.toISOString(),
  };
}

export class TripShareService {
  /**
   * Получить текущие настройки публичного доступа (только владелец поездки).
   */
  static async getShareSettings(userId: string, tripId: string) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const share = await prisma.tripShare.findUnique({
      where: { tripId },
    });

    return share ? serializeTripShare(share) : null;
  }

  /**
   * Создать или обновить настройки публичной ссылки (только владелец поездки).
   */
  static async updateShareSettings(
    userId: string,
    tripId: string,
    input: UpdateTripShareInput
  ) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const share = await prisma.tripShare.upsert({
      where: { tripId },
      create: {
        tripId,
        token: generateShareToken(),
        isActive: input.isActive ?? true,
        showItinerary: input.showItinerary ?? true,
        showPackingList: input.showPackingList ?? true,
        showCountryInfo: input.showCountryInfo ?? true,
        showExpenses: input.showExpenses ?? false,
      },
      update: {
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.showItinerary !== undefined ? { showItinerary: input.showItinerary } : {}),
        ...(input.showPackingList !== undefined ? { showPackingList: input.showPackingList } : {}),
        ...(input.showCountryInfo !== undefined ? { showCountryInfo: input.showCountryInfo } : {}),
        ...(input.showExpenses !== undefined ? { showExpenses: input.showExpenses } : {}),
      },
    });

    return serializeTripShare(share);
  }

  /**
   * Перегенерировать криптостойкий токен ссылки (старая ссылка становится недействительной).
   */
  static async regenerateShareToken(userId: string, tripId: string) {
    await TripService.getTripAndVerifyOwner(userId, tripId, false);

    const existing = await prisma.tripShare.findUnique({
      where: { tripId },
    });

    let newToken = generateShareToken();
    if (existing && newToken === existing.token) {
      newToken = generateShareToken();
    }

    const share = existing
      ? await prisma.tripShare.update({
          where: { tripId },
          data: { token: newToken },
        })
      : await prisma.tripShare.create({
          data: {
            tripId,
            token: newToken,
            isActive: true,
            showItinerary: true,
            showPackingList: true,
            showCountryInfo: true,
            showExpenses: false,
          },
        });

    return serializeTripShare(share);
  }

  /**
   * Публичное чтение маршрута по токену (без авторизации).
   * Privacy-by-Design:
   * - Никогда не возвращаются userId, email, имя владельца и внутренние ID БД.
   * - TripDocument (брони, паспорта, страховки, вложения) НИКОГДА не запрашиваются и не передаются.
   * - Финансовые данные (расходы, бюджет, оценки стоимости) возвращаются только при showExpenses === true.
   */
  static async getPublicSharedTrip(rawToken: string) {
    const token = rawToken?.trim();
    if (!token) {
      throw new AppError(
        'Публичная ссылка не найдена или доступ закрыт',
        404,
        'SHARE_NOT_FOUND'
      );
    }

    const share = await prisma.tripShare.findUnique({
      where: { token },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            country: true,
            city: true,
            startDate: true,
            endDate: true,
            travelersCount: true,
            budget: true,
            currency: true,
            tripType: true,
            description: true,
          },
        },
      },
    });

    if (!share || !share.isActive) {
      throw new AppError(
        'Публичная ссылка не найдена или доступ закрыт владельцем',
        404,
        'SHARE_NOT_FOUND'
      );
    }

    await prisma.tripShare.update({
      where: { id: share.id },
      data: { viewsCount: { increment: 1 } },
    });

    const startDate = formatDateOnly(share.trip.startDate);
    const endDate = formatDateOnly(share.trip.endDate);
    const durationDays = calculateDurationDays(startDate, endDate);

    // 1. Санитизированные события маршрута
    let events: Array<{
      date: string;
      title: string;
      description: string;
      startTime: string | null;
      endTime: string | null;
      location: string | null;
      estimatedCost: number | null;
      note: string | null;
    }> = [];

    if (share.showItinerary) {
      const rawEvents = await prisma.itineraryEvent.findMany({
        where: { tripId: share.trip.id },
      });
      events = sortEventsChronologically(rawEvents).map((ev) => ({
        date: formatDateOnly(ev.date),
        title: ev.title,
        description: ev.description || '',
        startTime: ev.startTime ?? null,
        endTime: ev.endTime ?? null,
        location: ev.location ?? null,
        estimatedCost:
          share.showExpenses && ev.estimatedCost !== null && ev.estimatedCost !== undefined
            ? Number(ev.estimatedCost)
            : null,
        note: ev.note ?? null,
      }));
    }

    // 2. Санитизированный список вещей (без isDismissed: true и без внутренних ID / отметок владельца)
    let packingList: Array<{
      key: string;
      category: string;
      categoryNameRu: string;
      name: string;
      quantity: number | null;
      source: string;
      reason: string | null;
      sortOrder: number;
    }> | null = null;

    if (share.showPackingList) {
      const rawPackingList = await prisma.packingList.findUnique({
        where: { tripId: share.trip.id },
        include: {
          items: {
            where: { isDismissed: false },
          },
        },
      });

      if (rawPackingList) {
        const sortedItems = sortPackingItems(rawPackingList.items);
        const seenKeys = new Map<string, number>();

        packingList = sortedItems.map((item) => {
          const meta = PACKING_CATEGORY_META[item.category] || PACKING_CATEGORY_META.OTHER;
          const baseKey = item.ruleKey
            ? `rule:${item.ruleKey}`
            : `custom:${item.category}:${item.name.trim().toLowerCase()}`;
          const occurrence = seenKeys.get(baseKey) ?? 0;
          seenKeys.set(baseKey, occurrence + 1);
          const key = occurrence === 0 ? baseKey : `${baseKey}#${occurrence}`;

          return {
            key,
            category: item.category,
            categoryNameRu: meta.nameRu,
            name: item.name,
            quantity: item.quantity,
            source: item.source,
            reason: item.reason,
            sortOrder: item.sortOrder,
          };
        });
      } else {
        packingList = [];
      }
    }

    // 3. Памятка о стране через CountryService
    let countryInfo: {
      slug: string;
      nameRu: string;
      nameEn: string;
      flagEmoji: string;
      flagUrl: string;
      capital: string;
      currency: string;
      languages: string[];
      timezone?: string;
      shortDescription: string;
      travelInfo: Awaited<ReturnType<typeof CountryService.getCountryTravelInfo>>['travelInfo'];
    } | null = null;

    if (share.showCountryInfo) {
      const matchedCountry = CountryService.findCountryByIdentifier(share.trip.country);
      if (matchedCountry) {
        const travelInfoResp = await CountryService.getCountryTravelInfo(matchedCountry.slug);
        countryInfo = {
          slug: travelInfoResp.slug,
          nameRu: travelInfoResp.nameRu,
          nameEn: travelInfoResp.nameEn,
          flagEmoji: travelInfoResp.flagEmoji,
          flagUrl: travelInfoResp.flagUrl,
          capital: travelInfoResp.capital,
          currency: travelInfoResp.currency,
          languages: travelInfoResp.languages,
          timezone: travelInfoResp.timezone,
          shortDescription: matchedCountry.shortDescription,
          travelInfo: travelInfoResp.travelInfo,
        };
      }
    }

    // 4. Бюджет и расходы (только если владелец явно включил showExpenses)
    let expenses: {
      summary: ReturnType<typeof computeExpenseSummary>;
      items: Array<{
        category: string;
        categoryNameRu: string;
        categoryColor: string;
        amount: number;
        currency: Currency;
        convertedAmount: number;
        exchangeRateUsed: number;
        expenseDate: string;
        description: string;
      }>;
    } | null = null;

    if (share.showExpenses) {
      const rawExpenses = await prisma.tripExpense.findMany({
        where: { tripId: share.trip.id },
        orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
      });

      const tripCurrency = share.trip.currency as Currency;
      const exchangeRates = await ExchangeRateService.getRatesForBase(tripCurrency);
      const serialized = rawExpenses.map((e) =>
        serializeExpense(e, tripCurrency, exchangeRates.rates)
      );

      const summary = computeExpenseSummary(
        Number(share.trip.budget),
        tripCurrency,
        serialized,
        {
          durationDays,
          travelersCount: share.trip.travelersCount,
          exchangeRates,
        }
      );

      const sanitizedItems = serialized.map((item) => ({
        category: item.category,
        categoryNameRu: item.categoryNameRu,
        categoryColor: item.categoryColor,
        amount: item.amount,
        currency: item.currency,
        convertedAmount: item.convertedAmount,
        exchangeRateUsed: item.exchangeRateUsed,
        expenseDate: item.expenseDate,
        description: item.description,
      }));

      expenses = {
        summary,
        items: sanitizedItems,
      };
    }

    return {
      trip: {
        title: share.trip.title,
        country: share.trip.country,
        city: share.trip.city,
        startDate,
        endDate,
        durationDays,
        travelersCount: share.trip.travelersCount,
        tripType: share.trip.tripType ?? null,
        description: share.trip.description || '',
      },
      permissions: {
        showItinerary: share.showItinerary,
        showPackingList: share.showPackingList,
        showCountryInfo: share.showCountryInfo,
        showExpenses: share.showExpenses,
      },
      events,
      packingList,
      countryInfo,
      expenses,
    };
  }

  /**
   * Клонирование активного публичного маршрута в аккаунт авторизованного пользователя.
   * Privacy-by-Design:
   * - Расходы (TripExpense) и чужие документы (TripDocument) НЕ копируются.
   * - Создаётся пустой базовый чек-лист документов через DocumentService.seedDefaultChecklist.
   * - Список вещей копируется со сброшенным isPacked: false (только не скрытые позиции и при showPackingList === true).
   */
  static async cloneSharedTrip(userId: string, rawToken: string) {
    const token = rawToken?.trim();
    if (!token) {
      throw new AppError(
        'Публичная ссылка не найдена или доступ закрыт',
        404,
        'SHARE_NOT_FOUND'
      );
    }

    const share = await prisma.tripShare.findUnique({
      where: { token },
      include: {
        trip: {
          include: {
            events: true,
            packingList: {
              include: {
                items: {
                  where: { isDismissed: false },
                },
              },
            },
          },
        },
      },
    });

    if (!share || !share.isActive) {
      throw new AppError(
        'Публичная ссылка не найдена или доступ закрыт владельцем',
        404,
        'SHARE_NOT_FOUND'
      );
    }

    const original = share.trip;

    const createdTripId = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          userId,
          title: original.title,
          country: original.country,
          city: original.city,
          startDate: original.startDate,
          endDate: original.endDate,
          travelersCount: original.travelersCount,
          budget: share.showExpenses ? original.budget : 0,
          currency: original.currency,
          tripType: original.tripType,
          description: original.description || '',
        },
      });

      if (share.showItinerary && original.events.length > 0) {
        await tx.itineraryEvent.createMany({
          data: original.events.map((ev) => ({
            tripId: newTrip.id,
            date: ev.date,
            title: ev.title,
            description: ev.description || '',
            startTime: ev.startTime ?? null,
            endTime: ev.endTime ?? null,
            location: ev.location ?? null,
            estimatedCost: share.showExpenses ? (ev.estimatedCost ?? null) : null,
            note: ev.note ?? null,
          })),
        });
      }

      if (share.showPackingList && original.packingList) {
        const newPackingList = await tx.packingList.create({
          data: {
            tripId: newTrip.id,
            lastGeneratedAt: original.packingList.lastGeneratedAt,
            contextSnapshot: original.packingList.contextSnapshot ?? Prisma.DbNull,
          },
        });

        if (original.packingList.items.length > 0) {
          const seenRuleKeys = new Set<string>();
          const itemsData: Prisma.PackingItemCreateManyInput[] = [];

          for (const item of original.packingList.items) {
            let safeRuleKey = item.ruleKey;
            if (safeRuleKey) {
              if (seenRuleKeys.has(safeRuleKey)) {
                safeRuleKey = null;
              } else {
                seenRuleKeys.add(safeRuleKey);
              }
            }

            itemsData.push({
              packingListId: newPackingList.id,
              category: item.category,
              name: item.name,
              quantity: item.quantity,
              isPacked: false,
              source: item.source,
              ruleKey: safeRuleKey,
              reason: item.reason,
              isEditedByUser: item.isEditedByUser,
              isOutdated: false,
              isDismissed: false,
              sortOrder: item.sortOrder,
            });
          }

          if (itemsData.length > 0) {
            await tx.packingItem.createMany({
              data: itemsData,
            });
          }
        }
      }

      return newTrip.id;
    });

    // Создаём чистый базовый чек-лист документов (чужие документы и брони никогда не копируются)
    await DocumentService.seedDefaultChecklist(createdTripId, userId);

    return TripService.getTripById(userId, createdTripId);
  }
}
