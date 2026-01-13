import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Verifica se estamos rodando dentro do Docker
const isDocker = process.env.IS_DOCKER === 'true';

let dbConfig: PoolConfig;

// Fallback de segurança 
const dbName = process.env.DB_NAME || 'login_hub'; 
const dbUser = process.env.DB_USER || 'admin_root';
const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS; 

if (isDocker) {
    // --- MODO DOCKER (Rede Interna) ---
    console.log('🐳 DETECTADO AMBIENTE: DOCKER (LoginDocker - Rede Interna)');
    dbConfig = {
        host: 'awlsrvDB_postgres',
        port: 5432,
        user: dbUser,
        password: dbPassword,
        database: dbName,
    };
} else {
    // --- MODO MAC (Acesso Externo via DDNS) ---
    console.log('🍎 DETECTADO AMBIENTE: MAC/LOCAL (LoginMac - Acesso Remoto)');
    dbConfig = {
        host: process.env.DB_HOST || 'docker-home-cloud.duckdns.org',
        port: parseInt(process.env.DB_PORT || '9432'),
        user: dbUser,
        password: dbPassword,
        database: dbName,
        connectionTimeoutMillis: 10000, 
    };
}

// Cria o Pool de conexões
const pool = new Pool(dbConfig);

// Listeners globais de eventos do Pool
pool.on('error', (err) => {
    console.error('🔥 Erro Crítico/Queda na conexão com o Banco:', err);
});

/**
 * Função auxiliar para testar a conexão antes de subir o servidor
 */
export const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log(`✅ Banco de Dados Conectado! [Base: ${dbConfig.database}]`);
        client.release();
        return true;
    } catch (error: any) {
        console.error('❌ Falha ao conectar no Banco de Dados:', error.message);
        throw error; // Repassa o erro para quem chamou (o server.ts)
    }
};

export default pool;