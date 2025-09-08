import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDb } from '@/config';
import Customer from '@/models/Customer';
import bcrypt from 'bcryptjs';

// Currency utility function
function getCurrencySymbol(currencyCode: string = 'USD'): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF',
  };
  return currencySymbols[currencyCode.toUpperCase()] || '$';
}

// POST /api/customer/transfer - Process customer transfer request
export async function POST(request: NextRequest) {
  try {
    await connectDb();

    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authorization token required' 
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const {
      transferType, // 'local' or 'international'
      receiverName,
      receiverAccountNumber,
      receiverBankName,
      receiverBankCode, // For international transfers
      receiverSwiftCode, // For international transfers
      receiverAddress, // For international transfers
      amount,
      currency,
      description,
      transactionPin
    } = body;

    console.log(body)

    // Validate required fields
    if (!transferType || !receiverName || !receiverAccountNumber || !amount || !transactionPin) {
      return NextResponse.json({ 
        error: 'Transfer type, receiver name, account number, amount, and transaction PIN are required' 
      }, { status: 400 });
    }

    // Validate transfer type
    if (!['local', 'international'].includes(transferType)) {
      return NextResponse.json({ 
        error: 'Transfer type must be either "local" or "international"' 
      }, { status: 400 });
    }

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be a positive number' 
      }, { status: 400 });
    }

    // Validate minimum transfer amount
    if (transferAmount < 1) {
      return NextResponse.json({ 
        error: 'Minimum transfer amount is $1.00' 
      }, { status: 400 });
    }

    // Additional validation for international transfers
    if (transferType === 'international') {
      if (!receiverBankName || !receiverSwiftCode || !receiverAddress) {
        return NextResponse.json({ 
          error: 'Bank name, SWIFT code, and receiver address are required for international transfers' 
        }, { status: 400 });
      }

      // Validate SWIFT code format (8 or 11 characters)
      if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(receiverSwiftCode)) {
        return NextResponse.json({ 
          error: 'Invalid SWIFT code format' 
        }, { status: 400 });
      }
    }

    // Additional validation for local transfers
    if (transferType === 'local') {
      if (!receiverBankName) {
        return NextResponse.json({ 
          error: 'Bank name is required for local transfers' 
        }, { status: 400 });
      }

      // Validate account number format for local transfers (assuming 10-12 digits)
      if (!/^\d{10,12}$/.test(receiverAccountNumber)) {
        return NextResponse.json({ 
          error: 'Account number must be 10-12 digits for local transfers' 
        }, { status: 400 });
      }
    }

    // Validate transaction PIN format
    if (!/^\d{4,6}$/.test(transactionPin)) {
      return NextResponse.json({ 
        error: 'Transaction PIN must be 4-6 digits' 
      }, { status: 400 });
    }

    // Get customer details
    const customer = await Customer.findById(decoded.customerId);
    if (!customer) {
      return NextResponse.json({ 
        error: 'Customer not found' 
      }, { status: 404 });
    }

    // Verify transaction PIN
    const isPinValid = await bcrypt.compare(transactionPin, customer.transactionPin);
    if (!isPinValid) {
      return NextResponse.json({ 
        error: 'Invalid transaction PIN' 
      }, { status: 400 });
    }

    // Check customer balance
    if (customer.balance < transferAmount) {
      return NextResponse.json({ 
        error: 'Insufficient balance for this transfer' 
      }, { status: 400 });
    }

    // Check if customer has enough balance including potential fees
    const transferFee = transferType === 'international' ? transferAmount * 0.02 : 2.50; // 2% for international, $2.50 for local
    const totalAmount = transferAmount + transferFee;
    
    if (customer.balance < totalAmount) {
      const customerCurrency = customer.currency || 'USD';
      const currencySymbol = getCurrencySymbol(customerCurrency);
      return NextResponse.json({ 
        error: `Insufficient balance. Transfer amount: ${currencySymbol}${transferAmount.toFixed(2)}, Fee: ${currencySymbol}${transferFee.toFixed(2)}, Total required: ${currencySymbol}${totalAmount.toFixed(2)}, Available: ${currencySymbol}${customer.balance.toFixed(2)}` 
      }, { status: 400 });
    }

    // Validate receiver name format
    if (!/^[a-zA-Z\s.'-]{2,50}$/.test(receiverName)) {
      return NextResponse.json({ 
        error: 'Receiver name must be 2-50 characters and contain only letters, spaces, periods, hyphens, and apostrophes' 
      }, { status: 400 });
    }

    // Prevent self-transfer (if receiver account matches customer account)
    if (receiverAccountNumber === customer.accountNumber) {
      return NextResponse.json({ 
        error: 'Cannot transfer to your own account' 
      }, { status: 400 });
    }

    // Validate currency for international transfers
    if (transferType === 'international' && currency) {
      const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'];
      if (!supportedCurrencies.includes(currency.toUpperCase())) {
        return NextResponse.json({ 
          error: `Unsupported currency. Supported currencies: ${supportedCurrencies.join(', ')}` 
        }, { status: 400 });
      }
    }

    // Check daily transfer limit
    const dailyLimit = 10000; // $10,000 daily limit
    if (transferAmount > dailyLimit) {
      return NextResponse.json({ 
        error: `Transfer amount exceeds daily limit of $${dailyLimit.toLocaleString()}` 
      }, { status: 400 });
    }

    // All validations passed - but return failure message as requested
    // This simulates a system that validates everything but doesn't actually process transfers
    return NextResponse.json({ 
      success: false,
      error: 'Transfer service is currently unavailable',
      message: 'We apologize for the inconvenience. Your transfer request could not be processed at this time. Please contact our customer support team for assistance with your transfer.',
      supportInfo: {
        phone: '1-800-HALIFAX (1-800-425-4329)',
        email: 'support@halifax-bank.com',
        hours: 'Monday - Friday: 8:00 AM - 8:00 PM EST, Saturday: 9:00 AM - 5:00 PM EST'
      },
      transferDetails: {
        transferType,
        receiverName,
        receiverAccountNumber: receiverAccountNumber.replace(/(.{4})/, '****'), // Mask account number
        receiverBankName,
        amount: transferAmount,
        fee: transferFee,
        totalAmount,
        currency: currency || customer.currency,
        timestamp: new Date().toISOString()
      }
    }, { status: 503 }); // 503 Service Unavailable

  } catch (error) {
    console.error('Error processing transfer:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}