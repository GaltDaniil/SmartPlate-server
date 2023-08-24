import UserModel from '../models/User.js';
import { Middleware } from '../types/index.js';

export const checkSubscribe: Middleware = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findOne({ userId });
        if (user) {
            const today = new Date();
            const dateEnd = new Date(user.subscription.dateEnd);

            if (user.subscription.dateEnd) {
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
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Ошибка в функции при проверке подписки' });
    }
};
