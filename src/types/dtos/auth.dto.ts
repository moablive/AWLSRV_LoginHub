// src/types/dtos/auth.dto.ts

// 1. Definição de Tipos
export type UserRole = 'admin' | 'usuario';

export interface LoginInputDTO {
    email: string;
    password: string; 
}

/**
 * REFLETE EXATAMENTE O RETORNO DO SQL (AuthQueries.FIND_BY_EMAIL_WITH_RELATIONS)
 * Se o SQL usa "AS role_nome", aqui deve ser "role_nome".
 */
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

/**
 * O que vai dentro do Token JWT.
 * IMPORTANTE: Use snake_case em 'empresa_id' para facilitar o uso no banco depois.
 */
export interface JWTPayload {
    sub: string;        // ID do usuário
    email: string;
    empresa_id: string; // <--- CORREÇÃO: O Middleware espera snake_case
    role: string;       // Geralmente string simples para evitar erro de lib
    iat?: number;
    exp?: number;
}

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

export interface CreateUserDTO {
    empresa_id: string; 
    nome: string;
    email: string;
    password: string; 
    role: UserRole;    
    telefone?: string | null; 
}