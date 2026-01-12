export interface Usuario {
    id: string; // UUID
    empresa_id: string; // FK
    nivel_acesso_id?: string; // FK (ou string fixa dependendo da sua lógica atual)
    nome: string;
    email: string;
    senha_hash: string; // Nunca retornar isso no DTO!
    telefone?: string;
    status: 'ativo' | 'inativo' | 'bloqueado';
    ultimo_acesso?: Date;
    created_at: Date;
}