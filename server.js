import express from 'express';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

telegramBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    /* if (text === '/start') {
        await telegramBot.sendMessage(chatId, 'Ниже появится кнопка, запросить рацион', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Запрос рациона',
                            web_app: {
                                url: 'https://64253492e183442ecfabb646--comfy-swan-8b9193.netlify.app/',
                            },
                        },
                    ],
                ],
            },
        });
    } */

    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: text,
        /* messages: [{ role: 'user', content: text }], */
        temperature: 0.7,
        max_tokens: 3500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    console.log(response.data.choices[0].text);

    const message = response.data.choices[0].text.trim();
    telegramBot.sendMessage(chatId, message);
});

app.listen(8080, () => {
    console.log('server is ok');
});
