// DTO para Criação de Empresa + Admin (Onboarding)
export interface CreateCompanyDTO {
    // --- Dados da Empresa ---
    nome: string;       // Antes: empresa_nome
    documento: string;  // CNPJ ou CPF
    email: string;      // Email corporativo
    telefone: string;
    
    // --- Dados do Admin Inicial ---
    admin_nome: string;
    admin_email: string;
    password: string;   // Antes: admin_senha (padronizado com o front)
    admin_telefone: string;
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