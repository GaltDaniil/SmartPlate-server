import UserModel from '../models/User.js';
import { Configuration, OpenAIApi } from 'openai';
import { telegramBot } from '../server.js';
import mongoose from 'mongoose';

/* const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true }); */

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const addNewUser = async (data, avatarUrl) => {
    try {
        const userId = data.id;

        const alreadyUser = await UserModel.findOne({ userId: userId });
        if (!alreadyUser) {
            const doc = new UserModel({
                userId: data.id,
                name: data.first_name,
                userName: data.username,
                avatar: avatarUrl,
            });

            const user = await doc.save();
            console.log('Пользователь создан');
        }
        console.log('Пользователь существует');
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
        console.log(userData);

        res.status(200).json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};

export const pay = async (req, res) => {
    try {
        const userId = req.body.userId;
        const filter = { userId: userId };
        const amount = req.body.amount;
        const today = new Date();
        let days;
        if (amount === 299) {
            days = 2592000000;
        } else if (amount === 799) {
            days = 7776000000;
        } else {
            days = 15552000000;
        }
        //проверка наличия подписки на текущий момент

        const { subscription } = await UserModel.findOne(filter);

        let update = {};
        if (subscription.dateEnd) {
            //Если подписка уже закончилась
            if (today.getTime() > subscription.dateEnd.getTime()) {
                update = {
                    $set: {
                        'subscription.isActive': true,
                        'subscription.dateStart': today,
                        'subscription.dateEnd': new Date(today.getTime() + days),
                    },
                };
                await UserModel.findOneAndUpdate(filter, update);
            } else {
                update = {
                    $set: {
                        'subscription.isActive': true,
                        'subscription.dateEnd': new Date(subscription.dateEnd.getTime() + days),
                    },
                };
                await UserModel.findOneAndUpdate(filter, update);
            }
        } else {
            update = {
                $set: {
                    'subscription.isActive': true,
                    'subscription.dateStart': today,
                    'subscription.dateEnd': new Date(today.getTime() + days),
                },
            };
            await UserModel.findOneAndUpdate(filter, update);
        }

        console.log(`Оплата прошла в размере ${amount} рублей.`);

        res.status(200).json({
            massage: 'Оплата прошла успешно',
        });
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

        res.status(200).json(UpdatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка при доставке сообщения',
        });
    }
};
