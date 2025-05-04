import { Router } from 'express';
import { getAllCompanies, createCompanyController, deleteCompanyController } from '../controllers/company.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllCompanies);
router.post('/', createCompanyController);
router.delete('/:companyId', deleteCompanyController);

export default router; 