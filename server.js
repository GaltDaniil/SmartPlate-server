import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './routes/routes.js';
import { subscribe, arraySession } from './controllers/UserController.js';
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
        'mongodb+srv://Linnik:9293709Bb13@cluster0.orylh2e.mongodb.net/smartPlate?retryWrites=true&w=majority',
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
        await subscribe(msg.chat);
        await telegramBot.sendMessage(
            chatId,
            '👋 Добро пожаловать в Smart Diet!\n \n🥑 Это уникальный онлайн-сервис, разработанный специально для нутрициологов и фитнес-тренеров, который умеет составлять сбалансированные рационы питания для снижения веса и вкусные рецепты.\n \n⏱ С нашим ботом вы сможете разрабатывать продукты, уделяя этому в десятки раз меньше времени, но сохраняя качество на высшем уровне.\n \n🧠 Бот учитывает все нюансы сбалансированного питания для снижения веса и сохранения здоровья.\n \n🎁 Мы зачислили вам на счет бонусные токены. Попробуйте составить рацион бесплатно прямо сейчас. 1 запрос = 1 токену.\n \n⬇️ Для этого нажмите в левой части экрана кнопку "Open"',
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
