// src/types/dtos/auth.dto.ts


export interface LoginInputDTO {
    email: string;
    senha_plana: string;
}


export interface UserLoginQueryResult {
    id: string;
    nome: string;
    email: string;
    senha_hash: string;
    user_status: string;
    empresa_id: string;
    empresa_status: string;
    empresa_nome: string;
    role: string; // Ex: 'admin' | 'usuario'
}


export interface JWTPayload {
    sub: string;        // ID do usuário (Padrão JWT é 'sub' de Subject)
    email: string;
    empresaId: string;
    role: string;
    iat?: number;       // Issued At (Gerado autom pelo JWT)
    exp?: number;       // Expiration (Gerado autom pelo JWT)
}

export interface LoginResponseDTO {
    token: string;
    expiresIn: number; // Segundos
    usuario: {
        id: string;
        nome: string;
        email: string;
        role: string;
        // Não retornamos senha, hash, nem datas desnecessárias aqui
    };
    empresa: {
        id: string;
        nome: string;
        status: string;
    };
}

export interface CreateUserDTO {
    empresa_id: string; // O Admin precisa dizer para qual empresa é (se for SuperAdmin) ou pegamos do token
    nome: string;
    email: string;
    password: string; // Senha inicial
    role: string; // 'admin' | 'usuario'
    telefone?: string;
}