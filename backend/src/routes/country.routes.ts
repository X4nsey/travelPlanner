import { Router } from 'express';
import { CountryController } from '../controllers/country.controller';

const router = Router();

router.get('/', CountryController.list);
router.get('/:slug', CountryController.getBySlug);
router.get('/:slug/photos', CountryController.getPhotos);

export default router;
