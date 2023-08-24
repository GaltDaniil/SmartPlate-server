import TelegramBot from 'node-telegram-bot-api';
import { paramParser } from '../middleware/paramParser.js';
import { telegramBot } from '../server.js';
import { addNewUser } from './UserController.js';

interface StartCommandType {
    (msg: TelegramBot.Message, match?: RegExpExecArray | null): void;
}

export const handlerStartCommandWithParams: StartCommandType = async (msg, match) => {
    try {
        console.log('start');
        const queryData = await paramParser(match!);

        const chatId = msg.chat.id;
        console.log(chatId);

        await addNewUser(msg, queryData);
        await telegramBot.sendMessage(
            chatId,
            '👋 Добро пожаловать!\n \n🥑 Это уникальный онлайн-сервис, разработанный специально для нутрициологов и фитнес-тренеров.\n \n⏱ С нашим ботом вы сможете разрабатывать продукты, уделяя этому в десятки раз меньше времени, но сохраняя качество на высшем уровне.\n \n🧠 На данный момент есть 2 бота:\n \n🥑 Бот-нутрициолог. Ответит на любой вопрос в сфере нутрициологии и здорового питания. Составит рацион, рассчитает КБЖУ, найдет информацию о любом продукте и поможет составить рецепты из них. \n \n🖌 Бот-копирайтер. За вас напишет любой текст на любую тему в нужной вам стилистике. Это может быть статья в блог, текст для рекламного объявления или рассылки, так же подскажет идеи для постов и проверит текст на ошибки и стилистику. \n \n 🎁  ⬇️ Начните общение с ботом-экспертом прямо сейчас нажав кнопку "Open"',
        );
    } catch (error) {
        console.log(error);
    }
};
export const handlerStartCommand: StartCommandType = async (msg) => {
    try {
        await addNewUser(msg);
        const chatId = msg.chat.id;

        const message =
            'Добро пожаловать. Я помогу вам создать продающее, SEO-оптимизированное описание товара, собрать ключевые слова ответить на отзывы покупателей и многое другое. Инструкция (https://telegra.ph/Instrukciya-03-23-8)\n\n Инструменты:';
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Описание для товара', callback_data: 'description' }],
                    [{ text: 'Сбор ключевых слов', callback_data: 'seo' }],
                    [{ text: 'Варианты имен для бренда', callback_data: 'brend' }],
                    [{ text: 'Варианты сетов для товара', callback_data: 'sets' }],
                ],
                resize_keyboard: true,
            },
        };
        telegramBot.sendMessage(chatId, message, options);
    } catch (error) {}
};
