# 🗄️ Login Hub - Database Schema

Sistema de banco de dados para gerenciamento de autenticação multi-tenant.

## 📊 Estrutura do Banco de Dados

### 3 Tabelas Principais

#### 1. **empresas** 
Representa seus clientes (donos dos projetos Docker)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(255) | Nome da empresa |
| documento | VARCHAR(18) | CPF ou CNPJ (único) |
| email | VARCHAR(255) | Email de contato |
| telefone | VARCHAR(20) | Telefone |
| status | VARCHAR(20) | ativo / inativo |
| data_cadastro | TIMESTAMP | Data de criação |
| data_atualizacao | TIMESTAMP | Última atualização |

#### 2. **niveis_acesso**
Define os níveis de permissão dos usuários

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(50) | admin / usuario |
| descricao | TEXT | Descrição do nível |
| data_cadastro | TIMESTAMP | Data de criação |

#### 3. **usuarios**
Usuários das empresas (quem faz login no sistema)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| empresa_id | UUID | FK para empresas |
| nivel_acesso_id | UUID | FK para niveis_acesso |
| nome | VARCHAR(255) | Nome completo |
| email | VARCHAR(255) | Email (único por empresa) |
| senha_hash | VARCHAR(255) | Senha criptografada |
| telefone | VARCHAR(20) | Telefone |
| status | VARCHAR(20) | ativo / inativo / bloqueado |
| ultimo_acesso | TIMESTAMP | Último login |
| data_cadastro | TIMESTAMP | Data de criação |
| data_atualizacao | TIMESTAMP | Última atualização |

### Relacionamentos

```
empresas (1) ──── (N) usuarios
niveis_acesso (1) ──── (N) usuarios
```

## 🚀 Instalação

### Conectar ao PostgreSQL
```bash
psql -U postgres
```

### Criar e Configurar o Database

```sql
-- Criar database
CREATE DATABASE login_hub;

-- Conectar ao database
\c login_hub

-- TABELA 1: EMPRESAS
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA 2: NÍVEIS DE ACESSO
CREATE TABLE niveis_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA 3: USUÁRIOS
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nivel_acesso_id UUID NOT NULL REFERENCES niveis_acesso(id),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
    ultimo_acesso TIMESTAMP,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, email)
);

-- ÍNDICES
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_empresas_documento ON empresas(documento);

-- FUNCTION E TRIGGERS
CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_empresas
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER trigger_atualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

-- DADOS INICIAIS
INSERT INTO niveis_acesso (nome, descricao) VALUES
    ('admin', 'Administrador com acesso total'),
    ('usuario', 'Usuário padrão com acesso limitado');
```

## 💻 Exemplos de Uso

### Cadastrar Empresa

```sql
INSERT INTO empresas (nome, documento, email, telefone) 
VALUES (
    'Padaria Boa Massa',
    '12.345.678/0001-90',
    'contato@boamassa.com',
    '(11) 98765-4321'
)
RETURNING id;
```

### Cadastrar Usuário Admin

```sql
INSERT INTO usuarios (empresa_id, nivel_acesso_id, nome, email, senha_hash, telefone)
VALUES (
    'UUID_DA_EMPRESA',
    (SELECT id FROM niveis_acesso WHERE nome = 'admin'),
    'João Pedro',
    'joao@boamassa.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '(11) 91234-5678'
);
```

### Cadastro Simplificado (Empresa + Admin)

```sql
WITH nova_empresa AS (
    INSERT INTO empresas (nome, documento, email, telefone) 
    VALUES (
        'Academia FitLife',
        '33.444.555/0001-66',
        'contato@fitlife.com',
        '(31) 99999-8888'
    )
    RETURNING id
)
INSERT INTO usuarios (empresa_id, nivel_acesso_id, nome, email, senha_hash, telefone)
SELECT 
    nova_empresa.id,
    (SELECT id FROM niveis_acesso WHERE nome = 'admin'),
    'Ricardo Pereira',
    'ricardo@fitlife.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '(31) 98888-7777'
FROM nova_empresa;
```

## 🔍 Queries Úteis

### Listar todas as empresas

```sql
SELECT id, nome, documento, email, status 
FROM empresas
ORDER BY nome;
```

### Listar usuários de uma empresa

```sql
SELECT 
    u.nome,
    u.email,
    na.nome as nivel_acesso,
    u.status,
    u.ultimo_acesso
FROM usuarios u
INNER JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
WHERE u.empresa_id = 'UUID_DA_EMPRESA'
ORDER BY na.nome DESC, u.nome;
```

### Resumo de empresas

```sql
SELECT 
    e.nome as empresa,
    e.documento,
    COUNT(u.id) as total_usuarios,
    COUNT(CASE WHEN na.nome = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN na.nome = 'usuario' THEN 1 END) as usuarios_comuns
FROM empresas e
LEFT JOIN usuarios u ON e.id = u.empresa_id
LEFT JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
GROUP BY e.id, e.nome, e.documento
ORDER BY e.nome;
```

### Buscar usuário para login

```sql
SELECT 
    u.id,
    u.nome,
    u.email,
    u.senha_hash,
    u.status,
    e.id as empresa_id,
    e.nome as empresa_nome,
    na.nome as nivel_acesso
FROM usuarios u
INNER JOIN empresas e ON u.empresa_id = e.id
INNER JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
WHERE u.email = 'joao@boamassa.com'
AND u.status = 'ativo'
AND e.status = 'ativo';
```

## 📝 Notas

- **UUIDs**: Chaves primárias usam UUID
- **Email único por empresa**: Mesmo email pode existir em empresas diferentes
- **Cascade Delete**: Deletar empresa remove todos os usuários
- **Timestamps**: Criação e atualização automáticas
