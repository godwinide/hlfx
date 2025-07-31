import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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

    // Find customer by ID
    const customer = await Customer.findById(decoded.customerId);
    
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Return customer data (excluding password)
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
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    return NextResponse.json({
      success: true,
      customer: customerData,
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
