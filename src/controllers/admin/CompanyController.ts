import { Request, Response } from 'express';
import { CompanyService } from '../../services/admin'; 
import { CreateCompanyDTO } from '../../types/dtos/empresa.dto';
import { DbError } from '../../types/error';

const companyService = new CompanyService();

export class CompanyController {

    static async createCompany(
        req: Request<Record<string, never>, Record<string, never>, CreateCompanyDTO>,
        res: Response
    ) {
        try {
            const result = await companyService.registerCompany(req.body);
            return res.status(201).json(result);

        } catch (err) {
            const error = err as DbError;
            console.error('[CompanyController] createCompany:', error);

            if (error.code === '23505') {
                return res.status(409).json({
                    error: 'Conflito de Dados',
                    message: 'Documento ou E-mail já registrados.'
                });
            }

            return res.status(500).json({ error: 'Erro Interno' });
        }
    }

    static async getAllCompanies(req: Request, res: Response) {
        try {
            const companies = await companyService.getAllCompanies();
            return res.status(200).json(companies);
        } catch (err) {
            console.error('[CompanyController] getAllCompanies:', err);
            return res.status(500).json({ error: 'Erro Interno' });
        }
    }

    static async toggleCompanyStatus(
        req: Request<{ id: string }, Record<string, never>, { status: string }>, 
        res: Response
    ) {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['ativo', 'inativo'].includes(status)) {
            return res.status(400).json({ error: "Status deve ser 'ativo' ou 'inativo'." });
        }

        try {
            const empresa = await companyService.updateCompanyStatus(id, status as 'ativo' | 'inativo');
            return res.status(200).json({
                message: `Status atualizado para ${status}.`,
                empresa
            });
        } catch (err) {
            console.error(`[CompanyController] toggleCompanyStatus:`, err);
            return res.status(500).json({ error: "Erro Interno" });
        }
    }
}