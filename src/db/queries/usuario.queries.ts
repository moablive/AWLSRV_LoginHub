// src/db/queries/usuario.queries.ts

export const UsuarioQueries = {
    
    // 1. Criação de Usuário (Onboarding ou Adição Manual)
    // Busca o ID do nível de acesso baseado no slug ('admin' ou 'usuario')
    CREATE: `
        INSERT INTO usuarios (
            empresa_id, 
            nivel_acesso_id, 
            nome, 
            email, 
            senha_hash, 
            telefone
        ) VALUES (
            $1, 
            (SELECT id FROM niveis_acesso WHERE slug = $2 LIMIT 1), 
            $3, 
            $4, 
            $5, 
            $6
        )
        RETURNING id, nome, email;
    `,

    // 2. Busca para Login (Autenticação)
    // Traz dados do usuário + dados da empresa para validar status
    FIND_BY_EMAIL: `
        SELECT 
            u.*, 
            e.nome as empresa_nome, 
            e.status as empresa_status,
            na.slug as role  -- Retorna 'admin' ou 'usuario'
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        LEFT JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
        WHERE u.email = $1
    `,

    // 3. Listagem de Usuários por Empresa (Painel Super Admin)
    LIST_BY_COMPANY: `
        SELECT 
            u.id, 
            u.nome, 
            u.email, 
            u.telefone, 
            u.created_at,
            na.slug as role
        FROM usuarios u
        LEFT JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
        WHERE u.empresa_id = $1
        ORDER BY u.nome ASC;
    `,

    // 4. Atualização de Log (Opcional)
    UPDATE_LAST_LOGIN: `
        UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1;
    `
};