// DTO para Criação de Empresa + Admin (Onboarding)
export interface CreateCompanyDTO {
    nome: string;
    documento: string;
    email: string;
    telefone?: string;
    password: string;
    admin_nome: string;
    admin_email: string;
    admin_telefone?: string;
}

// DTO de Resposta (Output)
export interface EmpresaCreatedDTO {
    message: string;
    empresaId: string;
    adminEmail: string;
}

// DTO para Listagem (Tabela do Dashboard)
export interface EmpresaSummaryDTO {
    id: string;
    nome: string;
    documento: string;
    email: string;
    status: string;
    total_usuarios?: number;
}


// Update 
export interface UpdateCompanyDTO {
    nome: string;
    email: string;
    documento: string;
    telefone?: string | undefined;
}