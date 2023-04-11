import { telegramBot } from '../server.js';

export const tgStart = telegramBot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === '/start') {
        await subscribe(msg.chat);
        await telegramBot.sendMessage(
            chatId,
            'Добро пожаловать в Smart Plate. Рационы питания, основанные на ваших характеристиках и поредпочтениях. Версия AI ядра 1.3 (обновленно 01.04.23)',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Запрос рациона',
                                web_app: {
                                    url: 'https://https://smartdietai.ru/',
                                },
                            },
                        ],
                    ],
                },
            },
        );
    }
    if (msg.chat.type === 'private' && msg.chat.blocked) {
        // Если пользователь заблокировал бота, выполните нужные действия
        console.log(`Пользователь ${msg.chat.username} заблокировал бота`);
        // Вызов функции для передачи данных о заблокированном пользователе в другую функцию
    } else {
        // Если пользователь не заблокировал бота, выполните другие действия
        console.log(`Пользователь ${msg.chat.username} начал использовать бота`);
        // Выполнение других действий
    }
});

export const tgUnsubscribe = telegramBot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.response && error.response.statusCode === 403) {
        console.log(
            'Бот был заблокирован пользователем или отписался от чата. Останавливаю бота...',
        );
        console.log(error);
        // Здесь можно выполнить необходимые действия

        //telegramBot.stopPolling();
    } else {
        // Обработка других ошибок
        console.error('Ошибка при получении сообщений:', error);
    }
});
