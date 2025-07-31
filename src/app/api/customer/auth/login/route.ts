import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Customer from '@/models/Customer';
import { connectDb } from '@/config';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find customer by email and include password field
    const customer = await Customer.findOne({ email }).select('+password');
    
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer._id,
        email: customer.email,
        accountNumber: customer.accountNumber
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response with customer data (excluding password)
    const customerData = {
      id: customer._id,
      firstName: customer.firstname,
      lastName: customer.lastname,
      email: customer.email,
      accountNumber: customer.accountNumber,
      balance: customer.balance,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      country: customer.country,
      postalCode: customer.postalCode,
      currency: customer.currency,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      customer: customerData,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
