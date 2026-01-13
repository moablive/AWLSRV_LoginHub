import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { CreateCompanyDTO } from '../types/dtos/empresa.dto';
import { CreateUserDTO } from '../types/dtos/auth.dto';
import { DbError }  from '../types/error';

const adminService = new AdminService();

export class AdminController {

    // =========================================
    // MÉTODOS DE CRIAÇÃO (POST)
    // =========================================

    /**
     * POST /companies
     * Cria uma nova Empresa + Usuário Admin (Onboarding)
     */
    static async createCompany(
        req: Request<Record<string, never>, Record<string, never>, CreateCompanyDTO>, 
        res: Response
    ) {
        try {
            const result = await adminService.registerCompany(req.body);
            return res.status(201).json(result);

        } catch (err) {
            const error = err as DbError;
            console.error('[AdminController] Erro em createCompany:', error);

            // 23505 = Unique Violation (CNPJ ou Email já existem)
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
     * Adiciona um usuário (Admin ou Comum) em uma empresa existente
     */
    static async addUser(
        req: Request<Record<string, never>, Record<string, never>, CreateUserDTO>, 
        res: Response
    ) {
        try {
            await adminService.addUser(req.body);
            return res.status(201).json({ message: 'Usuário criado com sucesso.' });

        } catch (err) {
            const error = err as DbError;
            console.error('[AdminController] Erro em addUser:', error);

            // 1. Email já cadastrado em outra empresa (Unique Violation)
            if (error.code === '23505') {
                return res.status(409).json({ 
                    error: 'Conflito de Dados',
                    message: 'Este e-mail já está em uso no sistema.' 
                });
            }

            // 2. Empresa ID inválido (Foreign Key Violation) - NOVO
            if (error.code === '23503') {
                return res.status(400).json({ 
                    error: 'Dados Inválidos',
                    message: 'A empresa informada não existe.' 
                });
            }

            // 3. Erro genérico (ex: falha na conexão)
            return res.status(500).json({ 
                error: 'Erro Interno',
                message: 'Não foi possível adicionar o usuário.' 
            });
        }
    }

    // =========================================
    // MÉTODOS DE CONSULTA (GET)
    // =========================================

    /**
     * GET /companies
     * Lista todas as empresas (Dashboard)
     */
    static async getAllCompanies(req: Request, res: Response) {
        try {
            const companies = await adminService.getAllCompanies();
            return res.status(200).json(companies);

        } catch (err) {
            console.error('[AdminController] Erro em getAllCompanies:', err);
            return res.status(500).json({ 
                error: 'Erro Interno', 
                message: 'Não foi possível buscar a lista de empresas.' 
            });
        }
    }

    /**
     * GET /companies/:id/users
     * Lista usuários de uma empresa específica
     */
    static async getUsersByCompany(
        req: Request<{ id: string }>, 
        res: Response
    ) {
        try {
            const { id } = req.params;

            // Validação simples de UUID (opcional, mas recomendada)
            if (!id || id.length < 30) {
                return res.status(400).json({ error: 'ID da empresa inválido.' });
            }

            const users = await adminService.getUsersByCompany(id);
            return res.status(200).json(users);

        } catch (err) {
            console.error(`[AdminController] Erro em getUsersByCompany (ID: ${req.params.id}):`, err);
            return res.status(500).json({ 
                error: 'Erro Interno', 
                message: 'Não foi possível buscar os usuários.' 
            });
        }
    }
}