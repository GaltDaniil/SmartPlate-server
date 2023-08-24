import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

import cors from 'cors';
import mongoose from 'mongoose';
import router from './routes/routes.js';
import { addNewUser } from './controllers/UserController.js';
import { handlerStartCommand, handlerStartCommandWithParams } from './controllers/StartCommands.js';
import { createChat, createMessage, getChat, ioCreateChat } from './controllers/Chat.controller.js';

dotenv.config();

const { TELEGRAM_TOKEN, PORT } = process.env;

export const telegramBot = new TelegramBot(TELEGRAM_TOKEN as string, {
    polling: true,
});

mongoose.set('strictQuery', false);
mongoose
    .connect(
        'mongodb+srv://Linnik:9293709Bb13@cluster0.orylh2e.mongodb.net/fitness_ikigai?retryWrites=true&w=majority',
    )
    .then(() => console.log('DB ok'))
    .catch((err) => console.log('DB error', err));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:8080', 'http://localhost:3000'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
});

app.use(cors());
app.use(express.json());
app.use('/api', router);

telegramBot.onText(/\/start(.+)/, handlerStartCommandWithParams);
telegramBot.onText(/\/start$/, handlerStartCommand);

io.on('connection', (socket: Socket) => {
    socket.on('create', async (data) => {
        console.log('socket create');
    });
    socket.on('join', async (data) => {
        console.log('socket join');
        socket.join(data.beechat_session);
    });

    socket.on('message', async (data) => {
        console.log('socket message');
        await createMessage(data);
        io.to(data.beechat_session).emit('message', data);
    });
});

httpServer.listen(PORT, () => {
    console.log(`server is ok on PORT ${PORT}`);
});
