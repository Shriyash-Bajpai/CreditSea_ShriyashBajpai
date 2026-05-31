import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '../types';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: Role;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'sales', 'sanction', 'disbursement', 'collection', 'borrower'],
      default: 'borrower',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password, ...safeRet } = ret;
    return safeRet;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
