import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
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

export default mongoose.model('User', UserSchema);
