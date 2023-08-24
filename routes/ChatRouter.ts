import { Router } from 'express';
import { createChat, getAllChats } from '../controllers/Chat.controller.js';

const router = Router();

router.post('/chat', createChat);
router.get('/chats', getAllChats);
router.get('/chats/:id', () => {});
router.put('/chats/:id', () => {});
router.delete('/chats/:id', () => {});

export default router;
