import { Router } from 'express';
import UserRouter from './UserRouter.js';

const router = new Router();

router.use('/users', UserRouter);

export default router;
