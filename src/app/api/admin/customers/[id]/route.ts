import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDb } from '@/config';
import Customer from '@/models/Customer';
import bcrypt from 'bcryptjs';

// GET /api/admin/customers/[id] - Get a specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();
    
    const { id } = await params;
    const customer = await Customer.findById(id).select('-password -transactionPin');
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      customer 
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// PUT /api/admin/customers/[id] - Update a specific customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();
    
    const { id } = await params;

    const body = await request.json();
    const {
      firstname,
      lastname,
      email,
      phoneNumber,
      address,
      city,
      state,
      country,
      postalCode,
      balance,
      currency,
      password,
      transactionPin
    } = body;

    // Validate required fields
    if (!firstname || !lastname || !email) {
      return NextResponse.json({ 
        error: 'First name, last name, and email are required' 
      }, { status: 400 });
    }

    // Check if customer exists
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken by another customer
    if (email !== existingCustomer.email) {
      const emailExists = await Customer.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (emailExists) {
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      state: state ? state.trim() : '',
      country: country ? country.trim() : 'US',
      postalCode: postalCode ? postalCode.trim() : '',
      balance: parseFloat(balance) || 0,
      currency: currency || 'USD',
    };

    // Hash password if provided
    if (password && password.trim()) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password.trim(), saltRounds);
    }

    // Hash transaction PIN if provided
    if (transactionPin && transactionPin.trim()) {
      // Validate PIN format
      if (!/^\d{4,6}$/.test(transactionPin.trim())) {
        return NextResponse.json({ 
          error: 'Transaction PIN must be 4-6 digits' 
        }, { status: 400 });
      }
      
      const saltRounds = 12;
      updateData.transactionPin = await bcrypt.hash(transactionPin.trim(), saltRounds);
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password -transactionPin');

    if (!updatedCustomer) {
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });

  } catch (error: any) {
    console.error('Error updating customer:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: validationErrors.join(', ') 
      }, { status: 400 });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Email already exists' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE /api/admin/customers/[id] - Delete a specific customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();
    
    const { id } = await params;
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    await Customer.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
