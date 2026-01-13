import bcrypt from 'bcryptjs'; 
import pool from '../db/db'; 
import { UsuarioQueries } from '../db/queries/usuario.queries';
import { EmpresaQueries } from '../db/queries/empresa.queries';
import { CreateUserDTO } from '../types/dtos/auth.dto';
import { CreateCompanyDTO } from '../types/dtos/empresa.dto';

export class AdminService {

    // ==========================================================
    // 1. PROVISIONAMENTO DE TENANTS (EMPRESAS)
    // ==========================================================
    
    /**
     * Cria a estrutura inicial: Empresa + Primeiro Admin.
     * Utiliza transação (BEGIN/COMMIT) para garantir que não criamos
     * uma empresa sem dono ou um dono sem empresa.
     */
    public async registerCompany(data: CreateCompanyDTO) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN'); 

            // A. Inserir Empresa
            const companyRes = await client.query(EmpresaQueries.CREATE, [
                data.nome,
                data.documento,
                data.email,
                data.telefone || null
            ]);
            
            const empresaId = companyRes.rows[0].id;

            // B. Preparar Credencial (Hash)
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(data.password, salt);

            // C. Inserir Usuário Admin
            // Passamos a string 'admin'. A Query SQL fará o sub-select para achar o ID.
            await client.query(UsuarioQueries.CREATE, [
                empresaId,
                'admin', 
                data.admin_nome,
                data.admin_email,
                passwordHash,
                data.admin_telefone || null
            ]);

            await client.query('COMMIT'); 

            return { 
                status: 'success',
                message: 'Tenant provisionado. Usuário pronto para solicitar Token.', 
                empresaId,
                usuario: data.admin_email
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error; // Repassa o erro para o Controller tratar
        } finally {
            client.release();
        }
    }

    // ==========================================================
    // 2. PROVISIONAMENTO DE IDENTIDADES (USUÁRIOS)
    // ==========================================================

    /**
     * Adiciona usuários secundários (Admin ou Comum) a uma empresa existente.
     * Estes usuários usarão login/senha para gerar Tokens Bearer na API Pública.
     */
    public async addUser(data: CreateUserDTO): Promise<void> {
        // Validações de Regra de Negócio
        if (!data.empresa_id) {
            throw new Error('Vinculação obrigatória: O usuário deve pertencer a uma empresa.');
        }

        if (!data.password) {
            throw new Error('Senha é obrigatória para provisionar um novo usuário.');
        }

        // Criptografia (Security by Design)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // A role ('admin' ou 'usuario') define as permissões no Token JWT
        await pool.query(UsuarioQueries.CREATE, [
            data.empresa_id,
            data.role || 'usuario', // Fallback seguro para 'usuario' se vier vazio
            data.nome,
            data.email,
            passwordHash,
            data.telefone || null 
        ]);
    }

    // ==========================================================
    // 3. AUDITORIA E LISTAGEM (DASHBOARD)
    // ==========================================================

    public async getAllCompanies() {
        const result = await pool.query(EmpresaQueries.LIST_ALL);
        return result.rows;
    }

    public async getUsersByCompany(empresaId: string) {
        const result = await pool.query(UsuarioQueries.LIST_BY_COMPANY, [empresaId]);
        return result.rows;
    }
}