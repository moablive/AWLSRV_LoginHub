export const AuthQueries = {
    
    /**
     * Busca usuário pelo email para o Login.
     * Traz dados cruciais: 
     * - Hash da senha (para comparar)
     * - Status da empresa (para bloquear login se empresa estiver inativa)
     * - Slug do nível de acesso (ex: 'admin', 'user') para montar o Payload do Token
     */
    FIND_BY_EMAIL: `
        SELECT 
            u.id,
            u.nome,
            u.email,
            u.senha_hash,
            u.status as usuario_status,
            u.empresa_id,
            e.nome as empresa_nome,
            e.status as empresa_status,
            n.slug as role,
            n.permissoes
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        JOIN niveis_acesso n ON u.nivel_acesso_id = n.id
        WHERE u.email = $1
        LIMIT 1;
    `,

    /**
     * Cria um novo usuário.
     * OBS: O 2º parâmetro ($2) espera o SLUG do nível (ex: 'admin'),
     * e a subquery busca o ID correspondente na tabela niveis_acesso automaticamente.
     */
    CREATE_USER: `
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
        RETURNING id, nome, email, created_at;
    `,

    /**
     * Atualiza a data do último login para auditoria.
     */
    UPDATE_LAST_LOGIN: `
        UPDATE usuarios 
        SET ultimo_acesso = CURRENT_TIMESTAMP 
        WHERE id = $1;
    `,

    /**
     * Verifica se o email já existe dentro daquela empresa 
     * (considerando que o UNIQUE no banco é empresa_id + email)
     */
    CHECK_EMAIL_EXISTS: `
        SELECT id FROM usuarios 
        WHERE email = $1 AND empresa_id = $2
        LIMIT 1;
    `
};