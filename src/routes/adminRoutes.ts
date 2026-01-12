// src/routes/admin.routes.ts
import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

router.use(adminMiddleware);


router.post('/companies', AdminController.createCompany);
router.post('/users', AdminController.addUser);

export default router;