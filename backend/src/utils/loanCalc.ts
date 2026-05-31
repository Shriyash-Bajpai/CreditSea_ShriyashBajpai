export interface LoanCalculation {
  principal: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
}

export const calculateLoan = (principal: number, tenureDays: number, ratePercent = 12): LoanCalculation => {
  const simpleInterest = (principal * ratePercent * tenureDays) / (365 * 100);
  const totalRepayment = principal + simpleInterest;
  return {
    principal,
    tenureDays,
    interestRate: ratePercent,
    simpleInterest: Math.round(simpleInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
};
