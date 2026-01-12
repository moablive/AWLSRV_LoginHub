# 🗄️ AWLSRV Login Hub

Sistema centralizado de autenticação multi-tenant e gateway de permissões.

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=ts,nodejs,express,postgres,docker,nginx" />
  </a>
</p>

---

## 🏗️ Estrutura do Projeto

O sistema segue uma arquitetura **Service-Repository** para robustez e escalabilidade:

- **`src/controllers`**: Gerencia requisições HTTP (Entrada/Saída).
- **`src/services`**: Regras de negócio, validações e Criptografia (Bcrypt/JWT).
- **`src/db`**: Comandos SQL puros e conexão com Banco.
- **`src/routes`**: Definição de endpoints da API.

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