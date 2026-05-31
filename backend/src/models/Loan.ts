import mongoose, { Document, Schema } from 'mongoose';
import { LoanStatus } from '../types';

export interface IPayment {
  _id?: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  date: Date;
  recordedBy: mongoose.Types.ObjectId;
}

export interface ILoan extends Document {
  _id: mongoose.Types.ObjectId;
  borrowerId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;
  principal: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  sanctionedBy?: mongoose.Types.ObjectId;
  sanctionedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  disbursedBy?: mongoose.Types.ObjectId;
  disbursedAt?: Date;
  payments: IPayment[];
  totalPaid: number;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  utrNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    profileId: { type: Schema.Types.ObjectId, ref: 'BorrowerProfile', required: true },
    principal: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    status: {
      type: String,
      enum: ['applied', 'sanctioned', 'rejected', 'disbursed', 'closed'],
      default: 'applied',
    },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanctionedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: { type: Date },
    payments: [PaymentSchema],
    totalPaid: { type: Number, default: 0 },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Loan = mongoose.model<ILoan>('Loan', LoanSchema);
