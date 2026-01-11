# 🔐 Login Hub - Sistema Centralizado de Autenticação

Sistema de autenticação centralizado para gerenciar múltiplos clientes e seus usuários em projetos Docker.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Queries Úteis](#queries-úteis)

## 🎯 Sobre o Projeto

O Login Hub é um sistema centralizado que permite gerenciar autenticação para múltiplos clientes (empresas), onde cada cliente possui:
- Seus próprios usuários (admins e funcionários que fazem login)
- Seus próprios clientes finais (pessoas cadastradas no sistema)

### Exemplo de Uso:
- **Salão de Beleza**: Admin (dono), funcionários e clientes do salão
- **Loja de Suplementos**: Admin (gerente), vendedores e clientes da loja

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `empresas`
Armazena os clientes do sistema (donos dos projetos Docker)
```sql
- id (UUID)
- nome
- documento (CPF/CNPJ)
- email
- telefone
- status (ativo/inativo)
```

#### 2. `niveis_acesso`
Define os níveis de acesso dos usuários
```sql
- id (UUID)
- nome (admin/usuario)
- descricao
```

#### 3. `usuarios`
Funcionários e admins que fazem LOGIN no sistema
```sql
- id (UUID)
- empresa_id (FK)
- nivel_acesso_id (FK)
- nome
- email
- senha_hash
- telefone
- status (ativo/inativo/bloqueado)
```

#### 4. `clientes`
Clientes finais das empresas (NÃO fazem login)
```sql
- id (UUID)
- empresa_id (FK)
- nome
- documento (CPF/CNPJ)
- email
- telefone
- status (ativo/inativo)
```

## 🚀 Instalação

### Pré-requisitos
- PostgreSQL instalado
- Acesso ao terminal `psql`

### Passo a Passo

#### 1. Conectar ao PostgreSQL
```bash
psql -U postgres
```

#### 2. Criar o Database
```sql
CREATE DATABASE login_hub;
```

#### 3. Conectar ao Database
```sql
\c login_hub
```

#### 4. Criar as Tabelas
```sql
-- Tabela de Empresas
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

-- Tabela de Níveis de Acesso
CREATE TABLE niveis_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
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

-- Tabela de Clientes Finais
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(18),
    email VARCHAR(255),
    telefone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Criar Índices
```sql
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_empresas_documento ON empresas(documento);
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_documento ON clientes(documento);
CREATE INDEX idx_clientes_email ON clientes(email);
```

#### 6. Criar Function e Triggers
```sql
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

CREATE TRIGGER trigger_atualizar_clientes
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();
```

#### 7. Inserir Dados Iniciais
```sql
-- Níveis de acesso padrão
INSERT INTO niveis_acesso (nome, descricao) VALUES
    ('admin', 'Administrador com acesso total'),
    ('usuario', 'Usuário padrão com acesso limitado');
```

## 💻 Como Usar

### Inserir uma Empresa
```sql
INSERT INTO empresas (nome, documento, email, telefone) 
VALUES ('Salão Bella Vida', '12.345.678/0001-90', 'contato@salaobella.com', '(11) 98765-4321')
RETURNING id;
```

### Inserir um Usuário Admin
```sql
-- Substitua UUID_DA_EMPRESA pelo ID retornado acima
INSERT INTO usuarios (empresa_id, nivel_acesso_id, nome, email, senha_hash, telefone)
VALUES (
    'UUID_DA_EMPRESA',
    (SELECT id FROM niveis_acesso WHERE nome = 'admin'),
    'João Silva',
    'joao@salaobella.com',
    '$2b$10$exemplo.hash.senha',
    '(11) 91234-5678'
);
```

### Inserir um Cliente Final
```sql
INSERT INTO clientes (empresa_id, nome, documento, email, telefone)
VALUES (
    'UUID_DA_EMPRESA',
    'Maria Santos',
    '123.456.789-00',
    'maria@email.com',
    '(11) 99876-5432'
);
```

## 🔍 Queries Úteis

### Listar todas as tabelas
```sql
\dt
```

### Ver estrutura de uma tabela
```sql
\d empresas
```

### Listar todas as empresas
```sql
SELECT * FROM empresas;
```

### Listar usuários de uma empresa
```sql
SELECT 
    u.nome, 
    u.email, 
    na.nome as nivel,
    u.status,
    u.ultimo_acesso
FROM usuarios u
INNER JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
WHERE u.empresa_id = 'UUID_DA_EMPRESA'
ORDER BY u.nome;
```

### Listar clientes finais de uma empresa
```sql
SELECT 
    nome, 
    email, 
    telefone, 
    status,
    data_cadastro
FROM clientes
WHERE empresa_id = 'UUID_DA_EMPRESA'
ORDER BY nome;
```

### Contar usuários por empresa
```sql
SELECT 
    e.nome as empresa,
    COUNT(u.id) as total_usuarios,
    COUNT(CASE WHEN na.nome = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN na.nome = 'usuario' THEN 1 END) as usuarios
FROM empresas e
LEFT JOIN usuarios u ON e.id = u.empresa_id
LEFT JOIN niveis_acesso na ON u.nivel_acesso_id = na.id
GROUP BY e.id, e.nome;
```

### Contar clientes finais por empresa
```sql
SELECT 
    e.nome as empresa,
    COUNT(c.id) as total_clientes
FROM empresas e
LEFT JOIN clientes c ON e.id = c.empresa_id
GROUP BY e.id, e.nome;
```

## 🔐 Segurança

### Hash de Senha (Node.js + bcrypt)
```javascript
const bcrypt = require('bcrypt');

// Gerar hash
const senha_hash = await bcrypt.hash('senha123', 10);

// Verificar senha
const senhaValida = await bcrypt.compare('senha123', senha_hash);
```

## 📝 Notas Importantes

1. **UUIDs**: Todas as chaves primárias usam UUID para maior segurança
2. **Email único por empresa**: Um mesmo email pode existir em empresas diferentes
3. **Cascade Delete**: Ao deletar uma empresa, todos os usuários e clientes são deletados automaticamente
4. **Status**: Todos os registros têm controle de status (ativo/inativo)
5. **Timestamps**: Todas as tabelas têm data de criação e atualização automática

## 🛠️ Tecnologias

- PostgreSQL 12+
- UUID Extension (gen_random_uuid)
- PL/pgSQL (Functions e Triggers)

## 📄 Licença

Este projeto é de uso interno.

---

**Desenvolvido para gerenciamento centralizado de autenticação multi-tenant** 🚀
