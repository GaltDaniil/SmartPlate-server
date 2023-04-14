import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './routes/routes.js';
import { subscribe } from './controllers/UserController.js';

dotenv.config();
const TG_TOKEN = process.env.TELEGRAM_TOKEN || '6190338160:AAFj9p1BCGiUMLHjSVn7VTrmUAaY5vsBwEY';

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
        await subscribe(msg.chat);
        await telegramBot.sendMessage(
            chatId,
            '👋 Добро пожаловать в Smart Plate.\n \n🥗 Это уникальный онлайн-сервис, разработанный специально для фитнес тренеров и нутрициологов, которые хотят предоставлять своим клиентам индивидуальные рационы питания.\n \n🎛 Сервис предоставляет простой и эффективный инструмент, который помогает составлять оптимальные рационы питания, учитывая особенности клиента, его физическую активность, цели и предпочтения.\n \n🎁 Мы зачислили вам на счет бонусные токены. Попробуйте составить рацион прямо сейчас.\n \n⬇️ Для этого нажмите в левой части экрана на кнопку "Menu"',
            /* {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Запрос рациона',
                                web_app: {
                                    url: 'https://smartdietai.ru/',
                                },
                            },
                        ],
                    ],
                },
            }, */
        );
    }
});

app.listen(8080, () => {
    console.log('server is ok on PORT ');
});
