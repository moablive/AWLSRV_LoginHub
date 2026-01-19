export type UserRole = 'admin' | 'usuario';

export interface CreateUserDTO {
    empresa_id: string; 
    nome: string;
    email: string;
    password: string; 
    role: UserRole;    
    telefone?: string | null; 
}

export interface UpdateUserDTO {
    nome: string;
    email: string;
    password?: string | undefined;
    telefone?: string | undefined;
}

export interface UserResponse {
    id: string;
    empresa_id: string;
    nivel_acesso_id?: string;
    role?: string;            
    nome: string;
    email: string;
    telefone?: string | null;
    status?: string;
    created_at?: Date;
}

