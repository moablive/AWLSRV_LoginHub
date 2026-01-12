import bcrypt from 'bcryptjs'; 
import pool from '../db/db'; 
import { AuthQueries } from '../db/queries/auth.queries';
import { EmpresaQueries } from '../db/queries/empresa.queries';
import { CreateEmpresaComAdminDTO, EmpresaCreatedDTO } from '../types/dtos/empresa.dto';
import { CreateUserDTO } from '../types/dtos/auth.dto';

export class AdminService {

    /**
     * 1. Onboarding: Cria Empresa + Usuário Admin em uma transação atômica.
     */
    public async registerCompany(data: CreateEmpresaComAdminDTO): Promise<EmpresaCreatedDTO> {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN'); // --- INÍCIO DA TRANSAÇÃO ---

            // A. Cria a Empresa
            // OBS: Certifique-se que sua EmpresaQueries.CREATE espera estes parâmetros na ordem correta.
            const companyRes = await client.query(EmpresaQueries.CREATE, [
                data.empresa_nome,
                data.empresa_documento,
                data.empresa_telefone
                // Se sua query aceitar dominio/email, adicione aqui: data.empresa_dominio, etc.
            ]);
            
            const empresaId = companyRes.rows[0].id;

            // B. Gera Hash da Senha do Admin
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(data.admin_senha, salt);

            // C. Cria o Usuário Admin (Dono) vinculado à empresa
            // A query AuthQueries.CREATE_USER espera: [empresa_id, role_slug, nome, email, senha, telefone]
            await client.query(AuthQueries.CREATE_USER, [
                empresaId,
                'admin', // Role fixa para o criador da empresa
                data.admin_nome,
                data.admin_email,
                passwordHash,
                data.admin_telefone
            ]);

            await client.query('COMMIT'); // --- SUCESSO ---

            return { 
                message: 'Empresa e Admin criados com sucesso!', 
                empresaId,
                adminEmail: data.admin_email
            };

        } catch (error) {
            await client.query('ROLLBACK'); // --- DESFAZ TUDO SE DER ERRO ---
            throw error; // Repassa o erro para o Controller tratar
        } finally {
            client.release(); // Devolve a conexão para o pool
        }
    }

    /**
     * 2. Adicionar Usuário Normal em Empresa Existente
     */
    public async addUser(data: CreateUserDTO): Promise<void> {
        // Validação extra: Se a empresa não vier preenchida (caso não tratada no controller)
        if (!data.empresa_id) {
            throw new Error('ID da empresa é obrigatório para criar usuário.');
        }

        // Gera Hash
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // Insere usando a Query isolada
        await pool.query(AuthQueries.CREATE_USER, [
            data.empresa_id,
            data.role, // 'admin' ou 'usuario'
            data.nome,
            data.email,
            passwordHash,
            data.telefone
        ]);
    }
}