import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import pool from '../db/db'; 
import { AuthQueries } from '../db/queries/auth.queries';
import { 
    LoginInputDTO, 
    LoginResponseDTO, 
    UserLoginQueryResult, 
    JWTPayload,
    UserRole 
} from '../types/dtos/auth.dto';

export class AuthService {
    
    // Método de Login fortemente tipado
    public async login(data: LoginInputDTO): Promise<LoginResponseDTO> {
        
        // 1. Busca no Banco (Traz Usuário + Empresa + Role)
        const result = await pool.query(AuthQueries.FIND_BY_EMAIL, [data.email]);
        
        // Dica de segurança: Não diga "Usuário não encontrado", diga "Credenciais inválidas"
        if (result.rows.length === 0) {
            throw new Error('CREDENCIAIS_INVALIDAS');
        }

        // Tipagem do resultado do banco
        const user: UserLoginQueryResult = result.rows[0];

        // 2. Verifica Status da Empresa
        // CORREÇÃO: O status no banco é 'ativo' (masculino), conforme EmpresaQueries
        if (user.empresa_status !== 'ativo') {
            throw new Error('EMPRESA_BLOQUEADA');
        }

        // OBS: Removemos a checagem de 'user_status' pois essa coluna não existe no schema 'usuarios' atual.
        // Se quiser implementar bloqueio de usuário no futuro, precisa criar a coluna no banco primeiro.

        // 3. Valida Senha
        // CORREÇÃO: O DTO agora usa 'password', não 'senha_plana'
        const senhaValida = await bcrypt.compare(data.password, user.senha_hash);
        
        if (!senhaValida) {
            throw new Error('CREDENCIAIS_INVALIDAS');
        }

        // (Opcional) Atualiza data do último login para auditoria
        await pool.query(AuthQueries.UPDATE_LAST_LOGIN, [user.id]);

        // 4. Gera o Token JWT
        // Verifica se a chave secreta existe (Evita crash em produção)
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('ERRO_CONFIGURACAO_SERVIDOR'); // JWT_SECRET ausente
        }

        const payload: JWTPayload = {
            sub: user.id,
            email: user.email,
            empresaId: user.empresa_id,
            role: user.role as UserRole // Cast seguro pois validamos ao criar
        };

        const token = jwt.sign(payload, jwtSecret, {
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
                role: user.role as UserRole
            },
            empresa: {
                id: user.empresa_id,
                nome: user.empresa_nome,
                status: user.empresa_status
            }
        };
    }

    /**
     * Realiza o Logout (Lógica de Negócio)
     * No futuro, aqui entra a adição do token em uma Blacklist (Redis)
     */
    public async logout(token: string | undefined): Promise<void> {
        // Se quiséssemos invalidar o token antes do tempo (Blacklist), faríamos aqui.
        if (!token) {
            return;
        }
        
        // Log para fins de debug/auditoria
        // console.log(`[AUTH] Logout efetuado para token final ...${token.slice(-6)}`);
        return;
    }
}