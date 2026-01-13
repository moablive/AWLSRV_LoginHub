import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';

const app = express();

// ==========================================
// 1. Middlewares Globais
// ==========================================
app.use(helmet());       // Segurança: Proteção de headers HTTP
app.use(cors());         // Segurança: Permite acesso do Frontend (React)
app.use(express.json()); // Funcionalidade: Permite ler JSON no Body da requisição

// ==========================================
// 2. Rotas
// ==========================================
// Monta todas as rotas sob o prefixo '/api'
// Resultado final das URLs:
// - Health Check: GET /api/
// - Login:        POST /api/auth/login
// - Admin:        POST /api/admin/users
app.use('/api', routes);

export default app;