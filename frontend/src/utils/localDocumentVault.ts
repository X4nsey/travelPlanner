import type { AllowedDocumentMimeType, LocalDocumentFileSummary } from '@/types';

export const LOCAL_DOCUMENTS_DB_NAME = 'travelplanner_local_documents_v1';
export const LOCAL_DOCUMENTS_STORE_NAME = 'attachments';
export const LOCAL_DOCUMENTS_DB_VERSION = 1;

export const ALLOWED_LOCAL_ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const satisfies readonly AllowedDocumentMimeType[];

export const MAX_LOCAL_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 МБ

export interface LocalAttachmentRecord extends LocalDocumentFileSummary {
  documentId: string;
  tripId: string;
  blob: Blob;
}

const MIME_DEFAULT_EXTENSIONS: Record<AllowedDocumentMimeType, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const EXTENSION_TO_MIME: Record<string, AllowedDocumentMimeType> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function isAllowedMime(val: string): val is AllowedDocumentMimeType {
  return (ALLOWED_LOCAL_ATTACHMENT_MIME_TYPES as readonly string[]).includes(val);
}

function normalizeMimeType(rawMime: string | undefined | null, fileName?: string): AllowedDocumentMimeType | null {
  const normalized = (rawMime || '').trim().toLowerCase();
  if (normalized === 'image/jpg') {
    return 'image/jpeg';
  }
  if (normalized) {
    return isAllowedMime(normalized) ? normalized : null;
  }

  // Fallback to extension only if the browser did not provide a MIME type
  if (fileName) {
    const extMatch = /\.([a-zA-Z0-9]+)$/.exec(fileName.trim());
    if (extMatch) {
      return EXTENSION_TO_MIME[extMatch[1].toLowerCase()] ?? null;
    }
  }

  return null;
}

export function sanitizeLocalFileName(
  rawName: string | undefined | null,
  mimeType: AllowedDocumentMimeType
): string {
  const ext = MIME_DEFAULT_EXTENSIONS[mimeType];
  const fallback = mimeType === 'application/pdf' ? `document.${ext}` : `image.${ext}`;

  if (!rawName) return fallback;

  const base = rawName.split(/[/\\]/).pop() ?? '';
  const cleaned = base
    .replace(/[\x00-\x1f\x7f<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 255);

  return cleaned || fallback;
}

export function validateLocalAttachmentFile(
  file: File | Blob,
  meta?: { fileName?: string; fileMimeType?: string }
): {
  fileName: string;
  fileMimeType: AllowedDocumentMimeType;
  fileSize: number;
} {
  const rawName = meta?.fileName ?? ('name' in file ? file.name : undefined);
  const rawMime = meta?.fileMimeType ?? file.type;
  const resolvedMime = normalizeMimeType(rawMime, rawName);

  if (!resolvedMime) {
    throw new Error('Поддерживаются только файлы форматов PDF, JPEG, PNG и WEBP.');
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new Error('Выбранный файл пуст. Пожалуйста, выберите другой файл.');
  }

  if (file.size > MAX_LOCAL_ATTACHMENT_BYTES) {
    throw new Error('Размер файла не должен превышать 10 МБ.');
  }

  return {
    fileName: sanitizeLocalFileName(rawName, resolvedMime),
    fileMimeType: resolvedMime,
    fileSize: Math.trunc(file.size),
  };
}

export function formatAttachmentFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes <= 0) {
    return '0 Б';
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} Б`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1).replace(/\.0$/, '')} КБ`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2).replace(/\.?0+$/, '')} МБ`;
}

function isIndexedDbSupported(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openVaultDb(): Promise<IDBDatabase> {
  if (!isIndexedDbSupported()) {
    return Promise.reject(
      new Error('Локальное хранилище браузера (IndexedDB) недоступно в текущей среде.')
    );
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DOCUMENTS_DB_NAME, LOCAL_DOCUMENTS_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(LOCAL_DOCUMENTS_STORE_NAME)) {
        store = db.createObjectStore(LOCAL_DOCUMENTS_STORE_NAME, { keyPath: 'documentId' });
      } else {
        store = request.transaction!.objectStore(LOCAL_DOCUMENTS_STORE_NAME);
      }
      if (!store.indexNames.contains('by_tripId')) {
        store.createIndex('by_tripId', 'tripId', { unique: false });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
      };
      resolve(db);
    };

    request.onerror = () => {
      reject(
        request.error ||
          new Error('Не удалось открыть локальное хранилище документов в браузере (IndexedDB).')
      );
    };

    request.onblocked = () => {
      reject(
        new Error(
          'Локальное хранилище IndexedDB заблокировано другой вкладкой. Закройте дублирующие вкладки и попробуйте снова.'
        )
      );
    };
  });
}

function promisifyRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Ошибка операции IndexedDB'));
  });
}

function awaitTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error('Транзакция IndexedDB прервана'));
    tx.onerror = () => reject(tx.error || new Error('Ошибка транзакции IndexedDB'));
  });
}

export async function saveLocalAttachment(
  documentId: string,
  tripId: string,
  file: File | Blob,
  meta?: { fileName?: string; fileMimeType?: string }
): Promise<LocalAttachmentRecord> {
  const validated = validateLocalAttachmentFile(file, meta);
  const storedBlob =
    file.type === validated.fileMimeType
      ? file.slice(0, file.size, validated.fileMimeType)
      : new Blob([file], { type: validated.fileMimeType });

  const record: LocalAttachmentRecord = {
    documentId,
    tripId,
    fileName: validated.fileName,
    fileMimeType: validated.fileMimeType,
    fileSize: validated.fileSize,
    updatedAt: new Date().toISOString(),
    blob: storedBlob,
  };

  const db = await openVaultDb();
  try {
    const tx = db.transaction(LOCAL_DOCUMENTS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(LOCAL_DOCUMENTS_STORE_NAME);
    store.put(record);
    await awaitTransaction(tx);
    return record;
  } finally {
    db.close();
  }
}

export async function getLocalAttachment(documentId: string): Promise<LocalAttachmentRecord | null> {
  if (!isIndexedDbSupported()) {
    return null;
  }

  const db = await openVaultDb();
  try {
    const tx = db.transaction(LOCAL_DOCUMENTS_STORE_NAME, 'readonly');
    const store = tx.objectStore(LOCAL_DOCUMENTS_STORE_NAME);
    const result = await promisifyRequest<LocalAttachmentRecord | undefined>(store.get(documentId));
    if (!result || !result.blob) {
      return null;
    }
    return result;
  } finally {
    db.close();
  }
}

export async function removeLocalAttachment(documentId: string): Promise<void> {
  if (!isIndexedDbSupported()) {
    return;
  }

  const db = await openVaultDb();
  try {
    const tx = db.transaction(LOCAL_DOCUMENTS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(LOCAL_DOCUMENTS_STORE_NAME);
    store.delete(documentId);
    await awaitTransaction(tx);
  } finally {
    db.close();
  }
}

export async function listLocalAttachmentIdsByTrip(
  tripId: string
): Promise<Record<string, LocalDocumentFileSummary>> {
  if (!isIndexedDbSupported() || !tripId) {
    return {};
  }

  const db = await openVaultDb();
  try {
    const tx = db.transaction(LOCAL_DOCUMENTS_STORE_NAME, 'readonly');
    const store = tx.objectStore(LOCAL_DOCUMENTS_STORE_NAME);

    let records: LocalAttachmentRecord[];
    if (store.indexNames.contains('by_tripId')) {
      const index = store.index('by_tripId');
      records = await promisifyRequest<LocalAttachmentRecord[]>(index.getAll(tripId));
    } else {
      const all = await promisifyRequest<LocalAttachmentRecord[]>(store.getAll());
      records = all.filter((rec) => rec.tripId === tripId);
    }

    const map: Record<string, LocalDocumentFileSummary> = {};
    for (const rec of records) {
      if (rec && rec.documentId && rec.blob) {
        map[rec.documentId] = {
          fileName: rec.fileName,
          fileMimeType: rec.fileMimeType,
          fileSize: rec.fileSize,
          updatedAt: rec.updatedAt,
        };
      }
    }
    return map;
  } catch {
    return {};
  } finally {
    db.close();
  }
}

export async function removeLocalAttachmentsByTrip(tripId: string): Promise<void> {
  if (!isIndexedDbSupported() || !tripId) {
    return;
  }

  const existing = await listLocalAttachmentIdsByTrip(tripId);
  const ids = Object.keys(existing);
  if (ids.length === 0) return;

  const db = await openVaultDb();
  try {
    const tx = db.transaction(LOCAL_DOCUMENTS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(LOCAL_DOCUMENTS_STORE_NAME);
    for (const id of ids) {
      store.delete(id);
    }
    await awaitTransaction(tx);
  } finally {
    db.close();
  }
}

export async function clearAllLocalAttachments(): Promise<void> {
  if (!isIndexedDbSupported()) {
    return;
  }

  const db = await openVaultDb();
  try {
    const tx = db.transaction(LOCAL_DOCUMENTS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(LOCAL_DOCUMENTS_STORE_NAME);
    store.clear();
    await awaitTransaction(tx);
  } finally {
    db.close();
  }
}
