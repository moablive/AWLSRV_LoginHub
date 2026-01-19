// src/types/dtos/user.dto.ts

export type UserRole = 'admin' | 'usuario';

export interface CreateUserDTO {
    empresa_id: string; 
    nome: string;
    email: string;
    password: string; 
    
    // Opcional pois o Service define 'usuario' como padrão se não vier
    role?: UserRole;    
    
    // Aceita string ou null (para bater com o banco)
    telefone?: string | null; 
}

export interface UpdateUserDTO {
    nome: string;
    email: string;
    
    // Essencial: "| undefined" permite passar explicitamente undefined na Controller
    // sem quebrar o modo estrito (exactOptionalPropertyTypes)
    password?: string | undefined;
    telefone?: string | undefined;
}

export interface UserResponse {
    id: string;
    nome: string;
    email: string;
    telefone?: string | null;
    
    // Na query SQL, fazemos um JOIN que retorna o nome do cargo (ex: 'admin')
    role: string;            
    
    // Campos que podem vir dependendo da query (Global vs Por Empresa)
    empresa_id?: string;
    empresa_nome?: string; 
    
    ultimo_login?: Date | null;
    status?: string;
    created_at?: Date;
}