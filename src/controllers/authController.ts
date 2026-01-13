import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginInputDTO } from '../types/dtos/auth.dto';

const authService = new AuthService();

export class AuthController {

    /**
     * POST /auth/login
     * Recebe credenciais, valida e retorna o Token JWT + Dados do Usuário
     */
    static async login(
        // AJUSTE 1: Record<string, never> satisfaz o linter melhor que {}
        req: Request<Record<string, never>, Record<string, never>, LoginInputDTO>, 
        res: Response
    ) {
        try {
            // Agora o 'password' é reconhecido graças ao ajuste que fizemos no DTO
            const { email, password } = req.body;

            // 1. Validação de Campos Obrigatórios
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Dados incompletos',
                    message: 'E-mail e senha são obrigatórios.' 
                });
            }

            // 2. Chamada ao Serviço
            const result = await authService.login({ email, password });
            
            // 3. Sucesso (200 OK)
            return res.status(200).json(result);

        } catch (error: unknown) {
            // AJUSTE 2: Tipagem segura do erro
            const err = error as Error;
            console.error('[AuthController] Erro no Login:', err.message);

            // 4. Tratamento de Erros de Negócio (Mapeamento Service -> HTTP)
            switch (err.message) {
                case 'CREDENCIAIS_INVALIDAS':
                    return res.status(401).json({ 
                        error: 'Acesso Negado',
                        message: 'E-mail ou senha incorretos.' 
                    });
                
                case 'EMPRESA_BLOQUEADA':
                    return res.status(403).json({ 
                        error: 'Acesso Suspenso',
                        message: 'A conta da sua empresa está inativa. Contate o suporte.' 
                    });

                case 'USUARIO_BLOQUEADO':
                    return res.status(403).json({ 
                        error: 'Conta Inativa',
                        message: 'Seu usuário foi desativado pelo administrador.' 
                    });

                default:
                    // Erros inesperados
                    return res.status(500).json({ 
                        error: 'Erro Interno',
                        message: 'Ocorreu um problema ao processar seu login. Tente novamente.' 
                    });
            }
        }
    }

    /**
     * POST /auth/logout
     */
    static async logout(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;
            
            const token = authHeader && authHeader.startsWith('Bearer ') 
                ? authHeader.split(' ')[1] 
                : undefined;

            if (token) {
                await authService.logout(token);
            }

            return res.status(200).json({ 
                message: 'Logout realizado com sucesso.',
                action: 'CLEAR_LOCAL_STORAGE' 
            });

        } catch (error: unknown) {
            const err = error as Error;
            console.error('[AuthController] Erro no Logout:', err.message);
            return res.status(200).json({ action: 'CLEAR_LOCAL_STORAGE' });
        }
    }
}