import UserModel from '../models/User.js';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import { telegramBot } from '../server.js';
import mongoose from 'mongoose';

dotenv.config();

/* const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true }); */

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const subscribe = async (data) => {
    try {
        const doc = new UserModel({
            userId: data.id,
            name: data.first_name,
            userName: data.username,
        });

        const user = await doc.save();
        console.log(user);
    } catch (error) {
        console.log(error);
    }
};

export const unsubscribe = async (req, res) => {
    try {
        console.log(req.body);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};

export const sendGpt = async (req, res) => {
    try {
        console.log(req.body);
        //const userId = req.body.user.id;
        const userId = req.body.userId;

        const filter = { userId: userId };
        const update = { $inc: { tokens: -1, diets: +1, requests: +1 } };
        const options = { new: true };

        const user = await UserModel.findOneAndUpdate(filter, update, options);

        const requestText = req.body.requestText;
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: requestText,
            // messages: [{ role: 'user', content: text }]
            temperature: 0.7,
            max_tokens: 3500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const message = response.data.choices[0].text.trim();
        telegramBot.sendMessage(userId, message);
        res.status(200).json({
            massage: 'Рацион в процессе создания',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};
export const getInfo = async (req, res) => {
    try {
        const userId = req.params.id;

        const userData = await UserModel.findOne({ userId: userId });
        console.log(userData);

        res.status(200).json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};
