import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDb } from '@/config';
import Site from '@/models/Site';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET /api/customer/site - Get site details for customer
export async function GET(request: NextRequest) {
  try {
    await connectDb();

    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false,
        error: 'Authorization token required' 
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid or expired token' 
      }, { status: 401 });
    }

    // Get site details
    let site = await Site.findOne();

    // If no site configuration exists, create default Halifax Bank settings
    if (!site) {
      const defaultSite = {
        phone: '+1-800-HALIFAX',
        email: 'info@halifax.bank',
        address: '123 Halifax Banking Center',
        city: 'Halifax',
        state: 'Nova Scotia',
        zip: 'B3H 0A1',
        country: 'Canada'
      };

      site = await Site.create(defaultSite);
    }

    // Return site details
    return NextResponse.json({
      success: true,
      site: {
        contact: {
          phone: site.phone,
          email: site.email
        },
        address: {
          street: site.address,
          city: site.city,
          state: site.state,
          zip: site.zip,
          country: site.country
        },
        lastUpdated: site.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching site details:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
