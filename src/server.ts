import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import pool, { testConnection } from './db/db'; 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        console.log('⏳ Inicializando AWLSRV LoginHub...');

        // 1. Testa o Banco de Dados
        await testConnection();

        // 2. Verifica qual chave mestra está ativa
        const masterKey = process.env.MASTER_API_KEY || process.env.MASTER_KEY;
        const hasMasterKey = !!masterKey;
        const dbHost = process.env.DB_HOST;

        // 3. Inicia o Servidor HTTP
        const server = app.listen(PORT, () => {
            console.log('\n================================================');
            console.log(`🚀 STATUS:        ONLINE`);
            console.log(`🌍 AMBIENTE:      ${process.env.NODE_ENV?.toUpperCase() || 'DEVELOPMENT'}`);
            console.log(`🔌 BANCO:         ${dbHost} (Porta: ${process.env.DB_PORT})`);
            console.log(`🔐 MASTER KEY:    ${hasMasterKey ? '✅ ATIVADA' : '❌ DESATIVADA (Verifique .env)'}`);
            console.log(`📡 URL LOCAL:     http://localhost:${PORT}/api`);
            console.log('================================================\n');
        });

        // 4. Configura Graceful Shutdown
        const shutdown = () => {
            console.log('\n🛑 Recebido sinal de desligamento. Encerrando...');
            server.close(async () => {
                await pool.end();
                console.log('👋 Conexões fechadas. Tchau!');
                process.exit(0);
            });
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('\n💀 FALHA CRÍTICA NA INICIALIZAÇÃO:');
        console.error(error);
        process.exit(1);
    }
};

startServer();
