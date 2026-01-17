import bcrypt from 'bcryptjs';
import pool from '../../db/db';
import { EmpresaQueries } from '../../db/queries/empresa.queries';
import { UsuarioQueries } from '../../db/queries/usuario.queries';
import { CreateCompanyDTO } from '../../types/dtos/empresa.dto';

export class CompanyService {

    public async registerCompany(data: CreateCompanyDTO) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const companyRes = await client.query(EmpresaQueries.CREATE, [
                data.nome,
                data.documento,
                data.email,
                data.telefone || null,
            ]);

            const empresaId = companyRes.rows[0].id;

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(data.password, salt);

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
                empresaId,
                nome: data.nome,
                documento: data.documento,
                email: data.email,
                adminEmail: data.admin_email,
                message: 'Empresa e usuário administrador criados com sucesso'
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    public async getAllCompanies() {
        const { rows } = await pool.query(EmpresaQueries.LIST_ALL);
        return rows;
    }

    public async updateCompanyStatus(id: string, status: 'ativo' | 'inativo') {
        const { rows, rowCount } = await pool.query(
            EmpresaQueries.UPDATE_STATUS,
            [status, id]
        );

        if (rowCount === 0) {
            throw Object.assign(new Error('Empresa não encontrada'), { code: 'NOT_FOUND' });
        }

        return rows[0];
    }
}