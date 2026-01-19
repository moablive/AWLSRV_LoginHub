// src/types/dtos/auth.dto.ts

export type UserRole = 'admin' | 'usuario';

export interface LoginInputDTO {
    email: string;
    password: string; 
}

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

