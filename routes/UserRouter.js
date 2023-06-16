import { Router } from 'express';
import * as UserController from '../controllers/UserController.js';
import { checkSubscribe } from '../middleware/checkSubscribe.js';

const router = new Router();

router.get('/:id', checkSubscribe, UserController.getInfo);
router.get('/', UserController.getAll);
router.post('/sendSupport', UserController.sendSupport);

export default router;
