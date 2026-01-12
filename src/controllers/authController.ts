import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginInputDTO } from '../types/dtos/auth.dto';

const authService = new AuthService();

export class AuthController {

    /**
     * POST /auth/login
     */
    static async login(req: Request<{}, {}, LoginInputDTO>, res: Response) {
        try {
            const { email, senha_plana } = req.body;

            // Validação básica se esqueceu de mandar campos
            if (!email || !senha_plana) {
                return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
            }

            const result = await authService.login(req.body);
            
            return res.status(200).json(result);

        } catch (error: any) {
            console.error('Erro no Login:', error.message);

            // Tratamento de Erros Personalizados
            switch (error.message) {
                case 'CREDENCIAIS_INVALIDAS':
                    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
                
                case 'EMPRESA_BLOQUEADA':
                    return res.status(403).json({ error: 'O acesso da sua empresa está suspenso.' });

                case 'USUARIO_BLOQUEADO':
                    return res.status(403).json({ error: 'Seu usuário está inativo.' });

                default:
                    return res.status(500).json({ error: 'Erro interno no servidor.' });
            }
        }
    }

    /**
     * POST /auth/logout
     * O Frontend deve chamar isso e depois apagar o token do LocalStorage
     */
    static async logout(req: Request, res: Response) {
        try {
            // Pegamos o token do Header para (futuramente) invalidá-lo
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            await authService.logout(token);

            // Retorna 200 OK para o Front saber que pode limpar o storage
            return res.status(200).json({ 
                message: 'Logout realizado com sucesso.',
                action: 'CLEAR_LOCAL_STORAGE' // Dica para o frontend
            });

        } catch (error: any) {
            console.error('Erro no Logout:', error.message);
            return res.status(500).json({ error: 'Erro ao processar logout.' });
        }
    }
}