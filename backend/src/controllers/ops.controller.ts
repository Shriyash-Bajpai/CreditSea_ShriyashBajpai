import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Loan } from '../models/Loan';
import { User } from '../models/User';
import { BorrowerProfile } from '../models/BorrowerProfile';
import mongoose from 'mongoose';

// ─── SALES MODULE ──────────────────────────────────────────────
// Users who registered but haven't applied (lead tracking)
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const borrowers = await User.find({ role: 'borrower' }).sort({ createdAt: -1 });
    const borrowerIds = borrowers.map((b) => b._id);

    const profilesWithLoans = await Loan.distinct('borrowerId');

    const data = await Promise.all(
      borrowers.map(async (b) => {
        const profile = await BorrowerProfile.findOne({ userId: b._id });
        const hasApplied = profilesWithLoans.some((id) => id.toString() === b._id.toString());
        return {
          user: { id: b._id, name: b.name, email: b.email, createdAt: b.createdAt },
          profile: profile || null,
          hasApplied,
          stage: !profile ? 'registered' : !profile.breCleared ? 'profile_incomplete' : !profile.salarySlipPath ? 'needs_salary_slip' : hasApplied ? 'applied' : 'ready_to_apply',
        };
      })
    );

    res.json({ success: true, data: { leads: data } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── SANCTION MODULE ───────────────────────────────────────────
export const getAppliedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'applied' })
      .populate('borrowerId', 'name email')
      .populate('profileId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { loans } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sanctionLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId);
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found' }); return; }
    if (loan.status !== 'applied') { res.status(400).json({ success: false, message: 'Loan is not in applied state' }); return; }

    loan.status = 'sanctioned';
    loan.sanctionedBy = new mongoose.Types.ObjectId(req.user!.userId);
    loan.sanctionedAt = new Date();
    await loan.save();

    res.json({ success: true, message: 'Loan sanctioned successfully', data: { loan } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const rejectLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { reason } = req.body;
    if (!reason) { res.status(400).json({ success: false, message: 'Rejection reason is required' }); return; }

    const loan = await Loan.findById(loanId);
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found' }); return; }
    if (loan.status !== 'applied') { res.status(400).json({ success: false, message: 'Only applied loans can be rejected' }); return; }

    loan.status = 'rejected';
    loan.rejectedBy = new mongoose.Types.ObjectId(req.user!.userId);
    loan.rejectedAt = new Date();
    loan.rejectionReason = reason;
    await loan.save();

    res.json({ success: true, message: 'Loan rejected', data: { loan } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DISBURSEMENT MODULE ───────────────────────────────────────
export const getSanctionedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'sanctioned' })
      .populate('borrowerId', 'name email')
      .populate('profileId')
      .sort({ sanctionedAt: -1 });
    res.json({ success: true, data: { loans } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const disburseLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId);
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found' }); return; }
    if (loan.status !== 'sanctioned') { res.status(400).json({ success: false, message: 'Only sanctioned loans can be disbursed' }); return; }

    loan.status = 'disbursed';
    loan.disbursedBy = new mongoose.Types.ObjectId(req.user!.userId);
    loan.disbursedAt = new Date();
    await loan.save();

    res.json({ success: true, message: 'Loan disbursed successfully', data: { loan } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── COLLECTION MODULE ─────────────────────────────────────────
export const getDisbursedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: { $in: ['disbursed', 'closed'] } })
      .populate('borrowerId', 'name email')
      .populate('profileId')
      .sort({ disbursedAt: -1 });
    res.json({ success: true, data: { loans } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { utrNumber, amount, date } = req.body;

    if (!utrNumber || !amount) {
      res.status(400).json({ success: false, message: 'UTR number and amount are required' });
      return;
    }

    // UTR must be globally unique
    const utrExists = await Loan.findOne({ 'payments.utrNumber': utrNumber });
    if (utrExists) {
      res.status(409).json({ success: false, message: 'UTR number already exists. Each payment must have a unique UTR.' });
      return;
    }

    const loan = await Loan.findById(loanId);
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found' }); return; }
    if (loan.status !== 'disbursed') { res.status(400).json({ success: false, message: 'Payments can only be recorded for disbursed loans' }); return; }

    const paymentAmount = Number(amount);
    const outstanding = loan.totalRepayment - loan.totalPaid;

    if (paymentAmount <= 0) {
      res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
      return;
    }
    if (paymentAmount > outstanding) {
      res.status(400).json({ success: false, message: `Payment exceeds outstanding balance of ₹${outstanding.toFixed(2)}` });
      return;
    }

    loan.payments.push({
      utrNumber,
      amount: paymentAmount,
      date: date ? new Date(date) : new Date(),
      recordedBy: new mongoose.Types.ObjectId(req.user!.userId),
    });

    loan.totalPaid = loan.totalPaid + paymentAmount;

    // Auto-close if fully paid
    if (Math.abs(loan.totalPaid - loan.totalRepayment) < 0.01) {
      loan.status = 'closed';
      loan.closedAt = new Date();
    }

    await loan.save();

    res.json({
      success: true,
      message: loan.status === 'closed' ? 'Payment recorded. Loan fully paid and closed!' : 'Payment recorded successfully',
      data: { loan },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
};

// ─── ADMIN: All loans overview ─────────────────────────────────
export const getAllLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const loans = await Loan.find(filter)
      .populate('borrowerId', 'name email')
      .populate('profileId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { loans } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getLoanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.loanId)
      .populate('borrowerId', 'name email')
      .populate('profileId')
      .populate('sanctionedBy', 'name email')
      .populate('disbursedBy', 'name email');
    if (!loan) { res.status(404).json({ success: false, message: 'Loan not found' }); return; }
    res.json({ success: true, data: { loan } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
