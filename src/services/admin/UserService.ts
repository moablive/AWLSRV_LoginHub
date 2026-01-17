import bcrypt from 'bcryptjs';
import pool from '../../db/db';
import { UsuarioQueries } from '../../db/queries/usuario.queries';
import { CreateUserDTO } from '../../types/dtos/auth.dto';

export class UserService {

    public async addUser(data: CreateUserDTO): Promise<void> {
        if (!data.empresa_id) throw Object.assign(new Error('Empresa é obrigatória'), { code: 'VALIDATION' });
        if (!data.email) throw Object.assign(new Error('E-mail é obrigatório'), { code: 'VALIDATION' });
        if (!data.password) throw Object.assign(new Error('Senha é obrigatória'), { code: 'VALIDATION' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        await pool.query(UsuarioQueries.CREATE, [
            data.empresa_id,
            data.role || 'usuario',
            data.nome || null,
            data.email,
            passwordHash,
            data.telefone || null
        ]);
    }

    public async getAllUsersGlobal() {
        const { rows } = await pool.query(UsuarioQueries.LIST_GLOBAL);
        return rows;
    }

    public async getUsersByCompany(empresaId: string) {
        const { rows } = await pool.query(UsuarioQueries.LIST_BY_COMPANY, [empresaId]);
        return rows;
    }

    public async removeUser(id: string): Promise<void> {
        const { rowCount } = await pool.query(UsuarioQueries.DELETE, [id]);

        if (rowCount === 0) {
            throw new Error('Usuário não encontrado.');
        }
    }
}