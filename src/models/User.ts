import mongoose, { Schema } from 'mongoose';

const AdminUserSchema: Schema = new Schema({
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

const User = mongoose.models.User || mongoose.model('User', AdminUserSchema);

export default User;
