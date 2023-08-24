import client from '../db.js';
import { Request, Response } from 'express';
import io, { Socket } from 'socket.io';

interface IMessage {
    userId: number;
    text: string;
    chat_id: string;
    from_client: string;
}

export const reateChat = async (socketId: string) => {
    const created_at = new Date();
    const update_at = new Date();

    const newChat = await client.query(
        'INSERT INTO chats (chat_id, messages, created_at, update_at, type) values ($1, $2, $3, $4, $5) RETURNING *',
        [socketId, [], created_at, update_at, 'beeChat'],
    );
};
export const ioGetChat = async (socketId: string) => {
    await client.query('SELECT * FROM chats WHERE id = $1', [socketId], (error, results) => {
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            const userData = results.rows;
            console.log(userData); // полученные данные
            console.log('Clients data sended');
            return userData;
        }
    });
};

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

export const getChat = async (data: IioData) => {
    try {
        //@ts-ignore
        const result = await client.query(
            'SELECT chats.*, array_agg(messages.*) AS messages FROM chats ' +
                'LEFT JOIN messages ON chats.id = messages.chat_id ' +
                'WHERE account_id = $1 AND chat_id = $2 ' +
                'GROUP BY chats.id;',
            [data.account_id, data.beechat_session],
        );
        const result2 = await client.query('SELECT * FROM messages WHERE chat_id = $1', [
            data.beechat_session,
        ]);
        console.log('данные чата переданы');
        console.log(result2);
        return result2;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    }
};

export const getAllChats = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        const result = await client.query('SELECT * FROM chats');
        console.log(result);
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    }
};

export const createChat = async (req: Request, res: Response) => {
    try {
        console.log('чат начал создание');
        const { account_id, chat_id, from } = req.body;
        const created_at = new Date();
        const update_at = new Date();
        //@ts-ignore
        await client.query(
            'INSERT INTO chats (id, created_at, update_at, account_id, type) values ($1, $2, $3, $4, $5) RETURNING *',
            [chat_id, created_at, update_at, account_id, from],
        );
        res.status(200).send('чат создан');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};
