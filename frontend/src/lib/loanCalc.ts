export const calculateLoan = (principal: number, tenureDays: number, rate = 12) => {
  const si = (principal * rate * tenureDays) / (365 * 100);
  return {
    simpleInterest: Math.round(si * 100) / 100,
    totalRepayment: Math.round((principal + si) * 100) / 100,
  };
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
