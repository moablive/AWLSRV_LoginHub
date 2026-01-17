import { Router } from 'express';
import { CompanyController } from '../../controllers/admin';

const router = Router();

// Dashboard: Listar todas as empresas
router.get('/companies', CompanyController.getAllCompanies); 

// Onboarding: Criar empresa + Admin
router.post('/companies', CompanyController.createCompany);

// Kill Switch: Ativar/Desativar empresa
router.patch('/companies/:id/status', CompanyController.toggleCompanyStatus);

export default router;