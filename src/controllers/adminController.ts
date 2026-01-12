import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
// Importamos os DTOs para tipar o Body da requisição
import { CreateEmpresaComAdminDTO } from '../types/dtos/empresa.dto';
import { CreateUserDTO } from '../types/dtos/auth.dto';

// Instância Singleton do Service
const adminService = new AdminService();

export class AdminController {

    /**
     * POST /companies
     * Cria uma nova Empresa + Usuário Admin (Onboarding)
     */
    static async createCompany(req: Request<{}, {}, CreateEmpresaComAdminDTO>, res: Response) {
        try {
            // O TypeScript agora sabe que req.body tem: empresa_nome, admin_email, etc.
            const result = await adminService.registerCompany(req.body);
            
            return res.status(201).json(result);

        } catch (error: any) {
            console.error('Erro em createCompany:', error);

            // Tratamento de Erro: Duplicidade (Postgres Error 23505)
            // Geralmente ocorre se o CNPJ ou Email já existem no banco
            if (error.code === '23505') {
                return res.status(409).json({ 
                    error: 'Conflito de Dados',
                    message: 'Já existe uma empresa com este documento ou um usuário com este e-mail.' 
                });
            }

            return res.status(500).json({ 
                error: 'Erro Interno', 
                message: 'Falha ao processar o registro da empresa.' 
            });
        }
    }

    /**
     * POST /users
     * Adiciona um usuário secundário em uma empresa existente
     */
    static async addUser(req: Request<{}, {}, CreateUserDTO>, res: Response) {
        try {
            await adminService.addUser(req.body);
            
            return res.status(201).json({ message: 'Usuário criado com sucesso.' });

        } catch (error: any) {
            console.error('Erro em addUser:', error);

            // Tratamento de Erro: Duplicidade de Email na mesma empresa
            if (error.code === '23505') {
                return res.status(409).json({ 
                    error: 'Conflito de Dados',
                    message: 'Este e-mail já está cadastrado.' 
                });
            }

            return res.status(500).json({ 
                error: 'Erro Interno',
                message: 'Não foi possível adicionar o usuário.' 
            });
        }
    }
}