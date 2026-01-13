// src/types/dtos/auth.dto.ts

// 1. Definição de Tipos para Segurança (Evita erros de digitação como 'user' ou 'adm')
export type UserRole = 'admin' | 'usuario';

export interface LoginInputDTO {
    email: string;
    password: string; // CORREÇÃO: Alinhado com o controller (era senha_plana)
}

/**
 * Interface que representa exatamente o que o banco retorna 
 * na query AuthQueries.FIND_BY_EMAIL
 */
export interface UserLoginQueryResult {
    id: string;
    nome: string;
    email: string;
    senha_hash: string;
    empresa_id: string;
    empresa_nome: string;
    empresa_status: string;
    role: string; // Do banco vem string, depois validamos se é UserRole
    // OBS: Removido 'user_status' pois essa coluna não existe no schema atual
}

export interface JWTPayload {
    sub: string;        // ID do usuário (Padrão JWT)
    email: string;
    empresaId: string;
    role: UserRole;     // Garante que o token tenha apenas roles válidas
    iat?: number;       // Issued At (Data criação)
    exp?: number;       // Expiration (Data expiração)
}

export interface LoginResponseDTO {
    token: string;
    expiresIn: number; // Tempo em segundos
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
    role: UserRole;     // 'admin' | 'usuario'
    telefone?: string | null; // Aceita nulo para alinhar com banco SQL
}