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