# Relatório do Estado Atual do Projeto — CatalogPro

## 1. Visão Geral

**CatalogPro** é uma plataforma SaaS que permite pequenos comerciantes criarem catálogos digitais profissionais sem necessidade de site próprio. O sistema segue arquitetura multi-tenant com isolamento lógico por `company_id`.

| Item | Status |
|------|--------|
| **Fase do Projeto** | MVP implementado |
| **Commits** | 2 (docs iniciais + MVP completo) |
| **Último commit** | `a0a1376` |
| **Total de arquivos** | 75 |
| **Linhas de código** | ~9.880 |

---

## 2. Stack Tecnológica

### Monorepo
| Ferramenta | Versão | Função |
|---|---|---|
| pnpm | 11.2.2 | Gerenciador de pacotes com workspaces |
| Node.js | >= 20 | Runtime |
| TypeScript | 5.7+ | Tipagem estrita |

### Backend (`apps/api`)
| Dependência | Função |
|---|---|
| Express 4.21 | Framework HTTP |
| Prisma 6 | ORM + migrations |
| PostgreSQL | Banco de dados (via Supabase) |
| JWT + bcryptjs | Autenticação |
| Zod 3.24 | Validação de schemas |
| Pino 9 | Logging estruturado |
| AWS SDK S3 | Presigned URLs para Cloudflare R2 |

### Frontend (`apps/web`)
| Dependência | Função |
|---|---|
| React 19 | UI |
| Vite 6 | Build tool |
| React Router 7 | Roteamento |
| TanStack Query 5 | Gerenciamento de estado servidor |
| Axios | HTTP client |
| TailwindCSS 3 | Estilização |
| clsx + tailwind-merge | Utilitários CSS |
| lucide-react | Ícones |

### Pacotes Compartilhados (`packages/`)
| Pacote | Função |
|---|---|
| `@catalogpro/types` | Tipos TypeScript compartilhados (Company, User, Product, ProductImage, Category, API Response) |
| `@catalogpro/config` | Configurações compartilhadas (tsconfigs) |

---

## 3. Estrutura do Projeto

```
catalogpro/
├── .env.example                    # Variáveis de ambiente documentadas
├── .gitignore
├── .husky/pre-commit               # Hook (atualmente npm test — precisa atualizar)
├── .prettierrc                     # Config de formatação
├── eslint.config.mjs               # ESLint flat config
├── package.json                    # Raiz do monorepo
├── pnpm-workspace.yaml             # Workspace config
│
├── apps/
│   ├── api/                        # Backend Express
│   │   ├── prisma/schema.prisma    # Schema do banco (5 models + 4 enums)
│   │   └── src/
│   │       ├── index.ts            # Entry point
│   │       ├── app.ts              # Config Express + rotas
│   │       ├── env.ts              # Validação de env com Zod
│   │       ├── logger.ts           # Pino logger
│   │       ├── lib/
│   │       │   ├── prisma.ts       # Prisma client singleton
│   │       │   └── r2.ts           # Cliente R2 (presigned URLs)
│   │       ├── middlewares/
│   │       │   ├── auth.ts         # requireAuth + requireCompany
│   │       │   ├── error-handler.ts # AppError + error handler global
│   │       │   └── validate.ts     # Validação Zod middleware
│   │       ├── schemas/            # Schemas Zod (auth, category, company, product)
│   │       ├── services/           # Lógica de negócio (auth, category, company, product)
│   │       ├── controllers/        # Handlers HTTP (auth, category, company, product, upload)
│   │       └── routes/             # Definição de rotas (auth, catalog, category, company, product)
│   │
│   └── web/                        # Frontend React
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── src/
│           ├── main.tsx            # Entry point com providers + rotas
│           ├── globals.css         # Tailwind directives
│           ├── contexts/
│           │   └── auth.tsx        # AuthContext (login, register, logout, user state)
│           ├── services/
│           │   └── api.ts          # Axios instance com interceptors
│           ├── layouts/
│           │   └── admin-layout.tsx # Layout admin com navegação
│           ├── components/shared/
│           │   ├── protected-route.tsx  # Guard de autenticação
│           │   └── toast.tsx           # Sistema de notificações
│           ├── pages/
│           │   ├── login.tsx           # Login
│           │   ├── register.tsx        # Cadastro
│           │   ├── dashboard.tsx       # Dashboard admin
│           │   ├── settings.tsx        # Configurações da loja
│           │   ├── products.tsx        # Lista de produtos (admin)
│           │   ├── product-form.tsx    # Criar/editar produto
│           │   ├── categories.tsx      # Gerenciar categorias
│           │   ├── public-catalog.tsx  # Catálogo público
│           │   └── not-found.tsx       # 404
│           └── lib/
│               └── utils.ts           # cn() utility
│
├── packages/
│   ├── types/src/index.ts         # Tipos compartilhados
│   └── config/                    # tsconfigs base/api/web
│
└── docs/                          # Documentação do projeto
    ├── 01-visao-geral.md
    ├── 02-modelo-negocio.md
    ├── 03-requisitos.md
    ├── 04-arquitetura.md
    ├── 05-banco-de-dados.md
    ├── 06-backend.md
    ├── 07-frontend.md
    ├── 08-ui-ux.md
    ├── 09-deploy.md
    ├── 10-roadmap.md
    ├── 11-monetizacao.md
    ├── 12-decisoes-tecnicas.md
    ├── 13-modelagem-prisma.md
    ├── 14-mvp-tecnico.md
    ├── 15-convencoes-codigo.md
    ├── 16-regras-openCode.md
    ├── 17-definition-of-done.md
    ├── 18-imagens-e-storage.md
    └── 19-relatorio-estado-atual.md   ← este arquivo
```

---

## 4. Modelo de Dados (Prisma)

### Modelos Implementados

| Modelo | Tabela | Descrição |
|---|---|---|
| `Company` | `companies` | Empresa/cliente com slug único, plano e status |
| `User` | `users` | Usuário vinculado a uma empresa (role: OWNER ou STAFF) |
| `Category` | `categories` | Categoria de produto por empresa |
| `Product` | `products` | Produto com preço, slug único por empresa |
| `ProductImage` | `product_images` | Múltiplas imagens por produto com ordem e primary |

### Enums

| Enum | Valores |
|---|---|
| `Plan` | FREE, PRO, PREMIUM |
| `CompanyStatus` | ACTIVE, INACTIVE, TRIAL |
| `UserRole` | OWNER, STAFF |

### Relacionamentos

```
Company (1)─── (N) User
Company (1)─── (N) Product
Company (1)─── (N) Category
Category (1)─── (N) Product
Product  (1)─── (N) ProductImage
```

---

## 5. API — Endpoints Implementados

### Autenticação (`/api/v1/auth`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/register` | Não | Criar conta (empresa + usuário owner) |
| POST | `/login` | Não | Login |
| GET | `/me` | JWT | Dados do usuário logado |

### Empresa (`/api/v1/companies`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/me` | JWT | Dados da empresa |
| PATCH | `/me` | JWT | Atualizar empresa |
| POST | `/upload-url` | JWT | Gerar presigned URL para upload |

### Categorias (`/api/v1/categories`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/` | JWT | Listar categorias |
| POST | `/` | JWT | Criar categoria |
| PATCH | `/:id` | JWT | Atualizar categoria |
| DELETE | `/:id` | JWT | Excluir categoria |

### Produtos (`/api/v1/products`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/` | JWT | Listar (paginado, com filtros) |
| POST | `/` | JWT | Criar produto |
| GET | `/:id` | JWT | Detalhe do produto |
| PATCH | `/:id` | JWT | Atualizar produto |
| DELETE | `/:id` | JWT | Excluir produto |

### Catálogo Público (`/api/v1/catalog`)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/:slug` | Não | Dados públicos da loja |
| GET | `/:slug/products` | Não | Produtos ativos da loja |

### Health
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/health` | Status do servidor |

---

## 6. Frontend — Rotas Implementadas

| Rota | Página | Acesso |
|---|---|---|
| `/login` | Login | Público |
| `/register` | Cadastro | Público |
| `/catalog/:slug` | Catálogo público da loja | Público |
| `/` | Dashboard admin | Protegido |
| `/settings` | Configurações da loja | Protegido |
| `/products` | Lista de produtos | Protegido |
| `/products/new` | Criar produto | Protegido |
| `/products/:id/edit` | Editar produto | Protegido |
| `/categories` | Gerenciar categorias | Protegido |
| `*` | 404 | Público |

---

## 7. Funcionalidades por Sprint

### Sprint 1 — Setup ✅
- [x] Monorepo pnpm com workspaces
- [x] apps/api (Express + Prisma + TypeScript)
- [x] apps/web (Vite + React + TailwindCSS)
- [x] packages/types + packages/config
- [x] ESLint + Prettier configurados
- [x] Prisma schema completo

### Sprint 2 — Autenticação ✅
- [x] POST /api/v1/auth/register (cria empresa + usuário)
- [x] POST /api/v1/auth/login
- [x] GET /api/v1/auth/me
- [x] Middleware requireAuth (JWT)
- [x] Middleware requireCompany (multi-tenant)
- [x] Error handler global com classes customizadas
- [x] Páginas de login e cadastro
- [x] AuthContext com localStorage
- [x] Axios interceptor com token
- [x] Rotas protegidas no frontend

### Sprint 3 — Empresa ✅
- [x] GET /api/v1/companies/me
- [x] PATCH /api/v1/companies/me
- [x] POST /api/v1/companies/upload-url (presigned URL)
- [x] Página de configurações com formulário
- [x] Link do catálogo público com cópia

### Sprint 4 — Produtos e Categorias ✅
- [x] CRUD completo de categorias
- [x] CRUD completo de produtos
- [x] Paginação, busca, filtros por categoria
- [x] Limite de 20 produtos para plano FREE
- [x] Múltiplas imagens por produto (ProductImage)
- [x] Páginas de listagem, criação e edição de produtos
- [x] Página de gerenciamento de categorias

### Sprint 5 — Catálogo Público ✅
- [x] GET /api/v1/catalog/:slug
- [x] GET /api/v1/catalog/:slug/products
- [x] Página pública mobile-first
- [x] Grid de produtos com cards
- [x] Busca por nome
- [x] Filtro por categoria
- [x] Botão WhatsApp integrado

### Sprint 6 — Dashboard + Refinamentos ✅
- [x] Dashboard com métricas reais
- [x] Ações rápidas (adicionar produto, ver catálogo, configurar WhatsApp)
- [x] Sistema de toast para notificações
- [x] Página 404
- [x] Navegação completa no layout admin
- [x] Loading states
- [x] Estados vazios

---

## 8. Storage (Cloudflare R2)

### Fluxo de Upload
```
Usuário → Frontend solicita presigned URL → Backend gera URL → Frontend faz upload direto ao R2 → URL salva no banco
```

### Estrutura de Arquivos
```
companies/{companyId}/products/{productId}/{nome-arquivo}.webp
companies/{companyId}/logo.webp
companies/{companyId}/banner.webp
```

### Dependência para funcionamento completo
- Configurar variáveis de ambiente R2 no backend
- A geração de presigned URL requer `@aws-sdk/client-s3` e `@aws-sdk/s3-request-presigner` (já instalados)

---

## 9. Regras de Negócio Implementadas

| Regra | Local |
|---|---|
| Plano FREE: máximo 20 produtos ativos | `services/product.ts` |
| Plano FREE: máximo 3 imagens por produto | Validação via Zod schema |
| Slug único por empresa (Product, Category) | `@@unique([companyId, slug])` no Prisma |
| Slug único global (Company) | `@unique` no Prisma |
| Email único global (User) | `@unique` no Prisma |
| Apenas uma imagem principal por produto | Regra de negócio no serviço |
| Deleção em cascata (Company → User, Product, Category) | `onDelete: Cascade` |
| Empresa não acessa dados de outra | `requireCompany` middleware + filtro `companyId` em todas queries |

---

## 10. Qualidade do Código

| Verificação | Status |
|---|---|
| `pnpm typecheck` | ✅ Zero erros (strict mode) |
| `pnpm lint` | ✅ Zero erros |
| Uso de `any` | ❌ Proibido — zero ocorrências |
| Zod validation | ✅ Toda entrada validada |
| Tratamento de erros | ✅ Middleware global padronizado |
| Convenções (kebab-case, PascalCase, etc) | ✅ Seguindo `docs/15-convencoes-codigo.md` |

---

## 11. Pendências e Melhorias Futuras

### Configuração necessária para executar
- [ ] Criar arquivo `.env` em `apps/api/` com `DATABASE_URL` (PostgreSQL)
- [ ] Rodar `prisma db push` ou `prisma migrate dev` para criar tabelas
- [ ] Configurar variáveis R2 para upload de imagens funcionar
- [ ] Atualizar hook `.husky/pre-commit` de `npm test` para `pnpm typecheck && pnpm lint`
- [ ] Criar arquivo `.env` em `apps/web/` com `VITE_API_URL`

### Próximas sprints (pós-MVP, conforme roadmap)
- Analytics e visualizações
- Temas personalizados para loja
- Domínio personalizado (plano Pro)
- Carrinho e pedidos online
- Pagamento via PIX
- App mobile
- Múltiplos usuários (plano Premium)

---

## 12. Comandos Úteis

```bash
# Desenvolvimento (raiz)
pnpm dev                    # Inicia API + Web em paralelo

# Backend apenas
pnpm --filter @catalogpro/api dev

# Frontend apenas
pnpm --filter @catalogpro/web dev

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Prisma (dentro de apps/api)
pnpm exec prisma generate   # Gerar client
pnpm exec prisma db push    # Sincronizar schema com DB
pnpm exec prisma migrate dev # Criar migration

# Build
pnpm build
```

---

## 13. Documentação

17 documentos em `docs/` cobrindo:
- Visão geral, modelo de negócio, requisitos
- Arquitetura, banco de dados, backend, frontend
- UI/UX, deploy, roadmap, monetização
- Decisões técnicas, modelagem Prisma, plano técnico MVP
- Convenções de código, regras do agente, definition of done
- Imagens e storage

---
*Relatório gerado em: 04/06/2026*
