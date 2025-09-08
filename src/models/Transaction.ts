import mongoose, { Schema } from 'mongoose';

export const TransactionSchema = new Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    description: {
        type: String
    },
}, {
    timestamps: true
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export default Transaction;