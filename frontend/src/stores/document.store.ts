import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  CreateTripDocumentPayload,
  DocumentCategory,
  LocalDocumentFileSummary,
  SeedDefaultDocumentsResponse,
  TripDocumentCategorySummary,
  TripDocumentDto,
  TripDocumentItem,
  TripDocumentsListResponse,
  TripDocumentsSummaryDto,
  UpdateTripDocumentPayload,
} from '@/types';
import {
  DOCUMENT_CATEGORY_META,
  ORDERED_DOCUMENT_CATEGORIES,
} from '@/constants/documents';
import { documentService } from '@/services/document.service';
import {
  listLocalAttachmentIdsByTrip,
  removeLocalAttachment,
  removeLocalAttachmentsByTrip,
  saveLocalAttachment,
  validateLocalAttachmentFile,
} from '@/utils/localDocumentVault';

interface InFlightDocumentsFetch {
  version: number;
  promise: Promise<TripDocumentsListResponse>;
}

export function createEmptyDocumentsSummary(): TripDocumentsSummaryDto {
  return {
    totalCount: 0,
    readyCount: 0,
    pendingCount: 0,
    requiredCount: 0,
    withAttachmentCount: 0,
    readinessPercentage: 0,
    byCategory: ORDERED_DOCUMENT_CATEGORIES.map((category) => ({
      category,
      nameRu: DOCUMENT_CATEGORY_META[category].nameRu,
      count: 0,
      readyCount: 0,
      pendingCount: 0,
      requiredCount: 0,
      withAttachmentCount: 0,
    })),
  };
}

export function sortTripDocuments(docs: TripDocumentItem[]): TripDocumentItem[] {
  return [...docs].sort((a, b) => {
    if (a.eventDate && b.eventDate) {
      if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate);
    } else if (a.eventDate && !b.eventDate) {
      return -1;
    } else if (!a.eventDate && b.eventDate) {
      return 1;
    }

    const catDiff =
      (DOCUMENT_CATEGORY_META[a.category]?.order ?? 99) -
      (DOCUMENT_CATEGORY_META[b.category]?.order ?? 99);
    if (catDiff !== 0) return catDiff;

    const createdDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (createdDiff !== 0) return createdDiff;

    return a.id.localeCompare(b.id);
  });
}

export function computeDocumentsSummary(docs: TripDocumentDto[]): TripDocumentsSummaryDto {
  const totalCount = docs.length;
  let readyCount = 0;
  let pendingCount = 0;
  let requiredCount = 0;
  let withAttachmentCount = 0;

  const buckets: Record<
    DocumentCategory,
    {
      count: number;
      readyCount: number;
      pendingCount: number;
      requiredCount: number;
      withAttachmentCount: number;
    }
  > = {
    FLIGHT_TICKET: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    HOTEL_BOOKING: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    INSURANCE: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    VISA_PASSPORT: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    EXCURSION_TICKET: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    RENTAL_TRANSFER: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
    OTHER: { count: 0, readyCount: 0, pendingCount: 0, requiredCount: 0, withAttachmentCount: 0 },
  };

  for (const doc of docs) {
    const isVisaPassport = doc.category === 'VISA_PASSPORT';
    const hasAttachment = !isVisaPassport && Boolean(doc.hasAttachment);
    if (hasAttachment) withAttachmentCount += 1;

    if (doc.status === 'READY') readyCount += 1;
    else if (doc.status === 'PENDING') pendingCount += 1;
    else if (doc.status === 'REQUIRED') requiredCount += 1;

    const bucket = buckets[doc.category];
    if (bucket) {
      bucket.count += 1;
      if (hasAttachment) bucket.withAttachmentCount += 1;
      if (doc.status === 'READY') bucket.readyCount += 1;
      else if (doc.status === 'PENDING') bucket.pendingCount += 1;
      else if (doc.status === 'REQUIRED') bucket.requiredCount += 1;
    }
  }

  const byCategory: TripDocumentCategorySummary[] = ORDERED_DOCUMENT_CATEGORIES.map((category) => ({
    category,
    nameRu: DOCUMENT_CATEGORY_META[category].nameRu,
    ...buckets[category],
  }));

  return {
    totalCount,
    readyCount,
    pendingCount,
    requiredCount,
    withAttachmentCount,
    readinessPercentage: totalCount > 0 ? Math.round((readyCount / totalCount) * 1000) / 10 : 0,
    byCategory,
  };
}

export function mergeDocumentWithLocalFile(
  doc: TripDocumentDto,
  localFilesMap: Record<string, LocalDocumentFileSummary>
): TripDocumentItem {
  const isVisaPassport = doc.category === 'VISA_PASSPORT';
  if (isVisaPassport) {
    return {
      ...doc,
      referenceCode: '',
      hasAttachment: false,
      fileName: null,
      fileMimeType: null,
      fileSize: null,
      hasLocalFileOnDevice: false,
      localFileMeta: null,
    };
  }

  const localMeta = localFilesMap[doc.id] ?? null;
  return {
    ...doc,
    hasLocalFileOnDevice: Boolean(localMeta),
    localFileMeta: localMeta,
  };
}

export const useDocumentStore = defineStore('documents', () => {
  const documentsByTripId = ref<Record<string, TripDocumentItem[]>>({});
  const summaryByTripId = ref<Record<string, TripDocumentsSummaryDto>>({});
  const localFilesByTripId = ref<Record<string, Record<string, LocalDocumentFileSummary>>>({});
  const loadingByTripId = ref<Record<string, boolean>>({});
  const seedingByTripId = ref<Record<string, boolean>>({});
  const hasLoadedByTripId = ref<Record<string, boolean>>({});
  const errorByTripId = ref<Record<string, string | null>>({});
  const mutatingDocumentMap = ref<Record<string, boolean>>({});

  // Race-condition & invalidation guards per tripId
  const versionByTripId: Record<string, number> = {};
  const fetchSeqByTripId: Record<string, number> = {};
  const inFlightFetchByTripId: Record<string, InFlightDocumentsFetch> = {};

  function getVersion(tripId: string): number {
    return versionByTripId[tripId] ?? 0;
  }

  function setLoadingFlag(tripId: string, active: boolean) {
    if (active) {
      loadingByTripId.value = { ...loadingByTripId.value, [tripId]: true };
    } else if (tripId in loadingByTripId.value) {
      const next = { ...loadingByTripId.value };
      delete next[tripId];
      loadingByTripId.value = next;
    }
  }

  function setSeedingFlag(tripId: string, active: boolean) {
    if (active) {
      seedingByTripId.value = { ...seedingByTripId.value, [tripId]: true };
    } else if (tripId in seedingByTripId.value) {
      const next = { ...seedingByTripId.value };
      delete next[tripId];
      seedingByTripId.value = next;
    }
  }

  function setErrorEntry(tripId: string, message: string | null) {
    if (message === null) {
      if (tripId in errorByTripId.value) {
        const next = { ...errorByTripId.value };
        delete next[tripId];
        errorByTripId.value = next;
      }
      return;
    }
    errorByTripId.value = { ...errorByTripId.value, [tripId]: message };
  }

  function setDocumentMutating(documentId: string, active: boolean) {
    if (active) {
      mutatingDocumentMap.value = { ...mutatingDocumentMap.value, [documentId]: true };
    } else if (mutatingDocumentMap.value[documentId]) {
      const next = { ...mutatingDocumentMap.value };
      delete next[documentId];
      mutatingDocumentMap.value = next;
    }
  }

  function applyTripState(
    tripId: string,
    serverDocs: TripDocumentDto[],
    localMap: Record<string, LocalDocumentFileSummary>,
    serverSummary?: TripDocumentsSummaryDto
  ) {
    const cleanedLocalMap: Record<string, LocalDocumentFileSummary> = { ...localMap };

    for (const doc of serverDocs) {
      if (doc.category === 'VISA_PASSPORT' && cleanedLocalMap[doc.id]) {
        delete cleanedLocalMap[doc.id];
        removeLocalAttachment(doc.id).catch(() => {});
      }
    }

    const merged = sortTripDocuments(
      serverDocs.map((doc) => mergeDocumentWithLocalFile(doc, cleanedLocalMap))
    );

    localFilesByTripId.value = {
      ...localFilesByTripId.value,
      [tripId]: cleanedLocalMap,
    };
    documentsByTripId.value = {
      ...documentsByTripId.value,
      [tripId]: merged,
    };
    summaryByTripId.value = {
      ...summaryByTripId.value,
      [tripId]: serverSummary ?? computeDocumentsSummary(merged),
    };
    hasLoadedByTripId.value = {
      ...hasLoadedByTripId.value,
      [tripId]: true,
    };
  }

  function upsertDocumentInState(
    tripId: string,
    doc: TripDocumentDto,
    localMetaUpdate?: { action: 'set'; meta: LocalDocumentFileSummary } | { action: 'remove' }
  ): TripDocumentItem {
    const currentLocalMap = { ...(localFilesByTripId.value[tripId] ?? {}) };

    if (doc.category === 'VISA_PASSPORT' || localMetaUpdate?.action === 'remove') {
      delete currentLocalMap[doc.id];
    } else if (localMetaUpdate?.action === 'set') {
      currentLocalMap[doc.id] = localMetaUpdate.meta;
    }

    const mergedDoc = mergeDocumentWithLocalFile(doc, currentLocalMap);
    const existingList = documentsByTripId.value[tripId] ?? [];
    const idx = existingList.findIndex((item) => item.id === doc.id);
    const nextList =
      idx === -1
        ? sortTripDocuments([...existingList, mergedDoc])
        : sortTripDocuments(existingList.map((item, i) => (i === idx ? mergedDoc : item)));

    localFilesByTripId.value = {
      ...localFilesByTripId.value,
      [tripId]: currentLocalMap,
    };
    documentsByTripId.value = {
      ...documentsByTripId.value,
      [tripId]: nextList,
    };
    summaryByTripId.value = {
      ...summaryByTripId.value,
      [tripId]: computeDocumentsSummary(nextList),
    };
    hasLoadedByTripId.value = {
      ...hasLoadedByTripId.value,
      [tripId]: true,
    };

    return mergedDoc;
  }

  function getDocuments(tripId: string): TripDocumentItem[] {
    return documentsByTripId.value[tripId] ?? [];
  }

  function getSummary(tripId: string): TripDocumentsSummaryDto {
    return summaryByTripId.value[tripId] ?? createEmptyDocumentsSummary();
  }

  function getLocalFiles(tripId: string): Record<string, LocalDocumentFileSummary> {
    return localFilesByTripId.value[tripId] ?? {};
  }

  function getLocalFilesCount(tripId: string): number {
    return getDocuments(tripId).filter((doc) => doc.hasLocalFileOnDevice).length;
  }

  function isLoading(tripId: string): boolean {
    return Boolean(loadingByTripId.value[tripId]);
  }

  function isSeeding(tripId: string): boolean {
    return Boolean(seedingByTripId.value[tripId]);
  }

  function hasLoaded(tripId: string): boolean {
    return Boolean(hasLoadedByTripId.value[tripId]);
  }

  function getError(tripId: string): string | null {
    return errorByTripId.value[tripId] ?? null;
  }

  function isDocumentMutating(documentId: string): boolean {
    return Boolean(mutatingDocumentMap.value[documentId]);
  }

  async function fetchTripDocuments(
    tripId: string,
    options: { force?: boolean } = {}
  ): Promise<TripDocumentsListResponse> {
    const requestVersion = getVersion(tripId);
    const existing = inFlightFetchByTripId[tripId];

    if (!options.force && existing && existing.version === requestVersion) {
      return existing.promise;
    }

    const fetchSeq = (fetchSeqByTripId[tripId] ?? 0) + 1;
    fetchSeqByTripId[tripId] = fetchSeq;

    setLoadingFlag(tripId, true);
    setErrorEntry(tripId, null);

    let promise!: Promise<TripDocumentsListResponse>;
    promise = (async () => {
      try {
        const [apiRes, localMap] = await Promise.all([
          documentService.getTripDocuments(tripId),
          listLocalAttachmentIdsByTrip(tripId),
        ]);

        if (getVersion(tripId) === requestVersion && fetchSeqByTripId[tripId] === fetchSeq) {
          applyTripState(tripId, apiRes.documents, localMap, apiRes.summary);
          setErrorEntry(tripId, null);
        }

        return apiRes;
      } catch (err: any) {
        if (getVersion(tripId) === requestVersion && fetchSeqByTripId[tripId] === fetchSeq) {
          setErrorEntry(tripId, err?.message || 'Не удалось загрузить документы и брони поездки');
        }
        throw err;
      } finally {
        if (getVersion(tripId) === requestVersion && fetchSeqByTripId[tripId] === fetchSeq) {
          setLoadingFlag(tripId, false);
        }
        if (inFlightFetchByTripId[tripId]?.promise === promise) {
          delete inFlightFetchByTripId[tripId];
        }
      }
    })();

    inFlightFetchByTripId[tripId] = { version: requestVersion, promise };
    return promise;
  }

  async function seedDefaultDocuments(
    tripId: string
  ): Promise<SeedDefaultDocumentsResponse & { message?: string }> {
    const requestVersion = getVersion(tripId);
    setSeedingFlag(tripId, true);
    setErrorEntry(tripId, null);

    try {
      const [res, localMap] = await Promise.all([
        documentService.seedDefaultDocuments(tripId),
        listLocalAttachmentIdsByTrip(tripId),
      ]);

      if (getVersion(tripId) === requestVersion) {
        applyTripState(tripId, res.documents, localMap, res.summary);
      }

      return res;
    } catch (err: any) {
      if (getVersion(tripId) === requestVersion) {
        setErrorEntry(tripId, err?.message || 'Не удалось заполнить базовый чек-лист');
      }
      throw err;
    } finally {
      if (getVersion(tripId) === requestVersion) {
        setSeedingFlag(tripId, false);
      }
    }
  }

  async function createDocument(
    tripId: string,
    payload: CreateTripDocumentPayload,
    localFile?: File | Blob | null
  ): Promise<{ document: TripDocumentItem; message?: string }> {
    const requestVersion = getVersion(tripId);
    const isVisaPassport = payload.category === 'VISA_PASSPORT';

    let validatedFileMeta:
      | { fileName: string; fileMimeType: string; fileSize: number }
      | null = null;

    if (!isVisaPassport && localFile) {
      validatedFileMeta = validateLocalAttachmentFile(localFile);
    }

    const requestPayload: CreateTripDocumentPayload = {
      ...payload,
      referenceCode: isVisaPassport ? '' : payload.referenceCode,
      fileName: validatedFileMeta?.fileName ?? null,
      fileMimeType: validatedFileMeta?.fileMimeType ?? null,
      fileSize: validatedFileMeta?.fileSize ?? null,
    };

    const res = await documentService.createTripDocument(tripId, requestPayload);
    let finalServerDoc = res.document;
    let localMetaUpdate:
      | { action: 'set'; meta: LocalDocumentFileSummary }
      | { action: 'remove' }
      | undefined;

    if (!isVisaPassport && localFile && validatedFileMeta) {
      try {
        const savedRecord = await saveLocalAttachment(finalServerDoc.id, tripId, localFile, {
          fileName: validatedFileMeta.fileName,
          fileMimeType: validatedFileMeta.fileMimeType,
        });
        localMetaUpdate = {
          action: 'set',
          meta: {
            fileName: savedRecord.fileName,
            fileMimeType: savedRecord.fileMimeType,
            fileSize: savedRecord.fileSize,
            updatedAt: savedRecord.updatedAt,
          },
        };
      } catch (vaultErr: any) {
        // Если локальная запись в IndexedDB не удалась, откатываем метаданные вложения на сервере
        try {
          const rollbackRes = await documentService.updateTripDocument(finalServerDoc.id, {
            removeAttachment: true,
          });
          finalServerDoc = rollbackRes.document;
        } catch {
          // Ignore secondary rollback error
        }
        if (getVersion(tripId) === requestVersion) {
          upsertDocumentInState(tripId, finalServerDoc, { action: 'remove' });
        }
        throw new Error(
          vaultErr?.message || 'Карточка создана, но не удалось сохранить файл локально в браузере'
        );
      }
    }

    const merged =
      getVersion(tripId) === requestVersion
        ? upsertDocumentInState(tripId, finalServerDoc, localMetaUpdate)
        : mergeDocumentWithLocalFile(
            finalServerDoc,
            localMetaUpdate?.action === 'set'
              ? { [finalServerDoc.id]: localMetaUpdate.meta }
              : {}
          );

    return {
      document: merged,
      message: res.message,
    };
  }

  async function updateDocument(
    documentId: string,
    tripId: string,
    payload: UpdateTripDocumentPayload,
    options: { localFile?: File | Blob | null; removeLocalFile?: boolean } = {}
  ): Promise<{ document: TripDocumentItem; message?: string }> {
    const requestVersion = getVersion(tripId);
    const existingDoc = getDocuments(tripId).find((item) => item.id === documentId);
    const effectiveCategory = payload.category ?? existingDoc?.category ?? 'OTHER';
    const isVisaPassport = effectiveCategory === 'VISA_PASSPORT';

    let validatedFileMeta:
      | { fileName: string; fileMimeType: string; fileSize: number }
      | null = null;

    if (!isVisaPassport && options.localFile) {
      validatedFileMeta = validateLocalAttachmentFile(options.localFile);
    }

    setDocumentMutating(documentId, true);
    try {
      const requestPayload: UpdateTripDocumentPayload = { ...payload };

      if (isVisaPassport) {
        requestPayload.referenceCode = '';
        requestPayload.removeAttachment = true;
        delete requestPayload.fileName;
        delete requestPayload.fileMimeType;
        delete requestPayload.fileSize;
      } else if (validatedFileMeta) {
        delete requestPayload.removeAttachment;
        requestPayload.fileName = validatedFileMeta.fileName;
        requestPayload.fileMimeType = validatedFileMeta.fileMimeType;
        requestPayload.fileSize = validatedFileMeta.fileSize;
      } else if (options.removeLocalFile || payload.removeAttachment === true) {
        requestPayload.removeAttachment = true;
        delete requestPayload.fileName;
        delete requestPayload.fileMimeType;
        delete requestPayload.fileSize;
      }

      const res = await documentService.updateTripDocument(documentId, requestPayload);
      let finalServerDoc = res.document;
      let localMetaUpdate:
        | { action: 'set'; meta: LocalDocumentFileSummary }
        | { action: 'remove' }
        | undefined;

      if (isVisaPassport || options.removeLocalFile || payload.removeAttachment === true) {
        await removeLocalAttachment(documentId).catch(() => {});
        localMetaUpdate = { action: 'remove' };
      } else if (options.localFile && validatedFileMeta) {
        try {
          const savedRecord = await saveLocalAttachment(documentId, tripId, options.localFile, {
            fileName: validatedFileMeta.fileName,
            fileMimeType: validatedFileMeta.fileMimeType,
          });
          localMetaUpdate = {
            action: 'set',
            meta: {
              fileName: savedRecord.fileName,
              fileMimeType: savedRecord.fileMimeType,
              fileSize: savedRecord.fileSize,
              updatedAt: savedRecord.updatedAt,
            },
          };
        } catch (vaultErr: any) {
          try {
            const rollbackRes = await documentService.updateTripDocument(documentId, {
              removeAttachment: true,
            });
            finalServerDoc = rollbackRes.document;
          } catch {
            // Ignore secondary rollback error
          }
          await removeLocalAttachment(documentId).catch(() => {});
          if (getVersion(tripId) === requestVersion) {
            upsertDocumentInState(tripId, finalServerDoc, { action: 'remove' });
          }
          throw new Error(
            vaultErr?.message || 'Не удалось сохранить локальный файл в браузере (IndexedDB)'
          );
        }
      }

      const merged =
        getVersion(tripId) === requestVersion
          ? upsertDocumentInState(tripId, finalServerDoc, localMetaUpdate)
          : mergeDocumentWithLocalFile(finalServerDoc, getLocalFiles(tripId));

      return {
        document: merged,
        message: res.message,
      };
    } finally {
      setDocumentMutating(documentId, false);
    }
  }

  async function attachLocalFile(
    documentId: string,
    tripId: string,
    file: File | Blob
  ): Promise<{ document: TripDocumentItem; message?: string }> {
    return updateDocument(documentId, tripId, {}, { localFile: file });
  }

  async function detachLocalFile(
    documentId: string,
    tripId: string
  ): Promise<{ document: TripDocumentItem; message?: string }> {
    return updateDocument(
      documentId,
      tripId,
      { removeAttachment: true },
      { removeLocalFile: true }
    );
  }

  async function deleteDocument(
    documentId: string,
    tripId: string
  ): Promise<{ deleted: boolean; id: string; message?: string }> {
    const requestVersion = getVersion(tripId);
    setDocumentMutating(documentId, true);

    try {
      const res = await documentService.deleteTripDocument(documentId);
      await removeLocalAttachment(documentId).catch(() => {});

      if (getVersion(tripId) === requestVersion) {
        const nextLocalMap = { ...(localFilesByTripId.value[tripId] ?? {}) };
        delete nextLocalMap[documentId];
        localFilesByTripId.value = {
          ...localFilesByTripId.value,
          [tripId]: nextLocalMap,
        };

        const nextList = (documentsByTripId.value[tripId] ?? []).filter(
          (doc) => doc.id !== documentId
        );
        documentsByTripId.value = {
          ...documentsByTripId.value,
          [tripId]: nextList,
        };
        summaryByTripId.value = {
          ...summaryByTripId.value,
          [tripId]: computeDocumentsSummary(nextList),
        };
      }

      return res;
    } finally {
      setDocumentMutating(documentId, false);
    }
  }

  async function clearTripLocalFiles(tripId: string): Promise<void> {
    await removeLocalAttachmentsByTrip(tripId).catch(() => {});
    if (tripId in localFilesByTripId.value) {
      const next = { ...localFilesByTripId.value };
      delete next[tripId];
      localFilesByTripId.value = next;
    }
  }

  function clearState() {
    const trackedTripIds = new Set([
      ...Object.keys(versionByTripId),
      ...Object.keys(documentsByTripId.value),
      ...Object.keys(summaryByTripId.value),
      ...Object.keys(localFilesByTripId.value),
      ...Object.keys(loadingByTripId.value),
      ...Object.keys(seedingByTripId.value),
      ...Object.keys(hasLoadedByTripId.value),
      ...Object.keys(errorByTripId.value),
      ...Object.keys(inFlightFetchByTripId),
    ]);

    for (const id of trackedTripIds) {
      versionByTripId[id] = getVersion(id) + 1;
      delete inFlightFetchByTripId[id];
    }

    documentsByTripId.value = {};
    summaryByTripId.value = {};
    localFilesByTripId.value = {};
    loadingByTripId.value = {};
    seedingByTripId.value = {};
    hasLoadedByTripId.value = {};
    errorByTripId.value = {};
    mutatingDocumentMap.value = {};
  }

  return {
    documentsByTripId,
    summaryByTripId,
    localFilesByTripId,
    loadingByTripId,
    seedingByTripId,
    hasLoadedByTripId,
    errorByTripId,
    mutatingDocumentMap,
    getDocuments,
    getSummary,
    getLocalFiles,
    getLocalFilesCount,
    isLoading,
    isSeeding,
    hasLoaded,
    getError,
    isDocumentMutating,
    fetchTripDocuments,
    seedDefaultDocuments,
    createDocument,
    updateDocument,
    attachLocalFile,
    detachLocalFile,
    deleteDocument,
    clearTripLocalFiles,
    clearState,
  };
});
