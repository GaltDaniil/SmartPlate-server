import UserModel, { UserTypes } from '../models/User.js';
import { telegramBot } from '../server.js';
import * as dotenv from 'dotenv';
import { customAlphabet } from 'nanoid';

import { Request, Response } from 'express';
import { RequestBody } from '../types/index.js';
import TelegramBot from 'node-telegram-bot-api';
import { Schema, Types } from 'mongoose';

dotenv.config();

interface AddNewUser {
    (
        data: TelegramBot.Message,
        queryData?: {
            referralCode: string;
            metrics: UserTypes['metrics'];
        },
    ): void;
}

export const addNewUser: AddNewUser = async (msg, queryData?) => {
    try {
        const userId = msg.chat.id;
        const alreadyUser = await UserModel.findOne({ userId: userId });
        if (!alreadyUser) {
            let referralCode = '';
            let metrics = new Object();
            if (queryData) {
                referralCode = queryData.referralCode;
                metrics = queryData.metrics;
            }
            const today = new Date();
            const freePeriod = new Date(today.getTime() + 259200000);
            const nanoid = customAlphabet('1234567890abcdifg', 8);
            const referalLink = nanoid();

            if (referralCode) {
                const refUser = await UserModel.findOne({
                    'referalSystem.link': referralCode,
                });
                if (refUser) {
                    const doc = new UserModel({
                        userId: userId,
                        name: msg.chat.first_name,
                        userName: msg.chat.username,
                        referalSystem: {
                            from: refUser!._id,
                            link: referalLink,
                        },
                        metrics: metrics,
                        subscription: {
                            isActive: false,
                            dateEnd: freePeriod,
                        },
                    });
                    await doc.save();
                    console.log('Пользователь создан с рефералом');
                } else {
                    const doc = new UserModel({
                        userId: userId,
                        name: msg.chat.first_name,
                        userName: msg.chat.username,
                        referalSystem: {
                            link: referalLink,
                        },
                        metrics: metrics,
                        subscription: {
                            isActive: false,
                            dateEnd: freePeriod,
                        },
                    });
                    await doc.save();
                    console.log('Пользователь создан, но ссылка на реферал битая');
                }
            } else {
                const doc = new UserModel({
                    userId: userId,
                    name: msg.chat.first_name,
                    userName: msg.chat.username,
                    referalSystem: {
                        link: referalLink,
                    },
                    metrics: metrics,
                    subscription: {
                        isActive: false,
                        dateEnd: freePeriod,
                    },
                });
                await doc.save();
                console.log('Пользователь создан без леферала');
            }
        } else {
            console.log('Пользователь уже существует');
        }
    } catch (error) {
        console.log(error);
    }
};
export const updateSubscribe = async (userId: string, amount: number | string) => {
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

        const user = await UserModel.findOne(filter);
        let lastDay: Date;
        let update = {};
        if (user) {
            const { userName, subscription } = user;
            if (subscription.dateEnd) {
                const dateEnd = new Date(subscription.dateEnd);

                if (today.getTime() > dateEnd.getTime()) {
                    lastDay = new Date(today.getTime() + days);
                } else {
                    lastDay = new Date(dateEnd.getTime() + days);
                }
            } else {
                lastDay = new Date(today.getTime() + days);
            }
            update = {
                $set: {
                    'subscription.isActive': true,
                    'subscription.dateEnd': lastDay,
                    isNotificationSent: false,
                },
                $push: { paymentInfo: { amount: amount, datePay: today } },
            };

            await UserModel.findOneAndUpdate(filter, update);
            return userName;
        }
    } catch (error) {
        console.log(error);
        console.log('Ошибка при продлении подписки');
    }
};
export const getInfo = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const userData = await UserModel.findOne({ userId: userId });

        res.status(200).json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};
export const getReferralInfo = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const user = await UserModel.findOne({ userId: userId });
        const _id = user?._id as Types.ObjectId;
        const referralSystem = user?.referralSystem;
        const referrals = await UserModel.find({ 'referralSystem.from': _id });
        res.status(200).json({ referralSystem, referrals });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};
export const getAll = async (req: Request, res: Response) => {
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
export const sendSupport = async (req: RequestBody, res: Response) => {
    try {
        const { userId, userName, userMessage, type } = req.body;

        const messageData = { message: userMessage, date: new Date(), type: type };

        const filter = { userId: userId };
        const update = {
            $push: { messages: messageData },
        };
        const option = { new: true };

        const updatedUser = await UserModel.findOneAndUpdate(filter, update, option);

        if (updatedUser) {
            telegramBot.sendMessage(
                299602933,
                `Пришло сообщение в поддержку от ${updatedUser.userName} с текстом: ${userMessage}`,
            );

            res.status(200);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка при доставке сообщения',
        });
    }
};

interface WithdrawData {
    userId?: number;
    amount: number;
    cardNumber: number;
    cardName: string;
    comment: string;
    type: string;
    date?: Date;
    status: 'Ожидается' | 'Выполнен' | 'Отмена';
}
export const sendWithdraw = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, amount, cardNumber, cardName, comment, type } = req.body as WithdrawData;

        const request: WithdrawData = {
            type,
            date: new Date(),
            comment,
            amount,
            cardNumber,
            cardName,
            status: 'Ожидается',
        };

        const filter = { userId: userId };
        const update = {
            $push: { 'referralSystem.withdrawRequests': request },
        };
        const option = { new: true };

        const updatedUser = await UserModel.findOneAndUpdate(filter, update, option);
        if (updatedUser) {
            telegramBot.sendMessage(
                299602933,
                `Пришел запрос на вывод от ${updatedUser.userName} на сумму: ${amount}`,
            );

            res.status(200).json(updatedUser);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка при доставке сообщения',
        });
    }
};

export const updateDb = async () => {
    try {
        function generateRandomString(length: number) {
            const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                result += characters.charAt(randomIndex);
            }
            return result;
        }

        const allUsers = await UserModel.find();
        if (allUsers) {
            console.log('finded all');
            allUsers.forEach(async (el) => {
                const code = generateRandomString(8);
                await UserModel.findByIdAndUpdate(
                    { _id: el._id },
                    { $set: { 'referralSystem.link': code } },
                );
            });
        }
    } catch (error) {
        console.log(error);
    }
};
