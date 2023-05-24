import UserModel from '../models/User.js';
import { telegramBot } from '../server.js';

export const notification = async () => {
    try {
        const users = await UserModel.find({
            'subscription.dateEnd': { $lt: new Date() },
            isNotificationSent: false,
        });

        users.forEach(async (el) => {
            telegramBot.sendMessage(
                el.userId,
                'Подписка на Fitness Ikig.Ai - окончена. Чтобы продолжить пользоваться нашими ботами, пожалуйста продлите подписку ❤️',
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

export const checkSubscribe = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { subscription } = await UserModel.findOne({ userId });

        const today = new Date();

        if (subscription.dateEnd) {
            const diffTarifInMs = today.getTime() - subscription.dateEnd.getTime();
            if (diffTarifInMs <= 0) {
                next();
            } else {
                await UserModel.findOneAndUpdate(
                    { userId: userId },
                    { $set: { 'subscription.isActive': false } },
                );
                next();
            }
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Ошибка в функции при проверке подписки' });
    }
};
