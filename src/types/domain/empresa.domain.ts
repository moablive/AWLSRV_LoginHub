export interface Empresa {
    id: string; // UUID
    nome: string;
    documento: string; // CNPJ ou CPF
    dominio?: string; // Slug para subdomínio
    status: 'ativa' | 'inativa' | 'bloqueada';
    created_at: Date;
    updated_at: Date;
}