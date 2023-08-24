import { Router } from 'express';
import * as PayController from '../controllers/PayController.js';

const router = Router();

router.post('/cloudPayments', PayController.successCloudpayments);
router.post('/create-payment', PayController.createPayPal);
router.get('/success-payment', PayController.successPayPal);
router.post('/decline-payment', PayController.declinePayPal);

export default router;
