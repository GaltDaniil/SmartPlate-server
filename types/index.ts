import { Request, Response, NextFunction } from 'express';

export interface RequestQuery {
    query: {
        PayerID?: string;
        paymentId: string;
        userId: string;
        amount: string;
        usdAmount: string;
    };
}

export interface Middleware {
    (req: Request, res: Response, next: NextFunction): void;
}

export interface RequestBody extends Request {
    body: {
        userId: string;
        userName: string;
        userMessage: string;
        type: string;
        system: string;
        bot: string;
    };
}
