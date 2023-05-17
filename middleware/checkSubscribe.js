import UserModel from '../models/User.js';

export const checkSub = async (userId) => {
    try {
        const { subscription, createdAt } = await UserModel.findOne(userId);

        const today = new Date();
        const differenceInMs = today.getTime() - createdAt.getTime();
        const differenceFreePeriodDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

        if (!subscription.freePeriod) {
            if (subscription.dateEnd) {
                const diffTarifInMs = today.getTime() - subscription.dateEnd.getTime();
                if (diffTarifInMs <= 0) {
                    return true;
                } else {
                    await UserModel.findOneAndUpdate(
                        { userId: userId },
                        { $set: { 'subscription.isActive': false } },
                    );
                    return false;
                }
            } else {
                return false;
            }
        } else if (differenceFreePeriodDays <= 3) {
            return true;
        } else {
            await UserModel.findOneAndUpdate(
                { userId: userId },
                { $set: { 'subscription.freePeriod': false } },
            );
            return false;
        }
    } catch (error) {
        console.log(error);
    }
};
