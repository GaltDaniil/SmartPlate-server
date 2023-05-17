import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './routes/routes.js';
import { addNewUser, arraySession } from './controllers/UserController.js';
import { askBot, stopBot } from './controllers/BotController.js';
import { answerTimer } from './middleware/botConnect.js';

dotenv.config();
const TG_TOKEN = process.env.TELEGRAM_TOKEN || '6067961898:AAGWa-_L2hbWbENFYpl9yEeJA-o8vNwTTzs';

export const telegramBot = new TelegramBot(TG_TOKEN, {
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
app.use(express.json());
app.use(cors());
app.use('/api', router);

telegramBot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === '/start') {
        await addNewUser(msg.chat);
        /* const userAvatars = await telegramBot.getUserProfilePhotos(chatId);
        if (userAvatars.total_count > 0) {
            const avatar = userAvatars.photos[0][0];
            console.log(avatar);
            const file = await telegramBot.getFile(avatar.file_id);
            console.log(file);
            const avatarUrl = `https://api.telegram.org/file/bot${TG_TOKEN}/${file.file_path}`;
            await subscribe(msg.chat, avatarUrl);
        } else {
            const avatarUrl = '';
            await subscribe(msg.chat, avatarUrl);
        } */
        //await subscribe(msg.chat);
        await telegramBot.sendMessage(
            chatId,
            '👋 Добро пожаловать!\n \n🥑 Это уникальный онлайн-сервис, разработанный специально для нутрициологов и фитнес-тренеров.\n \n⏱ С нашим ботом вы сможете разрабатывать продукты, уделяя этому в десятки раз меньше времени, но сохраняя качество на высшем уровне.\n \n🧠 На данный момент есть 2 бота:\n \n🥑 Бот-нутрициолог. Ответит на любой вопрос в сфере нутрициологии и здорового питания. Составит рацион, рассчитает КБЖУ, найдет информацию о любом продукте и поможет составить рецепты из них. \n \n🖌 Бот-копирайтер. За вас напишет любой текст на любую тему в нужной вам стилистике. Это может быть статья в блог, текст для рекламного объявления или рассылки, так же подскажет идеи для постов и проверит текст на ошибки и стилистику. \n \n 🎁  ⬇️ Начните общение с ботом-экспертом прямо сейчас нажав кнопку "Open"',
        );
    }

    /* const currentSession = await arraySession(msg.chat);
    if (currentSession.activeBot) {
        console.log('session is starting');
        askBot(chatId, text);
    } */
});

/* telegramBot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'end_session') {
        await stopBot(chatId);
    }
}); */

app.listen(8080, () => {
    console.log('server is ok on PORT ');
});
