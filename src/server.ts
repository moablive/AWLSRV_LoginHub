import dotenv from 'dotenv';
dotenv.config(); 

import app from './app';
import pool, { testConnection } from './db/db';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // 1. Testa o Banco de Dados
        await testConnection();

        // 2. Inicia o Servidor HTTP
        const server = app.listen(PORT, () => {
            console.log('================================================');
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API Base URL:     http://localhost:${PORT}/api`);
            console.log(`🔐 Master Key:       ${process.env.MASTER_API_KEY ? 'ATIVADA' : '⚠️ DESATIVADA'}`);
            console.log('================================================');
        });

        // 3. Configura Graceful Shutdown
        const shutdown = () => {
            console.log('\n🛑 Encerrando aplicação...');
            server.close(() => {
                pool.end().then(() => {
                    console.log('👋 Conexões encerradas com sucesso.');
                    process.exit(0);
                });
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        // Se o teste do banco falhar, o servidor nem tenta subir
        console.error('💀 Servidor abortado devido a erro no banco.');
        process.exit(1);
    }
};

startServer();