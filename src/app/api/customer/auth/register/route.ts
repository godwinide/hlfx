import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Customer from '@/models/Customer';
import { connectDb } from '@/config';
import { generateUniqueAccountNumber } from '@/lib/accountUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    
    const { 
      firstname, 
      lastname, 
      email, 
      password, 
      phoneNumber, 
      address, 
      city, 
      state, 
      country, 
      postalCode,
      transactionPin 
    } = await request.json();

    // Validate required fields
    if (!firstname || !lastname || !email || !password || !transactionPin) {
      return NextResponse.json(
        { success: false, message: 'First name, last name, email, password, and transaction PIN are required' },
        { status: 400 }
      );
    }

    // Validate transaction PIN format
    if (!/^\d{4,6}$/.test(transactionPin)) {
      return NextResponse.json(
        { success: false, message: 'Transaction PIN must be 4-6 digits' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and transaction PIN
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedTransactionPin = await bcrypt.hash(transactionPin, saltRounds);

    // Generate unique account number
    const accountNumber = await generateUniqueAccountNumber();

    // Create new customer
    const newCustomer = new Customer({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: hashedPassword,
      accountNumber,
      phoneNumber: phoneNumber || '',
      address: address || '',
      city: city || '',
      state: state || '',
      country: country || 'US',
      postalCode: postalCode || '',
      balance: 0,
      currency: 'USD',
      transactionPin: hashedTransactionPin,
    });

    const savedCustomer = await newCustomer.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: savedCustomer._id,
        email: savedCustomer.email,
        accountNumber: savedCustomer.accountNumber
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response with customer data (excluding password)
    const customerData = {
      id: savedCustomer._id,
      firstName: savedCustomer.firstname,
      lastName: savedCustomer.lastname,
      email: savedCustomer.email,
      accountNumber: savedCustomer.accountNumber,
      balance: savedCustomer.balance,
      phoneNumber: savedCustomer.phoneNumber,
      address: savedCustomer.address,
      city: savedCustomer.city,
      state: savedCustomer.state,
      country: savedCustomer.country,
      postalCode: savedCustomer.postalCode,
      currency: savedCustomer.currency,
    };

    return NextResponse.json({
      success: true,
      message: 'Customer registered successfully',
      token,
      customer: customerData,
    }, { status: 201 });

  } catch (error:any) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Customer with this email or account number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
