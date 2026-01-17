// src/db/queries/auth.queries.ts

export const AuthQueries = {
    
    /**
     * Busca usuário pelo email para o Login.
     * Retorna dados do usuário + status da empresa para validação (Kill Switch).
     * * IMPORTANTE:
     * - Usamos 'INNER JOIN' para garantir que usuários de empresas deletadas não loguem.
     * - Os aliases (AS ...) devem bater EXATAMENTE com a interface UserLoginQueryResult.
     */
    FIND_BY_EMAIL_WITH_RELATIONS: `
        SELECT 
            u.id,
            u.nome,
            u.email,
            u.senha_hash,
            u.empresa_id,
            
            -- Dados da Empresa
            e.nome AS empresa_nome,
            e.status AS empresa_status, -- Crucial: Se for 'inativo', o login é barrado no Service
            
            -- Dados do Nível de Acesso
            n.nome AS role_nome         -- Mapeia para 'role_nome' no DTO
        
        FROM usuarios u
        INNER JOIN empresas e ON u.empresa_id = e.id
        INNER JOIN niveis_acesso n ON u.nivel_acesso_id = n.id
        
        WHERE u.email = $1
        LIMIT 1;
    `,

    /**
     * Cria um novo usuário.
     * O 2º parâmetro ($2) espera a string 'admin' ou 'usuario'.
     * A subquery converte essa string para o UUID correto na tabela niveis_acesso.
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
        RETURNING id, nome, email, data_cadastro;
    `,

    /**
     * Atualiza a data do último login para auditoria.
     * Deve ser chamado de forma assíncrona (sem await) para não travar o login.
     */
    UPDATE_LAST_LOGIN: `
        UPDATE usuarios 
        SET ultimo_login = NOW() 
        WHERE id = $1;
    `,

    /**
     * Verifica se o email já existe globalmente.
     * Usado no cadastro para garantir unicidade (Unique Constraint).
     */
    CHECK_EMAIL_EXISTS: `
        SELECT id FROM usuarios 
        WHERE email = $1 
        LIMIT 1;
    `
};