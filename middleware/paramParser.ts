import TelegramBot from 'node-telegram-bot-api';
import { UserTypes } from '../models/User.js';

interface Parser {
    (match: RegExpExecArray): {
        referralCode: string;
        metrics: {
            utm_source: string;
            utm_medium: string;
            utm_campaign: string;
        };
    };
}

export const paramParser: Parser = (match) => {
    try {
        const startParams = match[1].trim();
        let referralCode = '';
        const metrics: UserTypes['metrics'] = new Object() as {
            utm_source: string;
            utm_medium: string;
            utm_campaign: string;
        };
        if (startParams.match(/ref/)) {
            const matchCode = startParams.match(/ref=([^-]+)/);
            if (matchCode) {
                referralCode = matchCode[1];
            }
        }
        if (startParams.match(/utm_source/)) {
            const matchSource = startParams.match(/utm_source=([^-]+)/);
            if (matchSource) {
                metrics.utm_source = matchSource[1];
            }
        }
        if (startParams.match(/utm_medium/)) {
            const matchMedium = startParams.match(/utm_medium=([^-]+)/);
            if (matchMedium) {
                metrics.utm_medium = matchMedium[1];
            }
        }
        if (startParams.match(/utm_campaign/)) {
            const matchCampaign = startParams.match(/utm_campaign=([^-]+)/);
            if (matchCampaign) {
                metrics.utm_campaign = matchCampaign[1];
            }
        }
        return { referralCode, metrics };
    } catch (error) {
        console.log(error);
        let referralCode = '';
        const metrics = {} as {
            utm_source: string;
            utm_medium: string;
            utm_campaign: string;
        };
        return { referralCode, metrics };
    }
};
