import mongoose, { Document, Schema, SchemaDefinitionProperty, model } from 'mongoose';

type PaymentInfo = {
    amount: string;
    date: string;
};

export interface UserTypes extends Document {
    userId: number;
    name: string;
    userName: string;
    avatar: string;
    phone: string;
    profession: string;
    metrics: {
        utm_source: string;
        utm_medium: string;
        utm_campaign: string;
    };
    referralSystem:
        | {
              link: string;
              from: mongoose.Types.ObjectId;
              withdrawInfo: {
                  cardNumber: string;
                  cardFullName: string;
              };
              withdraw: number;
              withdrawRequests: object[];
          }
        | undefined;
    subscription: {
        isActive: boolean;
        dateEnd: string;
    };
    bots: object;
    chatSession: {
        activeBot: string;
        session: object[];
    };
    members: object[] | undefined;
    paymentInfo: PaymentInfo[] | undefined;
    totalAmount: number;
    messages: object[] | undefined;
    isNotificationSent: boolean;
    createdAt: string;
}

const UserSchema = new Schema<UserTypes>(
    {
        userId: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            default: '',
        },
        profession: {
            type: String,
            default: '',
        },
        referralSystem: {
            type: Object,
            default: {
                link: '',
                from: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                withdrawInfo: {
                    cardNumber: '',
                    cardFullName: '',
                },
                withdraw: 0,
                withdrawRequests: [],
            },
        },
        metrics: {
            type: Object,
            default: {
                utm_source: '',
                utm_medium: '',
                utm_campaign: '',
            },
        },
        subscription: {
            type: Object,
            default: {
                isActive: false,
                dateEnd: '',
            },
        },
        bots: {
            type: Object,
            default: {
                Jora: true,
                Fita: false,
                Kostya: false,
                Slava: false,
                Victorya: false,
                Ilon: false,
                Knopka: false,
            },
        },
        chatSession: {
            type: Object,
            default: {
                activeBot: '',
                session: [],
            },
        },
        members: {
            type: Array,
            default: [],
        },
        paymentInfo: {
            type: Array,
            default: [],
        },
        totalAmount: {
            type: Number,
            default: 0,
        },
        messages: {
            type: Array,
            default: [],
        },
        isNotificationSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

export default model<UserTypes>('User', UserSchema);
