import UserModel from '../models/User.js';
import { Configuration, OpenAIApi } from 'openai';
import { telegramBot } from '../server.js';
import mongoose from 'mongoose';

/* const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true }); */

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const subscribe = async (data, avatarUrl) => {
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
            max_tokens: 2700,
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
        console.log(error.response.data);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};

export const sendGpt2 = async (req, res) => {
    try {
        console.log(req.body);
        //const userId = req.body.user.id;
        const userId = req.body.userId;

        const filter = { userId: userId };
        const update = { $inc: { tokens: -1, diets: +1, requests: +1 } };
        const options = { new: true };
        const sonyaContent =
            'Возьми на себя роль эксперта в области Нутрициологии. Помоги составить сбалансированный рацион питания для похудения за счет жира и сохранения мышечной массы. Рассчитай КБЖУ каждой порции и в конце общий КБЖУ всего рациона. В рацион не добавляй жидкие калории, колбасные изделия и не совместимые друг с другом ингридиенты в одном приеме пищи.';

        const user = await UserModel.findOneAndUpdate(filter, update, options);

        const requestText = req.body.requestText;
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: sonyaContent }],
            temperature: 0.7,
            max_tokens: 2700,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        console.log(response);
        const message = response.data.choices[0].text;
        const response2 = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'assistant', content: message },
                { role: 'user', content: requestText },
            ],
            temperature: 0.7,
            max_tokens: 2700,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        const message2 = response2.data.choices[0].text;
        console.log(message2);

        telegramBot.sendMessage(userId, message2);
        res.status(200).json({
            massage: 'Рацион в процессе создания',
        });
    } catch (error) {
        console.log(error);
        console.log(error.response.data);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};

export const sendGptStartSonya = async (req, res) => {
    try {
        console.log(req.body);
        //const userId = req.body.user.id;
        const userId = req.body.userId;

        const filter = { userId: userId };
        const update = { $inc: { tokens: -1, diets: +1, requests: +1 } };
        const options = { new: true };

        const user = await UserModel.findOneAndUpdate(filter, update, options);

        const sonyaContent =
            'Возьми на себя роль эксперта в области здорового сна по имени Соня. Отвечай только на вопросы касающиеся своей области. Если будут вопросы в других сферах - извинись и скажи, что ты занимаешься только вопросами своей области. Если твой ответ не влазит в одно сообщение - предварительно попроси написать "Напишите продолжить для продолжения ответа" чтобы пользователь мог получить дальнейший текст в следующем сообщении';

        const requestText = req.body.requestText;
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            prompt: requestText,
            messages: [{ role: 'system', content: sonyaContent }],
            temperature: 0.7,
            max_tokens: 4000,
            //top_p: 1,
            //frequency_penalty: 0,
            //presence_penalty: 0,
        });
        const message = response.data.choices[0].text.trim();
        telegramBot.sendMessage(userId, message);
        res.status(200).json({
            massage: 'Соня готова',
        });
    } catch (error) {
        console.log(error);
        console.log(error.response.data);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};

export const sendGptUpdateSonya = async (req, res) => {
    try {
        console.log(req.body);
        //const userId = req.body.user.id;
        const userId = req.body.userId;

        const filter = { userId: userId };
        const update = { $inc: { tokens: -1, diets: +1, requests: +1 } };
        const options = { new: true };

        const user = await UserModel.findOneAndUpdate(filter, update, options);

        const requestText = req.body.requestText;
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            prompt: requestText,
            messages: [{ role: 'user', content: text }],
            temperature: 0.7,
            max_tokens: 4000,
            //top_p: 1,
            //frequency_penalty: 0,
            //presence_penalty: 0,
        });
        const message = response.data.choices[0].text.trim();
        telegramBot.sendMessage(userId, message);
        res.status(200).json({
            massage: 'Соня готова',
        });
    } catch (error) {
        console.log(error);
        console.log(error.response.data);
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
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
        //const userId = req.body.user.id;
        const userId = req.body.userId;
        const amount = req.body.amount;
        const tokens = req.body.tokens;

        console.log(req.body);

        const filter = { userId: userId };
        const payDate = new Date();
        const paymentInfo = { amount: amount, date: payDate };
        const update = { $inc: { tokens: +tokens }, $push: { paymentInfo: paymentInfo } };
        const options = { new: true };

        const user = await UserModel.findOneAndUpdate(filter, update, options);

        console.log(`Оплата прошла в размере ${amount} рублей. ${tokens} токенов начислено.`);

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
