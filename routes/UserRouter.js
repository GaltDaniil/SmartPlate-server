import { Router } from 'express';
import * as UserController from '../controllers/UserController.js';

const router = new Router();

router.post('/sub', UserController.subscribe);
router.post('/unsub', UserController.unsubscribe);
router.post('/send', UserController.sendGpt);
router.get('/:id', UserController.getInfo);

export default router;
