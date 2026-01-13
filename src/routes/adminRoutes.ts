// src/routes/admin.routes.ts
import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// =============================================================
// MIDDLEWARE DE SEGURANÇA (MASTER KEY)
// =============================================================
// Todas as rotas abaixo exigem o header 'x-api-key'
router.use(adminMiddleware);

// =============================================================
// ROTAS DE EMPRESAS (TENANTS)
// =============================================================

// Listar todas as empresas (Dashboard)
router.get('/companies', AdminController.getAllCompanies); 

// Criar nova empresa + Admin (Onboarding)
router.post('/companies', AdminController.createCompany);

// =============================================================
// ROTAS DE USUÁRIOS (IDENTIDADES)
// =============================================================

// Listar usuários de uma empresa específica
// Ex: GET /admin/companies/uuid-da-empresa/users
router.get('/companies/:id/users', AdminController.getUsersByCompany);

// Adicionar usuário a uma empresa existente
// Ex: POST /admin/users (Body contém { empresa_id, ... })
router.post('/users', AdminController.addUser);

export default router;