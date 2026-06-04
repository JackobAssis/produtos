# Decisões Técnicas

## 1. Estratégia Multi-tenant

### Modelo Escolhido: Logical Isolation (Single Database)

Cada empresa compartilha o mesmo banco de dados.

O isolamento é garantido por:

- toda tabela de negócio possui `company_id`
- todas as queries filtram por `company_id`
- middlewares de autenticação injetam o `company_id` no request

### Identificação da Empresa

| Contexto | Estratégia |
|---|---|
| Catálogo público | slug na URL (`/minhaloja`) |
| Admin (após login) | JWT contém `company_id` |

### Regras

- slug deve ser único globalmente
- slug é gerado automaticamente a partir do nome da empresa
- slug pode ser personalizado pelo usuário no plano Pro
- nenhum dado de uma empresa vaza para outra via API

---

## 2. Autenticação e Autorização

### Stack

- **bcrypt** para hash de senha
- **JWT** (jsonwebtoken) para sessão
- payload do JWT: `{ sub: userId, companyId, role }`
- expiração: 7 dias (access token)
- sem refresh token no MVP (simplificar)

### Fluxo

```
POST /auth/register → cria empresa + usuário owner → retorna JWT
POST /auth/login   → valida email+senha → retorna JWT
```

### Middleware de Autenticação

```
extractToken → verifyJWT → attachUser → checkCompanyAccess
```

- `requireAuth`: exige token válido
- `requireCompany`: garante que o recurso pertence à empresa do token

### Roles

| Role | Descrição |
|---|---|
| `owner` | único admin, pode gerenciar tudo |
| `staff` | futuro (plano Premium) |

---

## 3. Organização do Monorepo

### Gerenciador de Pacotes

**pnpm** com workspaces.

Motivo:

- performance superior a npm/yarn
- suporte nativo a workspaces
- node_modules estruturado (efficiency)

### Estrutura

```
catalogpro/
├── apps/
│   ├── web/          # frontend React
│   └── api/          # backend Express
├── packages/
│   ├── types/        # tipos compartilhados
│   ├── config/       # configs compartilhadas (tsconfig, eslint, etc.)
│   └── ui/           # futuramente: componentes compartilhados
├── docs/
├── package.json      # raiz (workspaces)
├── pnpm-workspace.yaml
├── turbo.json        # futuramente: Turborepo
└── .env.example
```

---

## 4. Convenções de Nomenclatura

### Geral

| Contexto | Convenção | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `create-product.ts` |
| Pastas | kebab-case | `product-service/` |
| Componentes React | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase prefixado com `use` | `useProducts.ts` |
| Tipos/Interfaces | PascalCase prefixado com `I` ou sem prefixo | `Product` ou `IProduct` |
| Enums | PascalCase | `ProductStatus` |
| Variáveis/ funções | camelCase | `getProductById` |
| Tabelas Prisma | snake_case (plural) | `products` |
| Colunas Prisma | snake_case | `company_id` |
| Rotas Express | kebab-case | `/api/v1/products` |

### Preferência

Usar **PascalCase sem prefixo `I`** para interfaces.

Usar **`type` ao invés de `interface`** por padrão (consistência com Zod schemas).

---

## 5. Versionamento da API

### Estratégia

Todas as rotas prefixadas com `/api/v1/`.

Exemplo:

```
GET  /api/v1/products
POST /api/v1/products
GET  /api/v1/companies/:slug
```

### Quando versionar

- versão quebra compatibilidade → nova versão (`/api/v2/`)
- mudanças aditivas não geram nova versão
- manter versão anterior por 90 dias após deprecação

---

## 6. Tratamento de Erros

### Formato Padrão de Resposta

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produto não encontrado",
    "details": null
  }
}
```

### Categorias

| Código HTTP | Quando usar |
|---|---|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Erro de validação (Zod) |
| 401 | Não autenticado |
| 403 | Não autorizado (outra empresa) |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicidade) |
| 422 | Erro de negócio |
| 500 | Erro interno |

### Middleware Global

```
errorHandler(err, req, res, next) → log + response padronizada
```

---

## 7. Logging

### Stack

**Pino** (baixa sobrecarga, JSON nativo).

### Níveis

| Nível | Uso |
|---|---|
| `info` | operações normais (create, login) |
| `warn` | tentativas suspeitas, rate limit |
| `error` | exceções não tratadas, falhas externas |
| `debug` | desenvolvimento (desligado em produção) |

### Formato

```json
{
  "level": "info",
  "time": "2025-01-01T00:00:00Z",
  "reqId": "uuid",
  "method": "POST",
  "url": "/api/v1/products",
  "companyId": "uuid",
  "userId": "uuid",
  "msg": "product created"
}
```

### Transporte

- desenvolvimento: pino-pretty (saída legível)
- produção: JSON puro (coletado pela Railway)

---

## 8. Variáveis de Ambiente

### Obrigatórias

```
# Database
DATABASE_URL=postgresql://user:pass@host:5432/catalogpro

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d

# Storage (R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# App
PORT=3001
NODE_ENV=development|production
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001
```

---

## 9. Resumo das Decisões

| Decisão | Escolha | Justificativa |
|---|---|---|
| Isolamento | Lógico (company_id) | Custo zero, simplicidade MVP |
| DB | PostgreSQL (Supabase) | Confiável, escalável via índice |
| ORM | Prisma | Type-safe, migrations automáticas |
| Auth | JWT + bcrypt | Simples, stateless, sem Redis |
| File upload | Direct to R2 (presigned) | Baixa carga no backend |
| Validação | Zod | Compartilhável front/back |
| Monorepo | pnpm workspaces | Performance, simplicidade |
| API versioning | URI prefix (/v1/) | Claro, fácil de implementar |
| Logging | Pino | Performance, JSON nativo |
| Gerenciamento erro | Middleware centralizado | Consistência, DRY |

---

## 10. Lacunas Identificadas na Documentação Original

| Documento | Lacuna |
|---|---|
| 04-arquitetura.md | Não especifica como frontend se comunica com R2 |
| 05-banco-de-dados.md | Faltam índices, constraints, timestamps, role do usuário |
| 06-backend.md | Não define estrutura de resposta, paginação, filtros |
| 07-frontend.md | Não define estrutura de rotas (admin vs público) |
| 03-requisitos.md | Não especifica limite por plano (20 produtos free) |
| 11-monetizacao.md | Não há modelo de dados para planos/assinaturas |
