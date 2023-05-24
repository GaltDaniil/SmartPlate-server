import { Router } from 'express';
import * as BotController from '../controllers/BotController.js';
import { checkChatSession, chooseBot } from '../middleware/botConnect.js';

const router = new Router();

router.post('/startBot', chooseBot, checkChatSession, BotController.startBot);

export default router;
