import { connectDb } from "@/config";
import Transaction from "@/models/Transaction";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/config";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDb();

        const [
            totalCustomers,
            totalTransactions,
            recentTransactions,
            recentCustomers
        ] = await Promise.all([
            Customer.countDocuments(),
            Transaction.countDocuments(),
            Transaction.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('fromUserId', 'firstname lastname email')
                .populate('toUserId', 'firstname lastname email'),
            Customer.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('firstname lastname email accountNumber balance currency')
        ]);

        // Calculate total transaction volume and average
        const transactionStats = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    totalVolume: { $sum: "$amount" },
                    averageAmount: { $avg: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate total customer balance
        const customerStats = await Customer.aggregate([
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: "$balance" },
                    averageBalance: { $avg: "$balance" }
                }
            }
        ]);

        return NextResponse.json({
            totalCustomers,
            totalTransactions,
            recentTransactions: recentTransactions.map(transaction => ({
                _id: transaction._id,
                amount: transaction.amount,
                description: transaction.description,
                fromUser: transaction.fromUserId ? {
                    name: `${transaction.fromUserId.firstname} ${transaction.fromUserId.lastname}`,
                    email: transaction.fromUserId.email
                } : null,
                toUser: transaction.toUserId ? {
                    name: `${transaction.toUserId.firstname} ${transaction.toUserId.lastname}`,
                    email: transaction.toUserId.email
                } : null,
                createdAt: transaction.createdAt
            })),
            recentCustomers: recentCustomers.map(customer => ({
                _id: customer._id,
                name: `${customer.firstname} ${customer.lastname}`,
                email: customer.email,
                accountNumber: customer.accountNumber,
                balance: customer.balance,
                currency: customer.currency
            })),
            transactionStats: transactionStats[0] || {
                totalVolume: 0,
                averageAmount: 0,
                count: 0
            },
            customerStats: customerStats[0] || {
                totalBalance: 0,
                averageBalance: 0
            }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        );
    }
}
