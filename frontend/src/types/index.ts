export type Role = 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower';
export type LoanStatus = 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed';
export type EmploymentMode = 'salaried' | 'self_employed' | 'unemployed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface BorrowerProfile {
  _id: string;
  userId: string;
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipPath?: string;
  breCleared: boolean;
}

export interface Payment {
  _id?: string;
  utrNumber: string;
  amount: number;
  date: string;
}

export interface Loan {
  _id: string;
  borrowerId: User | string;
  profileId: BorrowerProfile | string;
  principal: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  payments: Payment[];
  totalPaid: number;
  rejectionReason?: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
}
