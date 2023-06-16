import { Router } from 'express';
import * as PayController from '../controllers/PayController.js';
import { checkSubscribe } from '../middleware/checkSubscribe.js';

const router = new Router();

router.post('/pay', PayController.successCloudpayments);
router.post('/create-payment', PayController.createPayPal);
router.get('/success-payment', PayController.successPayPal);
router.post('/decline-payment', PayController.declinePayPal);

export default router;
