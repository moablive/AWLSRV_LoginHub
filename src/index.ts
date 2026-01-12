import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middlewares/corsMiddleware';
import routes from './routes';

dotenv.config();

const app = express();

// --- CONFIGURAÇÕES GLOBAIS ---
app.use(corsMiddleware);
app.use(express.json());

// --- ROTAS (Centralizadas) ---
app.use('/api', routes);

// --- TRATAMENTO DE ERROS ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
});

// --- INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
    console.log(`🛡️  API pronta para uso em http://localhost:${PORT}/api`);
});