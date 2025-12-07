import { Router } from 'express';
import { getTransactions, getFilters } from '../controllers/salesController.js';

const router = Router();

router.get('/', getTransactions);
router.get('/filters', getFilters);

export default router;
