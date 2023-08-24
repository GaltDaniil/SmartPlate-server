import { Router } from 'express';
import UserRouter from './UserRouter.js';
import BotRouter from './BotRouter.js';
import PayRouter from './PayRouter.js';
import ChatRouter from './ChatRouter.js';

const router = Router();

router.use('/users', UserRouter);
router.use('/bots', BotRouter);
router.use('/pay', PayRouter);
router.use('/beechat', ChatRouter);

export default router;
