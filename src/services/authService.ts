import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import pool from '../db/db'; 
import { AuthQueries } from '../db/queries/auth.queries';
import { LoginInputDTO, LoginResponseDTO, UserLoginQueryResult, JWTPayload } from '../types/dtos/auth.dto';

export class AuthService {
    
    // Método de Login fortemente tipado
    public async login(data: LoginInputDTO): Promise<LoginResponseDTO> {
        
        // 1. Busca no Banco (Traz Usuário + Empresa + Role)
        const result = await pool.query(AuthQueries.FIND_BY_EMAIL, [data.email]);
        
        // Dica de segurança: Não diga "Usuário não encontrado", diga "Credenciais inválidas"
        if (result.rows.length === 0) {
            throw new Error('CREDENCIAIS_INVALIDAS');
        }

        const user: UserLoginQueryResult = result.rows[0];

        // 2. Verifica Status da Empresa e Usuário
        if (user.empresa_status !== 'ativa') {
            throw new Error('EMPRESA_BLOQUEADA');
        }
        if (user.user_status !== 'ativo') {
            throw new Error('USUARIO_BLOQUEADO');
        }

        // 3. Valida Senha
        const senhaValida = await bcrypt.compare(data.senha_plana, user.senha_hash);
        if (!senhaValida) {
            throw new Error('CREDENCIAIS_INVALIDAS');
        }

        // 4. Gera o Token JWT
        const payload: JWTPayload = {
            sub: user.id,
            email: user.email,
            empresaId: user.empresa_id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: '8h' // Expiração do token
        });

        // 5. Retorna o DTO Limpo (Sem senha hash)
        return {
            token,
            expiresIn: 28800, // 8h em segundos
            usuario: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role
            },
            empresa: {
                id: user.empresa_id,
                nome: user.empresa_nome,
                status: user.empresa_status
            }
        };
    }
}