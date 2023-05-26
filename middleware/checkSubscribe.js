import UserModel from '../models/User.js';

export const checkSubscribe = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { subscription } = await UserModel.findOne({ userId });

        const today = new Date();
        const dateEnd = new Date(subscription.dateEnd);

        if (subscription.dateEnd) {
            const diffTarifInMs = today.getTime() - dateEnd.getTime();
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
