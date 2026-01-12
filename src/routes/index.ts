import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes'; 
import adminRoutes from './adminRoutes'; 

const routes = Router();

// --- Detecção de Ambiente ---
// Reutilizamos a mesma lógica do banco de dados
const isDocker = process.env.IS_DOCKER === 'true';

// --- Health Check (Para monitoramento) ---
routes.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'online',
        service: 'AWLSRV LoginHub',
        version: '1.0.0',
        environment: isDocker ? '🐳 Docker (Rede Interna)' : '🍎 Mac (Acesso Remoto)', 
        db_target: process.env.DB_HOST || (isDocker ? 'awlsrvDB_postgres' : 'DuckDNS/Local'),
        message: '🚀 Sistema operante e protegido.',
        timestamp: new Date().toISOString()
    });
});

// --- Definição das Rotas ---

// Rotas Públicas (Login)
routes.use('/auth', authRoutes);

// Rotas Administrativas (Protegidas por Master Key ou Token)
routes.use('/admin', adminRoutes);

export default routes;