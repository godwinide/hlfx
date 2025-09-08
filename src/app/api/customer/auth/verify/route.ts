import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import Customer from '@/models/Customer';
import { connectDb } from '@/config';

export async function GET(request: NextRequest) {
  try {
    await connectDb();
    
    const decoded = authenticateRequest(request);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    // Verify customer still exists
    const customer = await Customer.findById(decoded.customerId);
    
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      customerId: decoded.customerId,
      email: decoded.email,
      accountNumber: decoded.accountNumber,
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
