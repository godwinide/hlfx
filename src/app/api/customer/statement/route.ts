import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import { connectDb } from '@/config';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    await connectDb();
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

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

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json'; // json or pdf

    // Default to last 30 days if no date range provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const queryStartDate = startDate ? new Date(startDate) : defaultStartDate;
    const queryEndDate = endDate ? new Date(endDate) : defaultEndDate;

    // Validate date range
    if (queryStartDate > queryEndDate) {
      return NextResponse.json(
        { success: false, message: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }

    // Get customer information
    const customer = await Customer.findById(decoded.customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Find transactions within date range where customer is involved
    const transactions = await Transaction.find({
      $and: [
        {
          $or: [
            { fromUserId: decoded.customerId },
            { toUserId: decoded.customerId }
          ]
        },
        {
          createdAt: {
            $gte: queryStartDate,
            $lte: queryEndDate
          }
        }
      ]
    })
      .populate('fromUserId', 'firstname lastname email accountNumber')
      .populate('toUserId', 'firstname lastname email accountNumber')
      .sort({ createdAt: 1 }); // Chronological order for statement

    // Calculate statement summary
    let openingBalance = customer.balance;
    let totalCredits = 0;
    let totalDebits = 0;
    let creditCount = 0;
    let debitCount = 0;

    // Calculate opening balance by working backwards from current balance
    transactions.forEach(transaction => {
      const isDebit = transaction.fromUserId._id.toString() === decoded.customerId;
      if (isDebit) {
        openingBalance += transaction.amount; // Add back debited amount
      } else {
        openingBalance -= transaction.amount; // Subtract credited amount
      }
    });

    // Calculate totals for the period
    const formattedTransactions = transactions.map((transaction, index) => {
      const isDebit = transaction.fromUserId._id.toString() === decoded.customerId;
      
      if (isDebit) {
        totalDebits += transaction.amount;
        debitCount++;
      } else {
        totalCredits += transaction.amount;
        creditCount++;
      }

      // Calculate running balance
      const runningBalance = openingBalance + totalCredits - totalDebits;

      return {
        id: transaction._id,
        date: transaction.createdAt,
        description: transaction.description,
        reference: transaction._id.toString().slice(-8).toUpperCase(),
        type: isDebit ? 'debit' : 'credit',
        amount: transaction.amount,
        balance: runningBalance,
        counterparty: {
          name: isDebit 
            ? `${transaction.toUserId.firstname} ${transaction.toUserId.lastname}`
            : `${transaction.fromUserId.firstname} ${transaction.fromUserId.lastname}`,
          accountNumber: isDebit 
            ? transaction.toUserId.accountNumber
            : transaction.fromUserId.accountNumber,
          email: isDebit 
            ? transaction.toUserId.email
            : transaction.fromUserId.email,
        },
      };
    });

    const closingBalance = customer.balance;

    // Generate statement data
    const statementData = {
      customer: {
        id: customer._id,
        name: `${customer.firstname} ${customer.lastname}`,
        email: customer.email,
        accountNumber: customer.accountNumber,
        address: {
          street: customer.address,
          city: customer.city,
          state: customer.state,
          postalCode: customer.postalCode,
          country: customer.country,
        },
      },
      statement: {
        period: {
          startDate: queryStartDate,
          endDate: queryEndDate,
        },
        summary: {
          openingBalance,
          closingBalance,
          totalCredits,
          totalDebits,
          netChange: totalCredits - totalDebits,
          transactionCount: transactions.length,
          creditCount,
          debitCount,
        },
        transactions: formattedTransactions,
      },
      generatedAt: new Date(),
      currency: customer.currency || 'USD',
    };

    // Return JSON format
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        statement: statementData,
      });
    }

    // For PDF format, return structured data that can be used by frontend to generate PDF
    if (format === 'pdf') {
      return NextResponse.json({
        success: true,
        statement: statementData,
        format: 'pdf',
        message: 'Statement data ready for PDF generation',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid format specified' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Statement generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}