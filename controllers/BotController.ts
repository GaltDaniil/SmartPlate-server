import UserModel from '../models/User.js';
import {
    ChatCompletionRequestMessage,
    ChatCompletionResponseMessage,
    Configuration,
    OpenAIApi,
} from 'openai';
import { telegramBot } from '../server.js';
import { answerTimer, startTimer } from '../middleware/botConnect.js';
import { RequestBody } from '../types/index.js';
import { Request, Response } from 'express';

const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

export const startBot = async (req: RequestBody, res: Response) => {
    const userId = req.body.userId;
    try {
        const bot = req.body.bot;
        const systemData = req.body.system;

        const filter = { userId: userId };
        const update = {
            $set: { 'chatSession.activeBot': bot },
            $push: { 'chatSession.session': { role: 'system', content: systemData } },
        };
        const options = { new: true };

        const user = await UserModel.findOneAndUpdate(filter, update, options);

        if (user) {
            telegramBot.sendMessage(userId, 'Эксперт уже спешит присоединиться к вашей сессии...');

            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: user.chatSession.session as ChatCompletionRequestMessage[],
                max_tokens: 200,
            });
            //const message = response.data.choices[0].text.trim();
            const chatMessage = response.data.choices[0].message as ChatCompletionResponseMessage;
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
        }

        startTimer(userId)
            .then((answer) => {
                askBot(userId, answer as string);
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
        console.log('Ошибка при старте бота');
        telegramBot.sendMessage(
            userId,
            'Возникла ошибка при старте бота. Ничего страшного, возможно бот на расхват. Просто перезапустите его еще раз 😌',
        );
    }
};

export const askBot = async (userId: string, text: string, retries = 2) => {
    try {
        const filter = { userId: userId };
        const options = { new: true };

        const user = await UserModel.findOne(filter);

        if (user) {
            telegramBot.sendChatAction(userId, 'typing');

            // Проверка на количество объектов в массиве

            if (user.chatSession.session.length > 12) {
                console.log('Уменьшение массива сообщений');
                user.chatSession.session.splice(1, 2);
                user.chatSession.session.push({ role: 'user', content: text });
                await UserModel.findOneAndUpdate(
                    filter,
                    { $set: { 'chatSession.session': user.chatSession.session } },
                    options,
                );
            } else {
                user.chatSession.session.push({ role: 'user', content: text });
                await UserModel.findOneAndUpdate(
                    filter,
                    { $set: { 'chatSession.session': user.chatSession.session } },
                    options,
                );
            }

            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: user.chatSession.session as ChatCompletionRequestMessage[],
            });

            const chatMessage = response.data.choices[0].message as ChatCompletionResponseMessage;

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
        }

        answerTimer(userId)
            .then((answer) => {
                askBot(userId, answer as string);
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
        if (retries > 0) {
            console.log(`Ошибка. Повторный запрос (${retries} попыток осталось)`);
            await askBot(userId, text, retries - 1);
        } else {
            telegramBot.sendMessage(
                userId,
                'Возникла ошибка при отправке запроса на сервер. Ничего страшного, просто перезапустите бота еще раз 😌',
            );
        }
    }
};

export const stopBot = async (userId: string) => {
    try {
        const filter = { userId: userId };
        const update = { $set: { chatSession: { activeBot: '', session: [] } } };
        const options = { new: true };

        await UserModel.findOneAndUpdate(filter, update, options);

        telegramBot.sendMessage(userId, 'Спасибо вам за приятную беседу) До скорых встреч. 👋');
    } catch (error) {
        console.log(error);
    }
};
