import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BorrowerProfile } from '../models/BorrowerProfile';
import { Loan } from '../models/Loan';
import { runBRE } from '../utils/bre';
import { calculateLoan } from '../utils/loanCalc';
import { EmploymentMode } from '../types';

// Step 2: Submit personal details + run BRE
export const submitPersonalDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;
    const userId = req.user!.userId;

    const breResult = runBRE({
      dateOfBirth: new Date(dateOfBirth),
      monthlySalary: Number(monthlySalary),
      pan: pan.toUpperCase(),
      employmentMode: employmentMode as EmploymentMode,
    });

    if (!breResult.passed) {
      res.status(422).json({
        success: false,
        message: 'Eligibility check failed',
        data: { breResult },
      });
      return;
    }

    // Upsert profile
    const profile = await BorrowerProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        fullName,
        pan: pan.toUpperCase(),
        dateOfBirth: new Date(dateOfBirth),
        monthlySalary: Number(monthlySalary),
        employmentMode,
        breCleared: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Personal details saved. BRE passed.',
      data: { profile, breResult },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
};

// Step 3: Upload salary slip
export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const profile = await BorrowerProfile.findOneAndUpdate(
      { userId },
      {
        salarySlipPath: req.file.path,
        salarySlipOriginalName: req.file.originalname,
      },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found. Please complete personal details first.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Salary slip uploaded successfully',
      data: { salarySlipPath: req.file.path, originalName: req.file.originalname },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
};

// Step 4: Apply for loan
export const applyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { principal, tenureDays } = req.body;
    const userId = req.user!.userId;

    const profile = await BorrowerProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }
    if (!profile.breCleared) {
      res.status(403).json({ success: false, message: 'BRE not cleared' });
      return;
    }
    if (!profile.salarySlipPath) {
      res.status(400).json({ success: false, message: 'Salary slip not uploaded' });
      return;
    }

    // Check no active loan already
    const existingLoan = await Loan.findOne({ borrowerId: userId, status: { $in: ['applied', 'sanctioned', 'disbursed'] } });
    if (existingLoan) {
      res.status(409).json({ success: false, message: 'You already have an active loan application' });
      return;
    }

    const calc = calculateLoan(Number(principal), Number(tenureDays));

    const loan = await Loan.create({
      borrowerId: userId,
      profileId: profile._id,
      ...calc,
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: { loan },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
};

// Get borrower's own loan(s)
export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const loans = await Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { loans } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get borrower's profile
export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await BorrowerProfile.findOne({ userId });
    res.json({ success: true, data: { profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
