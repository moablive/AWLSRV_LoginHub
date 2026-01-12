// 1. INPUTS (Frontend -> API)

/**
 * DTO para o fluxo de Onboarding:
 * Cria a empresa e, automaticamente, cria o primeiro usuário (Dono/Admin).
 */
export interface CreateEmpresaComAdminDTO {
    // --- Dados da Empresa ---
    empresa_nome: string;
    empresa_documento: string; // CNPJ ou CPF (sem formatação preferencialmente)
    empresa_telefone: string;  // Importante para contato
    empresa_email?: string;    // Email genérico da empresa (ex: contato@empresa.com)
    empresa_dominio?: string;  // Slug para subdomínio (ex: 'cliente-a')

    // --- Dados do Admin Inicial ---
    admin_nome: string;
    admin_email: string;
    admin_senha: string;       // Senha plana (será hashada no Service)
    admin_telefone?: string;   // WhatsApp/Celular do dono
}

// 2. OUTPUTS (API -> Frontend)

/**
 * Resposta simples após criar a empresa.
 */
export interface EmpresaCreatedDTO {
    message: string;
    empresaId: string;
    adminEmail: string;
}

/**
 * Usado em listagens (Dropdowns, Tabelas de Admin).
 */
export interface EmpresaSummaryDTO {
    id: string;
    nome: string;
    documento: string;
    status: 'ativa' | 'inativa' | 'bloqueada';
    dominio?: string;
}