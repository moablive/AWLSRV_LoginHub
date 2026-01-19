// src/types/dtos/auth.dto.ts

// Usado para tipar a resposta do login e payloads
export type UserRole = 'admin' | 'usuario';

// 1. O que o Front envia para logar
export interface LoginInputDTO {
    email: string;
    password: string; 
}

// 2. O que o Banco retorna na query de login (com joins)
export interface UserLoginQueryResult {
    id: string;
    nome: string;
    email: string;
    senha_hash: string;
    empresa_id: string;
    
    // Campos vindos dos JOINs (Aliases)
    empresa_nome: string;
    empresa_status: string; 
    role_nome: string;
}

// 3. O que vai dentro do Token JWT
export interface JWTPayload {
    sub: string;        // ID do usuário
    email: string;
    empresa_id: string; 
    role: string;       
    iat?: number;
    exp?: number;
}

// 4. O que a API devolve para o Front após sucesso
export interface LoginResponseDTO {
    token: string;
    expiresIn: number;
    usuario: {
        id: string;
        nome: string;
        email: string;
        role: UserRole;
    };
    empresa: {
        id: string;
        nome: string;
        status: string;
    };
}