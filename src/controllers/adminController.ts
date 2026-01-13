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
     * * CORREÇÃO: O terceiro argumento do Request agora é CreateCompanyDTO
     */
    static async createCompany(
        req: Request<Record<string, never>, Record<string, never>, CreateCompanyDTO>, 
        res: Response
    ) {
        try {
            // Agora o req.body está tipado corretamente com { nome, documento, email... }
            const result = await adminService.registerCompany(req.body);
            
            return res.status(201).json(result);

        } catch (err) {
            const error = err as DbError;
            console.error('Erro em createCompany:', error);

            // Erro 23505 = Unique Violation (CNPJ ou Email duplicado)
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
    static async addUser(
        req: Request<Record<string, never>, Record<string, never>, CreateUserDTO>, 
        res: Response
    ) {
        try {
            await adminService.addUser(req.body);
            
            return res.status(201).json({ message: 'Usuário criado com sucesso.' });

        } catch (err) {
            const error = err as DbError;
            console.error('Erro em addUser:', error);

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

    // =========================================
    // MÉTODOS DE CONSULTA (GET)
    // =========================================

    /**
     * GET /companies
     * Lista todas as empresas cadastradas
     */
    static async listCompanies(req: Request, res: Response) {
        try {
            const companies = await adminService.getAllCompanies();
            return res.status(200).json(companies);

        } catch (err) {
            const error = err as DbError;
            console.error('Erro em listCompanies:', error);
            
            return res.status(500).json({ 
                error: 'Erro Interno', 
                message: 'Não foi possível buscar a lista de empresas.' 
            });
        }
    }

    /**
     * GET /companies/:id/users
     * Lista os usuários vinculados a uma empresa específica
     */
    static async listCompanyUsers(
        req: Request<{ id: string }>, // Tipagem explícita do Param 'id'
        res: Response
    ) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: 'O ID da empresa é obrigatório na URL.' });
            }

            const users = await adminService.getUsersByCompany(id);
            
            return res.status(200).json(users);

        } catch (err) {
            console.error(`Erro em listCompanyUsers (ID: ${req.params.id}):`, err);
            
            return res.status(500).json({ 
                error: 'Erro Interno', 
                message: 'Não foi possível buscar os usuários desta empresa.' 
            });
        }
    }
}