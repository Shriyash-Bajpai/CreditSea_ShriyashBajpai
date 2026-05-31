export type Role = 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower';

export type LoanStatus =
  | 'applied'
  | 'sanctioned'
  | 'rejected'
  | 'disbursed'
  | 'closed';

export type EmploymentMode = 'salaried' | 'self_employed' | 'unemployed';

export interface JWTPayload {
  userId: string;
  role: Role;
  email: string;
}

export interface BREResult {
  passed: boolean;
  failedRules: string[];
}
