import { connectDb } from "@/config";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateUniqueAccountNumber } from "@/lib/accountUtils";

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDb();

    // Get request body
    const body = await request.json();
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
      balance, 
      currency,
      transactionPin 
    } = body;

    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hash transaction PIN
    const hashedTransactionPin = await bcrypt.hash(transactionPin, salt);

    // Generate unique account number
    const accountNumber = await generateUniqueAccountNumber();

    // Create new customer
    const newCustomer = await Customer.create({
      firstname,
      lastname,
      email,
      accountNumber,
      password: hashedPassword,
      phoneNumber,
      address,
      city,
      state,
      country,
      postalCode,
      balance: balance || 0,
      currency: currency || "USD",
      transactionPin: hashedTransactionPin,
    });

    // Return success response without exposing the password
    return NextResponse.json({
      message: "Customer created successfully",
      customer: {
        id: newCustomer._id,
        firstname: newCustomer.firstname,
        lastname: newCustomer.lastname,
        email: newCustomer.email,
        accountNumber: newCustomer.accountNumber,
        phoneNumber: newCustomer.phoneNumber,
        address: newCustomer.address,
        city: newCustomer.city,
        state: newCustomer.state,
        country: newCustomer.country,
        postalCode: newCustomer.postalCode,
        balance: newCustomer.balance,
        currency: newCustomer.currency,
        createdAt: newCustomer.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDb();

    // Get all customers
    const customers = await Customer.find()
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 });

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
