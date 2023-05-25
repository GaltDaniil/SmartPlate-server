import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import UserModel from './models/User.js';

dotenv.config();

mongoose.set('strictQuery', false);
mongoose
    .connect(
        'mongodb+srv://Linnik:9293709Bb13@cluster0.orylh2e.mongodb.net/fitness_ikigai?retryWrites=true&w=majority',
    )
    .then(() => console.log('task-DB ok'))
    .catch((err) => console.log('task-DB error', err));

const TG_TOKEN = process.env.TELEGRAM_TOKEN || '6067961898:AAGWa-_L2hbWbENFYpl9yEeJA-o8vNwTTzs';

export const telegramBot = new TelegramBot(TG_TOKEN, {
    polling: false,
});

const notification = async () => {
    try {
        console.log('Старт функции');
        const users = await UserModel.find({
            $and: [
                {
                    $or: [
                        { 'subscription.dateEnd': { $lt: new Date() } },
                        { 'subscription.dateEnd': { $exists: false } },
                        { 'subscription.dateEnd': '' },
                    ],
                },
                { isNotificationSent: false },
            ],
        });

        users.forEach(async (el) => {
            console.log(el.userId);
            telegramBot.sendMessage(
                el.userId,
                'Подписка на Fitness Ikig.Ai - окончена. Чтобы продолжить пользоваться нашими ботами, пожалуйста продлите подписку в главном меню ❤️',
            );
            await UserModel.findOneAndUpdate(
                { userId: el.userId },
                { $set: { isNotificationSent: true } },
            );
        });
    } catch (error) {
        console.log(error);
        console.log('Ощибка при отправке уведомлений');
    }
};

setInterval(() => {
    notification();
}, 1000 * 60 * 60 * 24);

notification();
