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
            type: Boolean,
            default: true,
        },
        tokens: {
            type: Number,
            default: 20,
        },
        diets: {
            type: Number,
            default: 0,
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
        requests: {
            type: Number,
            default: 0,
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
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('User', UserSchema);
