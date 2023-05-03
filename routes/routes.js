import { Router } from 'express';
import UserRouter from './UserRouter.js';
import BotRouter from './BotRouter.js';

const router = new Router();

router.use('/users', UserRouter);
router.use('/bots', BotRouter);

export default router;
