import { Router } from 'express';
import * as UserController from '../controllers/UserController.js';
import { checkSubscribe } from '../middleware/checkSubscribe.js';

const router = Router();

router.get('/', UserController.getAll);
router.get('/:id', checkSubscribe, UserController.getInfo);
router.get('/referrals/:id', UserController.getReferralInfo);
router.post('/sendSupport', UserController.sendSupport);
router.post('/sendWithdraw', UserController.sendWithdraw);
router.post('/updateDb', UserController.updateDb);

export default router;
