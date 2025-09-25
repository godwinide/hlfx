import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/config';
import Customer from '@/models/Customer';
import { authenticateRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST /api/customer/change-password - Change customer's account password
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

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password, new password, and confirmation are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Fetch customer
    const customer = await Customer.findById(decoded.customerId).select('+password');
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(String(currentPassword), customer.password);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Prevent reusing the same password
    const isSameAsOld = await bcrypt.compare(String(newPassword), customer.password);
    if (isSameAsOld) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from the current password' },
        { status: 400 }
      );
    }

    // Hash and update new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(String(newPassword), saltRounds);
    customer.password = hashedNewPassword;
    await customer.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
