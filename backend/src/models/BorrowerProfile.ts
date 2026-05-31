import mongoose, { Document, Schema } from 'mongoose';
import { EmploymentMode } from '../types';

export interface IBorrowerProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipPath?: string;
  salarySlipOriginalName?: string;
  breCleared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowerProfileSchema = new Schema<IBorrowerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    pan: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'],
    },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentMode: {
      type: String,
      enum: ['salaried', 'self_employed', 'unemployed'],
      required: true,
    },
    salarySlipPath: { type: String },
    salarySlipOriginalName: { type: String },
    breCleared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BorrowerProfile = mongoose.model<IBorrowerProfile>('BorrowerProfile', BorrowerProfileSchema);
