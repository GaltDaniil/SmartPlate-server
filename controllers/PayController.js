import UserModel from '../models/User.js';
import { Configuration, OpenAIApi } from 'openai';
import { telegramBot } from '../server.js';
import paypal from 'paypal-rest-sdk';
import * as dotenv from 'dotenv';
import { updateSubscribe } from './UserController.js';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export const successCloudpayments = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        await updateSubscribe(userId, amount);

        console.log(`Оплата прошла в размере ${amount} рублей.`);
        telegramBot.sendMessage(userId, 'Оплата прошла успешно.');
        telegramBot.sendMessage(299602933, `Пришла оплата от ${userName} в размере ${amount}.`);
        telegramBot.sendMessage(360641449, `Пришла оплата от ${userName} в размере ${amount}.`);

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

export const createPayPal = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        let usdAmount = null;
        if (amount === 299) {
            usdAmount = 3.8;
        } else if (amount === 699) {
            usdAmount = 8.6;
        } else {
            usdAmount = 17;
        }
        telegramBot.sendMessage(
            userId,
            'Подготавливаем ссылку для оплаты через Paypal, пожалуйста подождите...',
        );

        paypal.configure({
            mode: 'live', // Используйте 'live', если вы хотите работать с реальными транзакциями
            client_id:
                'AYTpAEL5hOVGSy2O81tCYo9X2E5BoMFA0oxOC7O7qlsRnGQN5ldd2T5TF8giuP-hodQ6oXWy_cqQ5I9K',
            client_secret:
                'EKWuajk7-1VgLf7IL5rRqldElX59GzZ96ElqUkuaPEJeP_L1_r1A9QAHS3IGdA6SsTGITG5wYSZwD7hY',
        });

        async function createPayPalPayment(userId, amount) {
            try {
                // Создаем объект платежа
                const payment = {
                    intent: 'sale',
                    payer: {
                        payment_method: 'paypal',
                    },
                    redirect_urls: {
                        return_url: `https://smartdietai.ru/api/pay/success-payment?userId=${userId}&amount=${amount}&usdAmount=${usdAmount}`,
                        cancel_url: `https://smartdietai.ru/api/pay/decline-payment?userId=${userId}&amount=${amount}`,
                    },
                    transactions: [
                        {
                            amount: {
                                total: usdAmount,
                                currency: 'USD',
                            },
                        },
                    ],
                };

                // Создаем платеж в PayPal
                const createPayment = await new Promise((resolve, reject) => {
                    paypal.payment.create(payment, (error, payment) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(payment);
                        }
                    });
                });

                // Получаем ссылку на оплату
                const approvalUrl = createPayment.links.find(
                    (link) => link.rel === 'approval_url',
                ).href;

                return approvalUrl;
            } catch (error) {
                console.log(error);
                console.log('Не удалось создать платеж PayPal.');
                throw new Error('Не удалось создать платеж PayPal.');
            }
        }
        const approvalUrl = await createPayPalPayment(userId, amount);
        console.log(approvalUrl);
        telegramBot.sendMessage(userId, approvalUrl);

        res.json({ approvalUrl });
    } catch (error) {
        res.status(500).json({ error: 'Произошла ошибка при создании платежа.' });
    }
};

export const successPayPal = async (req, res) => {
    const { PayerID, paymentId, userId, amount, usdAmount } = req.query;

    try {
        const userName = await updateSubscribe(userId, amount);
        // Подтверждаем платеж в PayPal
        const executePayment = await new Promise((resolve, reject) => {
            paypal.payment.execute(paymentId, { payer_id: PayerID }, (error, payment) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(payment);
                }
            });
        });
        console.log(executePayment);
        console.log(userId);
        console.log(amount);

        telegramBot.sendMessage(userId, 'Оплата прошла успешно.');
        telegramBot.sendMessage(
            299602933,
            `Пришла оплата PayPal от ${userName} в размере ${usdAmount}$.`,
        );
        telegramBot.sendMessage(
            360641449,
            `Пришла оплата PayPal от ${userName} в размере ${usdAmount}$.`,
        );
        res.send('Платеж успешно выполнен.');
    } catch (error) {
        res.status(500).send('Произошла ошибка при выполнении платежа.');
        console.log(error);
        console.log('Произошла ошибка при выполнении платежа.');
    }
};
export const declinePayPal = async (req, res) => {
    const { PayerID, paymentId, userId } = req.query;
    telegramBot.sendMessage(userId, 'Ошибка платежа через PayPal. Попробуйте еще раз.');
};
