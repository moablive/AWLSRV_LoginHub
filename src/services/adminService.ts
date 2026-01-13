import bcrypt from 'bcryptjs'; 
import pool from '../db/db'; 
import { UsuarioQueries } from '../db/queries/usuario.queries';
import { EmpresaQueries } from '../db/queries/empresa.queries';
import { CreateUserDTO } from '../types/dtos/auth.dto';
import { CreateCompanyDTO } from '../types/dtos/empresa.dto';

export class AdminService {

    /**
     * 1. Onboarding: Cria Empresa + Usuário Admin em uma transação atômica.
     */
    public async registerCompany(data: CreateCompanyDTO) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN'); 

            // A. Cria a Empresa
            const companyRes = await client.query(EmpresaQueries.CREATE, [
                data.nome,
                data.documento,
                data.email,
                data.telefone
            ]);
            
            const empresaId = companyRes.rows[0].id;

            // B. Gera Hash da Senha
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(data.password, salt);

            // C. Cria o Admin
            // 3. CORREÇÃO: Usar UsuarioQueries (conforme importado)
            await client.query(UsuarioQueries.CREATE, [
                empresaId,
                'admin', 
                data.admin_nome,
                data.admin_email,
                passwordHash,
                data.admin_telefone
            ]);

            await client.query('COMMIT'); 

            return { 
                message: 'Empresa e Admin criados com sucesso!', 
                empresaId,
                adminEmail: data.admin_email
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * 2. Adicionar Usuário Normal em Empresa Existente
     */
    public async addUser(data: CreateUserDTO): Promise<void> {
        if (!data.empresa_id) {
            throw new Error('ID da empresa é obrigatório para criar usuário.');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // 3. CORREÇÃO: Usar UsuarioQueries
        await pool.query(UsuarioQueries.CREATE, [
            data.empresa_id,
            data.role, 
            data.nome,
            data.email,
            passwordHash,
            data.telefone || null 
        ]);
    }

    // ==========================================================
    // MÉTODOS DE LEITURA
    // ==========================================================

    public async getAllCompanies() {
        const result = await pool.query(EmpresaQueries.LIST_ALL);
        return result.rows;
    }

    public async getUsersByCompany(empresaId: string) {
        // 3. CORREÇÃO: Usar UsuarioQueries
        const result = await pool.query(UsuarioQueries.LIST_BY_COMPANY, [empresaId]);
        return result.rows;
    }
}