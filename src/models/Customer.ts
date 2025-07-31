import mongoose, { Schema } from 'mongoose';

export const CustomerSchema: Schema = new Schema({
  firstname: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastname: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    required: false,
    trim: true,
    default: 'US'
  },
  postalCode: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  transactionPin: {
    type: String,
    required: [true, 'Transaction PIN is required']
    // Note: PIN validation is done before hashing in the API
    // The stored value is a bcrypt hash, not the original PIN
  },
}, {
  timestamps: true
});


export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
