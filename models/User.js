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
            default: 2,
        },
        diets: {
            type: Number,
            default: 0,
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
