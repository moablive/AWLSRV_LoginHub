import { Router } from 'express';
import { UserController } from '../../controllers/admin';

const router = Router();

// Dashboard Global: Listar TODOS os usuários
router.get('/users', UserController.getAllUsers);

// Adicionar usuário a uma empresa (Payload tem o ID da empresa)
router.post('/users', UserController.addUser);

// Remover usuário (Demissão/Correção)
router.delete('/users/:id', UserController.removeUser);

// Listar usuários de uma empresa específica
// (Embora a URL comece com companies, é uma busca de usuários)
router.get('/companies/:id/users', UserController.getUsersByCompany);

export default router;