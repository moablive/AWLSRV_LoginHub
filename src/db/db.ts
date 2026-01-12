import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Verifica se estamos rodando dentro do Docker
const isDocker = process.env.IS_DOCKER === 'true';

let dbConfig: PoolConfig;

// Fallback de segurança para o nome do banco (igual ao .env)
const dbName = process.env.DB_NAME || 'login_hub'; 
const dbUser = process.env.DB_USER || 'admin_root';

if (isDocker) {
    // --- MODO DOCKER (Rede Interna) ---
    // Zero latência, comunicação direta container-a-container
    console.log('🐳 DETECTADO AMBIENTE: DOCKER (LoginDocker - Rede Interna)');
    dbConfig = {
        host: 'awlsrvDB_postgres', // Nome fixo do serviço no Docker
        port: 5432,                // Porta interna padrão do Postgres
        user: dbUser,
        password: process.env.DB_PASS, // Obrigatório
        database: dbName,
    };
} else {
    // --- MODO MAC (Acesso Externo via DDNS) ---
    // Conexão via Internet (DDNS) -> Modem -> Porta 9432 -> Servidor
    console.log('🍎 DETECTADO AMBIENTE: MAC/LOCAL (LoginMac - Acesso Remoto)');
    dbConfig = {
        host: process.env.DB_HOST || 'docker-home-cloud.duckdns.org',
        port: parseInt(process.env.DB_PORT || '9432'), // Porta externa do Modem
        user: dbUser,
        password: process.env.DB_PASS, // Obrigatório
        database: dbName,
        // Dica Pro: Aumenta um pouco o timeout para conexões externas via internet
        connectionTimeoutMillis: 5000, 
    };
}

// Cria o Pool de conexões
const pool = new Pool(dbConfig);

pool.on('connect', () => {
    const ambiente = isDocker ? 'INTERNO (Docker)' : 'EXTERNO (Mac)';
    console.log(`📦 Banco Conectado: [${dbConfig.database}] via ${ambiente}`);
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
});

pool.on('error', (err) => {
    console.error('🔥 Erro Crítico/Queda na conexão com o Banco:', err);
    // Em produção, poderiamos tentar reconectar ou alertar um sistema de monitoramento
});

export default pool;