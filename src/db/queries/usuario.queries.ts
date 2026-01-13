// src/db/queries/usuario.queries.ts

export const UsuarioQueries = {
    
    // 1. Criação de Usuário (Onboarding ou Adição Manual)
    // Busca o ID do nível de acesso baseado no nome ('admin' ou 'usuario')
    // OBS: Se no seu banco a coluna for 'slug', altere 'nome = $2' para 'slug = $2'
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
            (SELECT id FROM niveis_acesso WHERE nome = $2 LIMIT 1), 
            $3, 
            $4, 
            $5, 
            $6
        )
        RETURNING id, nome, email;
    `,

    // 2. Busca para Login (Autenticação)
    // Usado pela API Externa para gerar o Token Bearer
    FIND_BY_EMAIL: `
        SELECT 
            u.id,
            u.nome,
            u.email,
            u.senha_hash,
            u.empresa_id,
            e.nome as empresa_nome, 
            e.status as empresa_status,
            na.nome as role  -- Retorna 'admin' ou 'usuario'
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        LEFT JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
        WHERE u.email = $1
    `,

    // 3. Listagem de Usuários por Empresa (Painel Super Admin)
    // Ajustado para usar 'data_cadastro' conforme seu schema
    LIST_BY_COMPANY: `
        SELECT 
            u.id, 
            u.nome, 
            u.email, 
            u.telefone, 
            u.data_cadastro as created_at, -- Alias para o front receber padronizado
            na.nome as role
        FROM usuarios u
        LEFT JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
        WHERE u.empresa_id = $1
        ORDER BY u.nome ASC;
    `,

    // 4. Atualização de Log (Opcional)
    // Atualiza apenas quando o usuário de fato trocar o token
    UPDATE_LAST_LOGIN: `
        UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1;
    `
};