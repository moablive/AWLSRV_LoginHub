// src/db/queries/empresa.queries.ts

export const EmpresaQueries = {
    
    // 1. Criação de Empresa
    // Insere os dados e define status padrão como 'ativo'
    CREATE: `
        INSERT INTO empresas (nome, documento, email, telefone, status)
        VALUES ($1, $2, $3, $4, 'ativo')
        RETURNING id;
    `,

    // 2. Validação de Duplicidade (Antes de criar)
    CHECK_EXISTS: `
        SELECT id FROM empresas 
        WHERE documento = $1 OR email = $2 
        LIMIT 1;
    `,

    // 3. Listagem Geral (Para o Painel Super Admin)
    // Retorna dados da empresa + contagem total de usuários nela
    LIST_ALL: `
        SELECT 
            e.id, 
            e.nome, 
            e.documento, 
            e.email, 
            e.telefone,
            e.status,
            e.created_at,
            (SELECT COUNT(*)::int FROM usuarios u WHERE u.empresa_id = e.id) as total_usuarios
        FROM empresas e
        ORDER BY e.created_at DESC;
    `
};