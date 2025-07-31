import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/config';
import { connectDb } from '@/config';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch transactions with customer details
    const transactions = await Transaction.find()
      .populate('fromUserId', 'firstname lastname email')
      .populate('toUserId', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments();

    // Format the response
    const formattedTransactions = transactions.map(transaction => ({
      _id: transaction._id,
      amount: transaction.amount,
      description: transaction.description,
      fromUser: transaction.fromUserId ? {
        _id: transaction.fromUserId._id,
        name: `${transaction.fromUserId.firstname} ${transaction.fromUserId.lastname}`,
        email: transaction.fromUserId.email
      } : null,
      toUser: transaction.toUserId ? {
        _id: transaction.toUserId._id,
        name: `${transaction.toUserId.firstname} ${transaction.toUserId.lastname}`,
        email: transaction.toUserId.email
      } : null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions,
        hasNextPage: page < Math.ceil(totalTransactions / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();

    const body = await request.json();
    const { fromUserId, toUserId, amount, description } = body;

    // Validate required fields
    if (!fromUserId || !toUserId || !amount) {
      return NextResponse.json(
        { error: 'From user, to user, and amount are required' },
        { status: 400 }
      );
    }

    // Verify users exist
    const fromUser = await Customer.findById(fromUserId);
    const toUser = await Customer.findById(toUserId);

    if (!fromUser || !toUser) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    // Check if sender has sufficient balance
    if (fromUser.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = new Transaction({
      fromUserId,
      toUserId,
      amount,
      description: description || 'Transfer'
    });

    await transaction.save();

    // Update balances
    await Customer.findByIdAndUpdate(fromUserId, { 
      $inc: { balance: -amount } 
    });
    await Customer.findByIdAndUpdate(toUserId, { 
      $inc: { balance: amount } 
    });

    // Populate the transaction for response
    await transaction.populate('fromUserId', 'firstname lastname email');
    await transaction.populate('toUserId', 'firstname lastname email');

    return NextResponse.json({
      message: 'Transaction created successfully',
      transaction: {
        _id: transaction._id,
        amount: transaction.amount,
        description: transaction.description,
        fromUser: {
          _id: transaction.fromUserId._id,
          name: `${transaction.fromUserId.firstname} ${transaction.fromUserId.lastname}`,
          email: transaction.fromUserId.email
        },
        toUser: {
          _id: transaction.toUserId._id,
          name: `${transaction.toUserId.firstname} ${transaction.toUserId.lastname}`,
          email: transaction.toUserId.email
        },
        createdAt: transaction.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
