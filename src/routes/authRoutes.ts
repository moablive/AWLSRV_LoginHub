import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

// POST /api/auth/login
router.post('/login', AuthController.login);

// Futuro: Rota de refresh token ou logout ficaria aqui
// router.post('/refresh', AuthController.refreshToken);

export default router;