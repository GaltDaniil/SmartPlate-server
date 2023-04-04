import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        descripton: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            default: '',
        },
        diets: {
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Member', UserSchema);
