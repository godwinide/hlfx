import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/config';
import { connectDb } from '@/config';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();

    const body = await request.json();
    const { accountNumber, amount, description } = body;

    // Validate required fields
    if (!accountNumber || !amount) {
      return NextResponse.json(
        { error: 'Account number and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Find customer by account number
    const customer = await Customer.findOne({ accountNumber });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer with this account number not found' },
        { status: 404 }
      );
    }

    // Find or create Halifax Bank customer (system account)
    let halifaxBank = await Customer.findOne({ email: 'halifax@bank.system' });
    
    if (!halifaxBank) {
      // Create Halifax Bank system account
      halifaxBank = new Customer({
        firstname: 'Halifax',
        lastname: 'Bank',
        email: 'halifax@bank.system',
        accountNumber: 'HALIFAX001',
        password: 'system-account',
        balance: 999999999, // Large balance for system account
        phoneNumber: '1-800-HALIFAX',
        address: 'Halifax Banking Center',
        city: 'Halifax',
        state: 'NS',
        country: 'Canada',
        postalCode: 'B3H 0A1',
        transactionPin: '1234'
      });
      await halifaxBank.save();
    }

    // Create deposit transaction (from Halifax Bank to customer)
    const transaction = new Transaction({
      fromUserId: halifaxBank._id,
      toUserId: customer._id,
      amount: parseFloat(amount),
      description: description || `Deposit to account ${accountNumber}`
    });

    await transaction.save();

    // Update customer balance
    await Customer.findByIdAndUpdate(customer._id, { 
      $inc: { balance: parseFloat(amount) } 
    });

    // Get updated customer data
    const updatedCustomer = await Customer.findById(customer._id);

    // Populate the transaction for response
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('fromUserId', 'firstname lastname email accountNumber')
      .populate('toUserId', 'firstname lastname email accountNumber');

    if (!populatedTransaction || !populatedTransaction.fromUserId || !populatedTransaction.toUserId) {
      return NextResponse.json(
        { error: 'Failed to retrieve transaction details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Deposit successful',
      transaction: {
        _id: populatedTransaction._id,
        amount: populatedTransaction.amount,
        description: populatedTransaction.description,
        fromUser: {
          _id: populatedTransaction.fromUserId._id,
          name: `${populatedTransaction.fromUserId.firstname} ${populatedTransaction.fromUserId.lastname}`,
          email: populatedTransaction.fromUserId.email,
          accountNumber: populatedTransaction.fromUserId.accountNumber
        },
        toUser: {
          _id: populatedTransaction.toUserId._id,
          name: `${populatedTransaction.toUserId.firstname} ${populatedTransaction.toUserId.lastname}`,
          email: populatedTransaction.toUserId.email,
          accountNumber: populatedTransaction.toUserId.accountNumber
        },
        createdAt: populatedTransaction.createdAt
      },
      customerBalance: updatedCustomer?.balance
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
