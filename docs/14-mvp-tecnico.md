# Planejamento Técnico do MVP

## Sprints

### Sprint 1 — Setup do Monorepo

**Objetivo**: Ambiente de desenvolvimento funcionando.

```
catalogpro/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── postcss.config.js
│   └── api/
│       ├── src/
│       │   ├── index.ts
│       │   ├── app.ts
│       │   ├── env.ts
│       │   └── logger.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── types/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/
│       ├── eslint/
│       ├── tsconfig/
│       └── package.json
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── .env.example
├── .gitignore
└── .prettierrc
```

**Tarefas**:

1. Inicializar pnpm workspace na raiz
2. Criar `apps/web` com Vite + React + TS
3. Criar `apps/api` com Express + TS
4. Criar `packages/types` com tipos compartilhados
5. Criar `packages/config` com ESLint + Prettier + TSConfig
6. Configurar Prisma no `apps/api` com schema inicial
7. Configurar scripts: `dev`, `build`, `lint`, `typecheck`
8. Configurar Git hooks (husky + lint-staged) — opcional
9. Rodar `pnpm install` e validar build

**Entregáveis**:

- Monorepo compilando
- Prisma gerando client
- ESLint + Prettier funcionando
- Dev mode: `pnpm dev` na raiz inicia API + Web

---

### Sprint 2 — Autenticação

**Objetivo**: Usuário cria conta e faz login.

**Backend**:

1. Criar schema Zod para `register` e `login`
2. Criar `POST /api/v1/auth/register`
   - recebe: name, email, password, companyName
   - cria Company + User (owner)
   - gera slug automático
   - retorna JWT
3. Criar `POST /api/v1/auth/login`
   - recebe: email, password
   - valida credenciais
   - retorna JWT
4. Criar `GET /api/v1/auth/me`
   - retorna dados do usuário logado
5. Implementar middlewares:
   - `requireAuth` (valida JWT)
   - `requireCompany` (filtra por company_id)
6. Implementar error handler global
7. Implementar logger (Pino)

**Frontend**:

1. Página de registro (`/register`)
2. Página de login (`/login`)
3. Componente de formulário com validação
4. Contexto de autenticação (AuthContext)
5. Rota protegida (redirect se não logado)
6. Store JWT no localStorage
7. Configurar Axios instance com interceptors

**Entregáveis**:

- Fluxo registro → login → dashboard completo
- JWT armazenado e enviado em todas as requisições
- Rotas protegidas no frontend

---

### Sprint 3 — Empresa (Admin)

**Objetivo**: Gerenciar perfil da empresa.

**Backend**:

1. Criar `GET /api/v1/companies/me`
   - retorna dados da empresa do usuário logado
2. Criar `PATCH /api/v1/companies/me`
   - atualizar: name, whatsapp, logo_url
3. Criar upload de logo (presigned URL para R2)
   - `POST /api/v1/upload` → retorna URL assinada
   - frontend faz upload direto para R2

**Frontend**:

1. Página de configurações da empresa (`/settings`)
2. Formulário com: nome, WhatsApp, logo
3. Upload de logo com preview
4. Botão "Ver meu catálogo" → abre `/minhaloja` em nova aba

**Entregáveis**:

- Empresa configurada
- Logo exibida no catálogo
- WhatsApp configurado

---

### Sprint 4 — Produtos (CRUD)

**Objetivo**: Comerciante cadastra e gerencia produtos.

**Categorias (CRUD básico dentro da mesma sprint)**:

1. `GET    /api/v1/categories`
2. `POST   /api/v1/categories`
3. `PATCH  /api/v1/categories/:id`
4. `DELETE /api/v1/categories/:id`

**Produtos**:

1. `GET    /api/v1/products` (com paginação e filtro por categoria)
2. `POST   /api/v1/products`
3. `GET    /api/v1/products/:id`
4. `PATCH  /api/v1/products/:id`
5. `DELETE /api/v1/products/:id`

**Regras**:

- Paginação: `?page=1&limit=20`
- Filtros: `?categoryId=xxx&active=true&search=termo`
- Ordenação: `?sort=createdAt&order=desc`
- Plano FREE: limite de 20 produtos ativos (validação no backend)
- Imagem: upload via presigned URL (mesmo fluxo da logo)

**Frontend**:

1. Página de listagem de produtos (`/products`)
   - tabela com foto, nome, preço, status
   - busca por nome
   - filtro por categoria
   - paginação
2. Página de criar/editar produto (`/products/new`, `/products/:id/edit`)
   - formulário com: nome, descrição, preço, categoria, imagem, ativo
3. Página de categorias (`/categories`)
   - lista simples com ordenação
4. Modal de exclusão com confirmação

**Entregáveis**:

- CRUD completo de produtos
- Categorias funcionando
- Upload de imagens
- Limite por plano respeitado

---

### Sprint 5 — Catálogo Público

**Objetivo**: Cliente final acessa e visualiza os produtos.

**Backend**:

1. `GET /api/v1/catalog/:slug`
   - retorna dados da empresa (nome, logo, WhatsApp)
2. `GET /api/v1/catalog/:slug/products`
   - retorna produtos ativos com categorias
   - parâmetros: `?categoryId=xxx&search=termo`

**Frontend (página pública)**:

1. Rota: `/catalog/:slug`
2. Layout responsivo (mobile-first)
3. Seções:
   - Hero com logo e nome da loja
   - Categorias como abas/filtros
   - Grid de produtos (cards)
   - Card do produto: imagem, nome, preço, botão "Comprar"
4. Botão "Fale conosco" → link WhatsApp
   - `wa.me/55XXXXXXXXX?text=Olá, vi o catálogo e tenho interesse`
5. Busca por nome do produto

**Experiência**:

- Carregamento rápido (imagens otimizadas)
- Sem necessidade de login
- Compartilhável via link

**Entregáveis**:

- Catálogo público funcional
- Link compartilhável: `catalogpro.com/catalog/minhaloja`
- Botão WhatsApp integrado
- Filtro por categoria + busca

---

### Sprint 6 — Dashboard e Deploy

**Objetivo**: Comerciante vê métricas e sistema no ar.

**Dashboard** (`/`):

1. Cards:
   - Total de produtos
   - Produtos ativos
   - Categorias
2. Ações rápidas:
   - Adicionar produto
   - Ver catálogo
   - Configurar WhatsApp

**Ajustes finos**:

1. Loading states em todas as páginas
2. Estados vazios (empty state)
3. Tratamento de erros no frontend (toasts)
4. Responsividade

**Deploy**:

1. Backend no Railway
   - Conectar repositório
   - Configurar variáveis de ambiente
   - Migrations automáticas no deploy
2. Frontend no Cloudflare Pages
   - Build: `pnpm build`
   - Output: `apps/web/dist`
   - Variáveis de ambiente no dashboard
3. Banco no Supabase
   - Criar projeto
   - Rodar `prisma migrate deploy`
4. Storage no Cloudflare R2
   - Criar bucket
   - Configurar CORS
5. DNS: Cloudflare apontando para os serviços

**Entregáveis**:

- Sistema em produção
- URL pública: `catalogpro.com`
- Catálogo público acessível
- Pipeline de deploy funcionando

---

## Dependências entre Sprints

```
Sprint 1 (Setup)
   ↓
Sprint 2 (Auth) ← depende de Sprint 1
   ↓
Sprint 3 (Empresa) ← depende de Sprint 2
   ↓
Sprint 4 (Produtos) ← depende de Sprint 3
   ↓
Sprint 5 (Catálogo) ← depende de Sprint 4
   ↓
Sprint 6 (Dashboard + Deploy) ← depende de Sprints 2-5
```

## Estimativa

| Sprint | Estimativa | Complexidade |
|---|---|---|
| 1 — Setup | 2 dias | Baixa |
| 2 — Auth | 3 dias | Média |
| 3 — Empresa | 2 dias | Baixa |
| 4 — Produtos | 4 dias | Alta |
| 5 — Catálogo | 3 dias | Média |
| 6 — Deploy | 2 dias | Média |
| **Total** | **16 dias** | |

## Exclusões do MVP

- Domínio personalizado (plano Pro)
- Analytics/visualizações
- Pedidos e carrinho
- Múltiplos usuários
- App mobile
- Temas personalizados
- Banner da loja
