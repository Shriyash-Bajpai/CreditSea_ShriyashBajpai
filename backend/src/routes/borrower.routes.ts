import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  submitPersonalDetails,
  uploadSalarySlip,
  applyLoan,
  getMyLoans,
  getMyProfile,
} from '../controllers/borrower.controller';

const router = Router();

// All borrower routes require authentication and borrower role
router.use(authenticate, authorize('borrower'));

router.get('/profile', getMyProfile);
router.post('/personal-details', submitPersonalDetails);
router.post('/upload-salary-slip', upload.single('salarySlip'), uploadSalarySlip);
router.post('/apply', applyLoan);
router.get('/loans', getMyLoans);

export default router;
