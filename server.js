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

    // Отправить текст на OpenAI API и получить ответ
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
        temperature: 0.7,
        max_tokens: 2049,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    console.log(response.data.choices[0]);

    // Отправить ответ пользователю в Telegram
    const message = response.data.choices[0].message.content;
    telegramBot.sendMessage(chatId, message);
});

app.listen(8080, () => {
    console.log('server is ok');
});
