import { Router } from 'express';
import { createMessage, getMessages } from '../controllers/Message.controller.js';

const router = Router();

router.post('/message', createMessage);
router.get('/messages', getMessages);
router.get('/message?:id', () => {});
router.put('/messages', () => {});
router.delete('/messages', () => {});

export default router;
