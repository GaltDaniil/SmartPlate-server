import client from '../db.js';
import { Request, Response } from 'express';
import io, { Socket } from 'socket.io';

interface IMessage {
    userId: number;
    text: string;
    chat_id: string;
    from_client: string;
}

/* export const ioMessageHandler = async (data) => {
    const newChat = await client.query(
        'INSERT INTO chats (chat_id, text, sended_at, beechat_session, from_client) values ($1, $2, $3, $4, $5) RETURNING *',
        [user_id, text, sended_at, beechat_session, from_client],
    );
}; */

interface IioData {
    beechat_session: string;
    account_id: number;
    text?: string;
    from_client?: boolean;
    fromUrl: string;
}

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { chat_id } = req.query;
        //@ts-ignore
        const result = await client.query('SELECT * FROM messages WHERE chat_id = $1', [chat_id]);
        const userData = result.rows; // полученные данные
        console.log('Clients data sended');
        res.status(200).json(userData);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};

export const getMessageById = async (req: Request, res: Response) => {
    try {
        const { message_id } = req.query;
        const query = `SELECT * FROM messages 
            WHERE message_id = $1`;
        //@ts-ignore
        const values = [message_id];
        const result = await client.query(query, values);
        const userData = result.rows[0];
        console.log('Clients data sended');
        res.status(200).json(userData);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};

export const createMessage = async (data: IioData) => {
    try {
        const { text, beechat_session, from_client } = data;

        const sended_at = new Date();

        //@ts-ignore
        const newMessage = await client.query(
            'INSERT INTO messages (chat_id, text, sended_at, from_client) values ($1, $2, $3, $4) RETURNING *',
            [beechat_session, text, sended_at, from_client],
        );
        return newMessage;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { text, chat_id, from_client } = req.body as IMessage;

        const sended_at = new Date();
        const queryText = `INSERT INTO 
        messages (text, sended_at, chat_id, from_client) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;
        const values = [text, sended_at, chat_id, from_client];
        //@ts-ignore
        const newMessage = await client.query(values, values);
        res.status(200).json({ newMessage });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error creating data.');
    }
};
