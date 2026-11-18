import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../lib/errors';
import { createDocumentSchema, updateDocumentSchema } from '../schemas/document.schema';
import { DocumentService } from '../services/document.service';

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
      // Privacy-by-Design: бинарные данные файла отбрасываются на границе контроллера
      const { fileDataBase64: _ignoredFileData, ...safePayload } = parsed;
      const document = await DocumentService.createDocument(
        req.params.tripId,
        req.user!.id,
        safePayload
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
      // Privacy-by-Design: бинарные данные файла отбрасываются на границе контроллера
      const { fileDataBase64: _ignoredFileData, ...safePayload } = parsed;
      const document = await DocumentService.updateDocument(
        req.params.id,
        req.user!.id,
        safePayload
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
      await DocumentService.getDocumentAttachment(req.params.id, req.user!.id);
    } catch (err) {
      next(err);
    }
  }
}
