const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { config } = require('dotenv');

// Need to compile the User model schema since we're outside Next.js
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    }
}, {
    timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Load environment variables
config();

async function createAdmin() {
    try {
        // Connect to MongoDB
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get admin details from command line arguments
        const email = process.argv[2];
        const password = process.argv[3];

        if (!email || !password) {
            throw new Error('Please provide email and password as arguments');
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin user already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const admin = await User.create({
            email,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Admin user created successfully:', {
            email: admin.email,
            role: admin.role,
            createdAt: admin.createdAt
        });

    } catch (error: any) {
        console.error('Error creating admin user:', error.message);
    } finally {
        // Close MongoDB connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
createAdmin();
