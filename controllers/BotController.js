import UserModel from '../models/User.js';
import { Configuration, OpenAIApi } from 'openai';
import { telegramBot } from '../server.js';
import { session } from 'telegraf';
import { answerTimer, startTimer } from '../middleware/botConnect.js';

const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

export const startBot = async (req, res) => {
    try {
        const userId = req.body.userId;
        const bot = req.body.bot;
        const systemData = req.body.system;

        const filter = { userId: userId };
        const update = {
            $set: { 'chatSession.activeBot': bot },
            $push: { 'chatSession.session': { role: 'system', content: systemData } },
        };
        const options = { new: true };

        const { chatSession, userName } = await UserModel.findOneAndUpdate(filter, update, options);
        telegramBot.sendMessage(userId, 'Эксперт уже спешит присоединиться к вашей сессии...');

        console.log(chatSession);
        console.log(userName);
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: chatSession.session,
            max_tokens: 200,
        });

        //const message = response.data.choices[0].text.trim();
        const chatMessage = response.data.choices[0].message;
        await UserModel.findOneAndUpdate(
            filter,
            { $push: { 'chatSession.session': chatMessage } },
            options,
        );
        const button = {
            reply_markup: {
                inline_keyboard: [[{ text: 'Завершить сессию', callback_data: 'end_session' }]],
            },
        };

        telegramBot.sendMessage(userId, chatMessage.content, button);

        startTimer(userId)
            .then((answer) => {
                askBot(userId, answer);
            })
            .catch(async (error) => {
                if (error.message === 'Close') {
                    stopBot(error.id);
                } else {
                    const filter = { userId: error.id };
                    const update = { $set: { chatSession: { activeBot: '', session: [] } } };
                    await UserModel.findOneAndUpdate(filter, update, options);
                }
            });
    } catch (error) {
        console.log(error);
        console.log(error.response.data);
        console.log('Ошибка при старте бота');
        res.status(500).json({
            massage: 'Ошибка со стороны сервера',
        });
    }
};

export const askBot = async (userId, text) => {
    try {
        const filter = { userId: userId };
        const options = { new: true };

        //Проверка на наличие токенов у пользователя

        const { tokens, chatSession } = await UserModel.findOne(filter);
        if (tokens < 1) {
            telegramBot.sendMessage(
                userId,
                'У вас закончились токены 😞 Пожалуйста, пополните баланс.',
            );
            return await stopBot(userId);
        }

        telegramBot.sendChatAction(userId, 'typing');

        // Проверка на количество объектов в массиве

        if (chatSession.session.length > 12) {
            console.log('Уменьшение массива сообщений');
            chatSession.session.splice(1, 2);
            chatSession.session.push({ role: 'user', content: text });
            await UserModel.findOneAndUpdate(
                filter,
                { $set: { 'chatSession.session': chatSession.session } },
                options,
            );
        } else {
            chatSession.session.push({ role: 'user', content: text });
            await UserModel.findOneAndUpdate(
                filter,
                { $set: { 'chatSession.session': chatSession.session } },
                options,
            );
        }

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: chatSession.session,
        });

        const chatMessage = response.data.choices[0].message;

        await UserModel.findOneAndUpdate(
            filter,
            { $push: { 'chatSession.session': chatMessage } },
            options,
        );

        const button = {
            reply_markup: {
                inline_keyboard: [[{ text: 'Завершить сессию', callback_data: 'end_session' }]],
            },
        };
        telegramBot.sendMessage(userId, chatMessage.content, button);

        answerTimer(userId)
            .then((answer) => {
                askBot(userId, answer);
            })
            .catch(async (error) => {
                if (error.message === 'Close') {
                    stopBot(error.id);
                } else {
                    const update = { $set: { chatSession: { activeBot: '', session: [] } } };
                    await UserModel.findOneAndUpdate(filter, update, options);
                }
            });
    } catch (error) {
        console.log(error);
        console.log(error.response.data);
        console.log(error.response.data.error.message);
        res.status(500).json({
            massage: 'Ошибка при отправке запроса в бота',
        });
    }
};

export const stopBot = async (userId) => {
    try {
        const filter = { userId: userId };
        const update = { $set: { chatSession: { activeBot: '', session: [] } } };
        const options = { new: true };

        await UserModel.findOneAndUpdate(filter, update, options);

        telegramBot.sendMessage(userId, 'Спасибо вам за приятную беседу) До скорых встреч. 👋');
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: 'Ошибка при зактытии бота',
        });
    }
};
