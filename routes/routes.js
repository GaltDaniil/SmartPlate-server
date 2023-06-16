import { Router } from 'express';
import UserRouter from './UserRouter.js';
import BotRouter from './BotRouter.js';
import PayRouter from './PayRouter.js';

const router = new Router();

router.use('/users', UserRouter);
router.use('/bots', BotRouter);
router.use('/pay', PayRouter);

export default router;
