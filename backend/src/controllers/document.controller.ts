import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/errors';
import { createDocumentSchema, updateDocumentSchema } from '../schemas/document.schema';
import { DocumentService } from '../services/document.service';

function buildAsciiFallbackFileName(fileName: string): string {
  const extMatch = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '';
  const stem = ext ? fileName.slice(0, -ext.length) : fileName;
  const asciiStem = stem
    .replace(/[^\x20-\x7E]/g, '_')
    .replace(/["\\;/\r\n]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_\s]+|[_\s]+$/g, '');
  return `${asciiStem || 'attachment'}${ext}`;
}

export class DocumentController {
  static async listByTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DocumentService.listByTrip(req.params.tripId, req.user!.id);
      return sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  static async createForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createDocumentSchema.parse(req.body ?? {});
      const document = await DocumentService.createDocument(
        req.params.tripId,
        req.user!.id,
        parsed
      );
      return sendSuccess(res, { document }, 201, 'Документ добавлен');
    } catch (err) {
      next(err);
    }
  }

  static async seedDefaultsForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DocumentService.seedDefaultChecklist(req.params.tripId, req.user!.id);
      const message =
        result.addedCount > 0
          ? `Базовый чек-лист документов заполнен (добавлено позиций: ${result.addedCount})`
          : 'Все базовые документы уже добавлены';
      return sendSuccess(res, result, 200, message);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateDocumentSchema.parse(req.body ?? {});
      const document = await DocumentService.updateDocument(
        req.params.id,
        req.user!.id,
        parsed
      );
      return sendSuccess(res, { document }, 200, 'Документ обновлён');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DocumentService.deleteDocument(req.params.id, req.user!.id);
      return sendSuccess(res, result, 200, 'Документ удалён');
    } catch (err) {
      next(err);
    }
  }

  static async getAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const attachment = await DocumentService.getDocumentAttachment(
        req.params.id,
        req.user!.id
      );

      if (req.query.format === 'json') {
        return sendSuccess(res, { attachment }, 200);
      }

      const buffer = Buffer.from(attachment.fileDataBase64, 'base64');
      const isDownload = req.query.download === '1' || req.query.download === 'true';
      const disposition = isDownload ? 'attachment' : 'inline';
      const fallbackAscii = buildAsciiFallbackFileName(attachment.fileName);
      const encodedUtf8 = encodeURIComponent(attachment.fileName).replace(
        /['()*]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
      );

      res.setHeader('Content-Type', attachment.fileMimeType);
      res.setHeader('Content-Length', String(buffer.length));
      res.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${fallbackAscii}"; filename*=UTF-8''${encodedUtf8}`
      );
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
      res.setHeader('Cache-Control', 'private, no-store');

      return res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  }
}
