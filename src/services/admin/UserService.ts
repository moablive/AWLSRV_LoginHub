import bcrypt from 'bcryptjs';
import pool from '../../db/db';
import { UsuarioQueries } from '../../db/queries/usuario.queries';
import { CreateUserDTO } from '../../types/dtos/auth.dto';
import { UserResponse } from '../../types/user.types'

export class UserService {

    public async addUser(data: CreateUserDTO): Promise<void> {
        // Validações
        if (!data.empresa_id) throw Object.assign(new Error('Empresa é obrigatória'), { code: 'VALIDATION' });
        if (!data.email) throw Object.assign(new Error('E-mail é obrigatório'), { code: 'VALIDATION' });
        if (!data.password) throw Object.assign(new Error('Senha é obrigatória'), { code: 'VALIDATION' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // Executa a query
        await pool.query(UsuarioQueries.CREATE, [
            data.empresa_id,
            data.role || 'usuario',
            data.nome || null,
            data.email,
            passwordHash,
            data.telefone || null
        ]);
    }

    public async getAllUsersGlobal(): Promise<UserResponse[]> {
        const { rows } = await pool.query<UserResponse>(UsuarioQueries.LIST_GLOBAL);
        return rows;
    }

    public async getUsersByCompany(empresaId: string): Promise<UserResponse[]> {
        const { rows } = await pool.query<UserResponse>(UsuarioQueries.LIST_BY_COMPANY, [empresaId]);
        return rows;
    }

    /**
     * Remove o usuário com segurança usando Transação.
     * Isso garante que, se houver erro, sabemos exatamente o que houve.
     */
    public async removeUser(id: string): Promise<void> {
        // 1. Obtemos um cliente dedicado do pool para abrir uma transação
        const client = await pool.connect();

        try {
            await client.query('BEGIN'); // Inicia transação

            // [OPCIONAL] Se o seu banco NÃO tem ON DELETE CASCADE, 
            // você deve limpar dependências aqui. Exemplo:
            // await client.query('DELETE FROM user_logs WHERE user_id = $1', [id]);
            // await client.query('DELETE FROM user_sessions WHERE user_id = $1', [id]);

            // 2. Tenta deletar o usuário
            const { rowCount } = await client.query(UsuarioQueries.DELETE, [id]);

            if (rowCount === 0) {
                throw new Error('Usuário não encontrado para exclusão.');
            }

            await client.query('COMMIT'); // Confirma a alteração
        } catch (error: any) {
            await client.query('ROLLBACK'); // Desfaz tudo se der erro
            
            // Tratamento específico para erro de chave estrangeira (FK violation)
            if (error.code === '23503') { // Código PostgreSQL para FK Violation
                throw new Error('Não é possível remover este usuário pois ele possui registros vinculados (logs, histórico, etc).');
            }

            throw error; // Repassa outros erros
        } finally {
            client.release(); // Libera a conexão de volta para o pool
        }
    }
}