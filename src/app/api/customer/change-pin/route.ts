import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/config';
import Customer from '@/models/Customer';
import { authenticateRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST /api/customer/change-pin - Change customer's transaction PIN
export async function POST(request: NextRequest) {
  try {
    await connectDb();

    // Authenticate via JWT (Authorization: Bearer <token>)
    const decoded = authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    const { currentPin, newPin, confirmPin } = await request.json();

    // Basic validation
    if (!currentPin || !newPin || !confirmPin) {
      return NextResponse.json(
        { success: false, message: 'Current PIN, new PIN, and confirmation are required' },
        { status: 400 }
      );
    }

    if (newPin !== confirmPin) {
      return NextResponse.json(
        { success: false, message: 'New PIN and confirmation PIN do not match' },
        { status: 400 }
      );
    }

    // PIN format: 4-6 digits
    if (!/^\d{4,6}$/.test(newPin)) {
      return NextResponse.json(
        { success: false, message: 'PIN must be 4-6 digits' },
        { status: 400 }
      );
    }

    // Fetch customer
    const customer = await Customer.findById(decoded.customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify current PIN
    const isCurrentValid = await bcrypt.compare(String(currentPin), customer.transactionPin);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: 'Current PIN is incorrect' },
        { status: 400 }
      );
    }

    // Prevent reusing the same PIN
    const isSameAsOld = await bcrypt.compare(String(newPin), customer.transactionPin);
    if (isSameAsOld) {
      return NextResponse.json(
        { success: false, message: 'New PIN must be different from the current PIN' },
        { status: 400 }
      );
    }

    // Hash and update new PIN
    const saltRounds = 12;
    const hashedNewPin = await bcrypt.hash(String(newPin), saltRounds);
    customer.transactionPin = hashedNewPin;
    await customer.save();

    return NextResponse.json({ success: true, message: 'Transaction PIN updated successfully' });
  } catch (error) {
    console.error('Change PIN error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
