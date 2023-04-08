import UserModel from '../models/User.js';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import { telegramBot } from '../server.js';
import mongoose from 'mongoose';
import axios from 'axios';

dotenv.config();

/* const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true }); */

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const subscribe = async (req, res) => {
    try {
        console.log(req);
        const userId = req.id;
        const alreadyUser = UserModel.findOne({ userId: userId });

        if (!alreadyUser) {
            const doc = new UserModel({
                userId: data.id,
                name: data.first_name,
                userName: data.username,
            });

            const user = await doc.save();
        }
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

export const pay30 = async (req, res) => {
    try {
        //const userId = req.body.user.id;
        const userId = req.body.userId;
        const userPayInfo = req.body.info;

        const filter = { userId: userId };
        const update = { $inc: { tokens: 30 }, $push: { paymentInfo: userPayInfo } };
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
export const test = async (req, res) => {
    try {
        /* console.log(req.query);

        const counter = '51944414';
        const url =
            'https://api-metrika.yandex.net/management/v1/counter/' +
            counter +
            '/offline_conversions/upload?client_id_type=CLIENT_ID';
        const token = 'OAuth y0_AgAAAAANC5vZAAmpJwAAAADgayz1NvP4VW0fT-OpO6EZ7cLgc5Q0Cw0';

        const data = {
            ClientId: req.query.uclid,
            Target: 'nutri_2990',
            DateTime: req.query.date,
            Price: '2990',
            Currency: 'RUB',
        };

        // Получаем ключи объекта в виде массива
        const headers = Object.keys(data);

        // Получаем значения объекта в виде массива
        const values = Object.values(data);

        // Объединяем ключи и значения в один массив
        const rows = [headers.join(','), values.join(',')];

        // Преобразуем массив в строку CSV
        const csvData = rows.join('\n');

        console.log(csvData);

        // Создание объекта FormData и добавление данных в него
        const formData = new FormData();

        formData.append('file', new Blob([csvData], { type: 'text/csv' }), 'data.csv');

        const response = await axios.post(url, formData, {
            headers: {
                Authorization: token,
                'Content-Type': 'multipart/form-data',
            },
        });
 */
        res.status(200).json({
            massage: 'тест пройден',
        });
    } catch (error) {
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};
