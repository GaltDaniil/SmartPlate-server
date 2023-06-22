import UserModel from '../models/User.js';
import { Configuration, OpenAIApi } from 'openai';
import { telegramBot } from '../server.js';
import paypal from 'paypal-rest-sdk';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const addNewUser = async (data, avatarUrl) => {
    try {
        const userId = data.id;
        const today = new Date();
        const freePeriod = new Date(today.getTime() + 259200000);
        console.log(today);
        console.log(freePeriod);

        const alreadyUser = await UserModel.findOne({ userId: userId });
        if (!alreadyUser) {
            const doc = new UserModel({
                userId: data.id,
                name: data.first_name,
                userName: data.username,
                avatar: avatarUrl,
                subscription: {
                    isActive: false,
                    dateEnd: freePeriod,
                },
            });

            const user = await doc.save();
            console.log('Пользователь создан');
        } else {
            console.log('Пользователь существует');
        }
    } catch (error) {
        console.log(error);
    }
};
export const arraySession = async (data) => {
    try {
        const userId = data.id;

        const { chatSession } = await UserModel.findOne({ userId: userId });

        return chatSession;
    } catch (error) {
        console.log(error);
    }
};

export const updateSubscribe = async (userId, amount) => {
    try {
        const filter = { userId };
        const today = new Date();
        let days;
        if (amount == 299) {
            days = 2592000000;
        } else if (amount == 699) {
            days = 7776000000;
        } else {
            days = 15552000000;
        }
        //проверка наличия подписки на текущий момент

        const { userName, subscription } = await UserModel.findOne(filter);

        let update = {};

        if (subscription.dateEnd) {
            const dateEnd = new Date(subscription.dateEnd);
            if (today.getTime() > dateEnd.getTime()) {
                update = {
                    $set: {
                        'subscription.isActive': true,
                        'subscription.dateEnd': new Date(today.getTime() + days),
                        isNotificationSent: false,
                    },
                    $push: { paymentInfo: { amount: amount, date: today } },
                };
                await UserModel.findOneAndUpdate(filter, update);
            } else {
                update = {
                    $set: {
                        'subscription.isActive': true,
                        'subscription.dateEnd': new Date(dateEnd.getTime() + days),
                        isNotificationSent: false,
                    },
                    $push: { paymentInfo: { amount: amount, datePay: today } },
                };
                await UserModel.findOneAndUpdate(filter, update);
            }
        } else {
            update = {
                $set: {
                    'subscription.isActive': true,
                    'subscription.dateEnd': new Date(today.getTime() + days),
                    isNotificationSent: false,
                },
                $push: { paymentInfo: { amount: amount, datePay: today } },
            };
            await UserModel.findOneAndUpdate(filter, update);
        }
        return userName;
    } catch (error) {
        console.log(error);
        console.log('Ошибка при продлении подписки');
    }
};

export const getInfo = async (req, res) => {
    try {
        const userId = req.params.id;

        const userData = await UserModel.findOne({ userId: userId });

        res.status(200).json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};
export const getAll = async (req, res) => {
    try {
        const userData = await UserModel.find();

        res.status(200).json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};

export const sendSupport = async (req, res) => {
    try {
        const { userId, userMessage, type } = req.body;

        const messageData = { message: userMessage, date: new Date(), type: type };

        const filter = { userId: userId };
        const update = {
            $push: { messages: messageData },
        };
        const option = { new: true };

        const UpdatedUser = await UserModel.findOneAndUpdate(filter, update, option);

        telegramBot.sendMessage(
            299602933,
            `Пришло сообщение в поддержку от ${userName} с текстом: ${userMessage}`,
        );

        res.status(200).json(UpdatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка при доставке сообщения',
        });
    }
};
