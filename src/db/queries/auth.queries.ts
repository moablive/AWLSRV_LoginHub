//  src/db/queries/auth.queries.ts

export const AuthQueries = {
    
    /**
     * Busca usuário pelo email para o Login.
     * Retorna dados do usuário + status da empresa para validação.
     */
    FIND_BY_EMAIL: `
        SELECT 
            u.id,
            u.nome,
            u.email,
            u.senha_hash,
            u.empresa_id,
            e.nome as empresa_nome,
            e.status as empresa_status, -- Crucial: Se for 'inativo', o login deve ser barrado no código
            n.nome as role              -- Mapeia a coluna 'nome' ('admin'/'usuario') para 'role' no JWT
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        JOIN niveis_acesso n ON u.nivel_acesso_id = n.id
        WHERE u.email = $1
        LIMIT 1;
    `,

    /**
     * Cria um novo usuário (Registro público ou interno).
     * O 2º parâmetro ($2) espera a string 'admin' ou 'usuario'.
     * A subquery converte essa string para o ID correto.
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
            (SELECT id FROM niveis_acesso WHERE nome = $2 LIMIT 1), 
            $3, 
            $4, 
            $5, 
            $6
        )
        RETURNING id, nome, email, data_cadastro as created_at;
    `,

    /**
     * Atualiza a data do último login para auditoria.
     * Deve ser chamado logo após a validação da senha (bcrypt).
     */
    UPDATE_LAST_LOGIN: `
        UPDATE usuarios 
        SET ultimo_acesso = NOW() 
        WHERE id = $1;
    `,

    /**
     * Verifica se o email já existe no sistema TODO.
     * NECESSÁRIO: O email deve ser único globalmente para o login funcionar
     * sem precisar informar o ID da empresa na tela de login.
     */
    CHECK_EMAIL_EXISTS: `
        SELECT id FROM usuarios 
        WHERE email = $1 
        LIMIT 1;
    `
};