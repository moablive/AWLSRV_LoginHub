export const UsuarioQueries = {
    // Busca usuário pelo e-mail (usado no Login)
    FIND_BY_EMAIL: `
        SELECT u.*, e.nome as empresa_nome, e.status as empresa_status
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        WHERE u.email = $1
    `,

    // Cria um novo usuário
    CREATE: `
        INSERT INTO usuarios (
            empresa_id, 
            nivel_acesso_id, 
            nome, 
            email, 
            senha_hash, 
            telefone
        ) VALUES ($1, (SELECT id FROM niveis_acesso WHERE slug = $2), $3, $4, $5, $6)
        RETURNING id, nome, email;
    `,

    // Atualiza último acesso
    UPDATE_LAST_LOGIN: `
        UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1
    `
};