import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Transaction from '@/models/Transaction';
import { connectDb } from '@/config';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    await connectDb();
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    console.log(token);
    console.log(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    console.log(decoded);

    // Find transactions where customer is either sender or receiver
    const transactions = await Transaction.find({
      $or: [
        { fromUserId: decoded.customerId },
        { toUserId: decoded.customerId }
      ]
    })
      .populate('fromUserId', 'firstname lastname email accountNumber')
      .populate('toUserId', 'firstname lastname email accountNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments({
      $or: [
        { fromUserId: decoded.customerId },
        { toUserId: decoded.customerId }
      ]
    });

    // Format transactions for response
    const formattedTransactions = transactions.map(transaction => {
      const isDebit = transaction.fromUserId._id.toString() === decoded.customerId;
      
      return {
        id: transaction._id,
        description: transaction.description,
        amount: transaction.amount,
        type: isDebit ? 'debit' : 'credit',
        date: transaction.createdAt,
        fromUser: {
          id: transaction.fromUserId._id,
          name: `${transaction.fromUserId.firstname} ${transaction.fromUserId.lastname}`,
          email: transaction.fromUserId.email,
          accountNumber: transaction.fromUserId.accountNumber,
        },
        toUser: {
          id: transaction.toUserId._id,
          name: `${transaction.toUserId.firstname} ${transaction.toUserId.lastname}`,
          email: transaction.toUserId.email,
          accountNumber: transaction.toUserId.accountNumber,
        },
      };
    });

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions,
        hasNextPage: page < Math.ceil(totalTransactions / limit),
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
