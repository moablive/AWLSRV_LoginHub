// src/middlewares/adminMiddleware.ts

import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Segurança: Carrega a chave do ambiente
    // IMPORTANTE: Certifique-se que no seu .env do Backend a variável se chama exatamente assim:
    const validKey = process.env.MASTER_API_KEY;

    // Se o servidor estiver mal configurado (sem chave no .env), bloqueia tudo.
    if (!validKey) {
        console.error('❌ ERRO CRÍTICO: MASTER_API_KEY não definida no arquivo .env');
        return res.status(500).json({ 
            error: 'Erro interno de configuração',
            message: 'O sistema de segurança não foi inicializado corretamente.'
        });
    }

    // 2. Captura o header
    // CORREÇÃO: Alterado de 'x-master-key' para 'x-api-key' para bater com o Frontend
    const headerValue = req.headers['x-api-key'];
    
    // Tratamento para garantir string (casos raros onde headers vêm como array)
    const apiKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    // 3. Validação Estrita
    if (!apiKey || apiKey !== validKey) {
        // Log de auditoria (segurança)
        console.warn(`[AdminAuth] Tentativa de acesso negada. IP: ${req.ip} | Key recebida: ${apiKey ? '***' : 'Nenhuma'}`);
        
        return res.status(403).json({ 
            error: 'Acesso Proibido',
            message: 'Credencial mestre inválida ou ausente.' 
        });
    }

    // Passou!
    next();
};