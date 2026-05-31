import { BREResult, EmploymentMode } from '../types';

interface BREInput {
  dateOfBirth: Date;
  monthlySalary: number;
  pan: string;
  employmentMode: EmploymentMode;
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const runBRE = (data: BREInput): BREResult => {
  const failedRules: string[] = [];

  // Age check (23 - 50)
  const today = new Date();
  const birthDate = new Date(data.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 23 || age > 50) {
    failedRules.push(`Age must be between 23 and 50 years. Your age: ${age}`);
  }

  // Salary check
  if (data.monthlySalary < 25000) {
    failedRules.push(`Monthly salary must be at least ₹25,000. Your salary: ₹${data.monthlySalary}`);
  }

  // PAN validation
  if (!PAN_REGEX.test(data.pan.toUpperCase())) {
    failedRules.push('PAN number format is invalid. Expected format: ABCDE1234F');
  }

  // Employment check
  if (data.employmentMode === 'unemployed') {
    failedRules.push('Unemployed applicants are not eligible for a loan');
  }

  return {
    passed: failedRules.length === 0,
    failedRules,
  };
};
