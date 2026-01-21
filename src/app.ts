import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';

const app = express();

// ==========================================
// 1. Middlewares Globais
// ==========================================
app.use(helmet());       
app.use(cors());         
app.use(express.json()); 

// ==========================================
// 2. Rota de Diagnóstico (Health Check)
// ==========================================
app.get('/api', (req, res) => {
    const isDocker = process.env.DB_HOST === 'awlsrvDB_postgres';
    const hasMasterKey = !!(process.env.MASTER_KEY || process.env.MASTER_API_KEY);

    res.json({ 
        status: 'online',
        service: 'AWLSRV LoginHub', 
        version: '1.0.0',
        environment: isDocker ? '🐳 Docker (Rede Cloudflare)' : '🍎 Mac / Local', 
        db_target: process.env.DB_HOST,
        security: {
            master_key: hasMasterKey ? 'ATIVADA' : 'DESATIVADA'
        },
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// 3. Demais Rotas
// ==========================================
app.use('/api', router);

export default app;
