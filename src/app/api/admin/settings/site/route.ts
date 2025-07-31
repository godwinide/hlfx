import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/config';
import { connectDb } from '@/config';
import Site from '@/models/Site';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();

    // Get site settings (there should only be one document)
    let site = await Site.findOne();

    // If no site settings exist, create default ones
    if (!site) {
      site = new Site({
        phone: '+1-800-HALIFAX',
        email: 'info@halifax.bank',
        address: '123 Halifax Banking Center',
        city: 'Halifax',
        state: 'Nova Scotia',
        zip: 'B3H 0A1',
        country: 'Canada'
      });
      await site.save();
    }

    return NextResponse.json({
      site: {
        _id: site._id,
        phone: site.phone,
        email: site.email,
        address: site.address,
        city: site.city,
        state: site.state,
        zip: site.zip,
        country: site.country,
        createdAt: site.createdAt,
        updatedAt: site.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();

    const body = await request.json();
    const { phone, email, address, city, state, zip, country } = body;

    // Validate required fields
    if (!phone || !email || !address || !city || !state || !zip || !country) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Find existing site settings or create new one
    let site = await Site.findOne();

    if (site) {
      // Update existing site settings
      site.phone = phone;
      site.email = email;
      site.address = address;
      site.city = city;
      site.state = state;
      site.zip = zip;
      site.country = country;
      await site.save();
    } else {
      // Create new site settings
      site = new Site({
        phone,
        email,
        address,
        city,
        state,
        zip,
        country
      });
      await site.save();
    }

    return NextResponse.json({
      message: 'Site settings updated successfully',
      site: {
        _id: site._id,
        phone: site.phone,
        email: site.email,
        address: site.address,
        city: site.city,
        state: site.state,
        zip: site.zip,
        country: site.country,
        updatedAt: site.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
