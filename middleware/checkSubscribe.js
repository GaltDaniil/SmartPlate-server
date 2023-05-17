import UserModel from '../models/User.js';

export const checkSub = async (req, res, next) => {
    try {
        const userId = req.body.userId;

        const { subscription, createdAt } = await UserModel.findOne(userId);

        const today = new Date();
        const differenceInMs = today.getTime() - createdAt.getTime();
        const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

        if (differenceInDays <= 7) {
            next();
        } else {
            UserModel.findOneAndUpdate(
                { userId: userId },
                { $set: { 'subscription.freePeriod': false } },
            );
        }
        if (subscription.isActive) {
            next();
        }
        telegramBot.sendMessage(userId, 'Пробный период окончен, пожалуйста оплатите подписку.');
        return res.status(400).json({ message: 'Ошибка подписки' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Ошибка проверки подписки' });
    }
};
export const checkSub2 = async (userId) => {
    try {
        const { subscription, createdAt } = await UserModel.findOne(userId);

        const today = new Date();
        const differenceInMs = today.getTime() - createdAt.getTime();
        const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

        if (differenceInDays <= 7) {
            return true;
        } else {
            UserModel.findOneAndUpdate(
                { userId: userId },
                { $set: { 'subscription.freePeriod': false } },
            );
        }
        if (subscription.isActive) {
            return true;
        }
        return false;
    } catch (error) {
        console.log(error);
    }
};
