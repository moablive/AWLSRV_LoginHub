import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Segurança: Carrega a chave do ambiente
    const validKey = process.env.MASTER_API_KEY;

    // Se o servidor estiver mal configurado (sem chave no .env), NINGUÉM entra.
    // Isso evita que o sistema fique aberto por acidente.
    if (!validKey) {
        console.error('❌ ERRO CRÍTICO: MASTER_API_KEY não definida no .env');
        return res.status(500).json({ 
            error: 'Erro interno de segurança.',
            message: 'O servidor não está configurado corretamente.'
        });
    }

    // 2. Captura o header (garantindo que seja string, pois pode vir array)
    const headerValue = req.headers['x-master-key'];
    const apiKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    // 3. Validação
    if (!apiKey || apiKey !== validKey) {
        // Log opcional para auditoria (quem tentou invadir?)
        // console.warn(`Tentativa de acesso não autorizado IP: ${req.ip}`);
        
        return res.status(403).json({ 
            error: 'Acesso negado',
            message: 'Chave Mestra inválida ou ausente.' 
        });
    }

    next();
};