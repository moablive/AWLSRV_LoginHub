export const EmpresaQueries = {
    // Cria empresa e retorna ID
    CREATE: `
        INSERT INTO empresas (nome, documento, dominio)
        VALUES ($1, $2, $3)
        RETURNING id;
    `,

    // Verifica se documento já existe
    CHECK_EXISTS: `
        SELECT id FROM empresas WHERE documento = $1 LIMIT 1;
    `
};