import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getLeads,
  getAppliedLoans, sanctionLoan, rejectLoan,
  getSanctionedLoans, disburseLoan,
  getDisbursedLoans, recordPayment,
  getAllLoans, getLoanById,
} from '../controllers/ops.controller';

const router = Router();

router.use(authenticate);

// Sales module
router.get('/sales/leads', authorize('admin', 'sales'), getLeads);

// Sanction module
router.get('/sanction/loans', authorize('admin', 'sanction'), getAppliedLoans);
router.patch('/sanction/loans/:loanId/approve', authorize('admin', 'sanction'), sanctionLoan);
router.patch('/sanction/loans/:loanId/reject', authorize('admin', 'sanction'), rejectLoan);

// Disbursement module
router.get('/disbursement/loans', authorize('admin', 'disbursement'), getSanctionedLoans);
router.patch('/disbursement/loans/:loanId/disburse', authorize('admin', 'disbursement'), disburseLoan);

// Collection module
router.get('/collection/loans', authorize('admin', 'collection'), getDisbursedLoans);
router.post('/collection/loans/:loanId/payments', authorize('admin', 'collection'), recordPayment);

// Admin: full view
router.get('/loans', authorize('admin'), getAllLoans);
router.get('/loans/:loanId', authorize('admin', 'sanction', 'disbursement', 'collection'), getLoanById);

export default router;
