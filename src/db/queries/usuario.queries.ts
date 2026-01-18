// src/db/queries/usuario.queries.ts

export const UsuarioQueries = {
    
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

    LIST_BY_COMPANY: `
        SELECT 
            u.id, 
            u.nome, 
            u.email, 
            u.telefone, 
            u.ultimo_acesso AS ultimo_login, -- CORRIGIDO
            na.nome as role
        FROM usuarios u
        JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
        WHERE u.empresa_id = $1
        ORDER BY u.nome ASC;
    `,

    LIST_GLOBAL: `
        SELECT 
            u.id, 
            u.nome, 
            u.email, 
            u.ultimo_acesso AS ultimo_login, -- CORRIGIDO
            e.nome as empresa_nome,
            na.nome as role
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
        ORDER BY u.data_cadastro DESC;
    `,

    DELETE: `DELETE FROM usuarios WHERE id = $1 RETURNING id`
};