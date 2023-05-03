import { Router } from 'express';
import * as UserController from '../controllers/UserController.js';

const router = new Router();

router.post('/sub', UserController.subscribe);
router.post('/unsub', UserController.unsubscribe);
router.post('/sendGpt', UserController.sendGpt);
router.post('/sendGpt2', UserController.sendGpt2);
router.get('/:id', UserController.getInfo);
router.post('/pay', UserController.pay);
router.get('/', UserController.getAll);
router.post('/sendSupport', UserController.sendSupport);

export default router;
