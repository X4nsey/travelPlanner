import { Router } from 'express';
import { CountryController } from '../controllers/country.controller';

const router = Router();

router.get('/', CountryController.list);
router.get('/diagnostics/photos', CountryController.getPhotoDiagnostics);
router.post('/diagnostics/photos/replace', CountryController.replacePhoto);
router.post('/diagnostics/photos/reset', CountryController.resetPhoto);
router.post('/diagnostics/photos/reverify', CountryController.reverifyPhoto);
router.post('/diagnostics/photos/wikimedia-search', CountryController.autoSearchWikimedia);
router.get('/:slug', CountryController.getBySlug);
router.get('/:slug/photos', CountryController.getPhotos);

export default router;
