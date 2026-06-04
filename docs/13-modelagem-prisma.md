# Modelagem Prisma

## Schema Completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Empresa ───────────────────────────────────────────────
model Company {
  id        String   @id @default(uuid()) @db.Uuid
  name      String   @db.VarChar(255)
  slug      String   @unique @db.VarChar(100)
  document  String?  @unique @db.VarChar(20)   // CNPJ/CPF (futuro)
  phone     String?  @db.VarChar(20)
  whatsapp  String?  @db.VarChar(20)
  logoUrl   String?  @map("logo_url") @db.Text
  bannerUrl String?  @map("banner_url") @db.Text
  plan      Plan     @default(FREE)
  status    CompanyStatus @default(ACTIVE)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users     User[]
  products  Product[]
  categories Category[]

  @@map("companies")
}

// ─── Plano da Empresa ──────────────────────────────────────
enum Plan {
  FREE
  PRO
  PREMIUM
}

// ─── Status da Empresa ─────────────────────────────────────
enum CompanyStatus {
  ACTIVE
  INACTIVE
  TRIAL
}

// ─── Usuário ───────────────────────────────────────────────
model User {
  id           String   @id @default(uuid()) @db.Uuid
  companyId    String   @map("company_id") @db.Uuid
  name         String   @db.VarChar(255)
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.Text
  role         UserRole @default(OWNER)
  active       Boolean  @default(true)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([email])
  @@index([companyId])
  @@map("users")
}

// ─── Role do Usuário ───────────────────────────────────────
enum UserRole {
  OWNER
  STAFF
}

// ─── Categoria ─────────────────────────────────────────────
model Category {
  id        String   @id @default(uuid()) @db.Uuid
  companyId String   @map("company_id") @db.Uuid
  name      String   @db.VarChar(255)
  slug      String   @db.VarChar(255)
  order     Int      @default(0)
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  company  Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  products Product[]

  @@unique([companyId, slug])
  @@index([companyId])
  @@map("categories")
}

// ─── Produto ───────────────────────────────────────────────
model Product {
  id          String        @id @default(uuid()) @db.Uuid
  companyId   String        @map("company_id") @db.Uuid
  categoryId  String?       @map("category_id") @db.Uuid
  name        String        @db.VarChar(255)
  slug        String        @db.VarChar(255)
  description String?       @db.Text
  price       Decimal       @db.Decimal(10, 2)
  comparePrice Decimal?     @map("compare_price") @db.Decimal(10, 2)
  imageUrl    String?       @map("image_url") @db.Text
  active      Boolean       @default(true)
  featured    Boolean       @default(false)
  stock       Int           @default(0)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  company  Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  images   ProductImage[]

  @@unique([companyId, slug])
  @@index([companyId])
  @@index([companyId, active])
  @@index([categoryId])
  @@map("products")
}

// ─── Imagens do Produto ────────────────────────────────────
model ProductImage {
  id        String   @id @default(uuid()) @db.Uuid
  productId String   @map("product_id") @db.Uuid
  imageUrl  String   @map("image_url") @db.Text
  isPrimary Boolean  @default(false) @map("is_primary")
  position  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([productId, isPrimary])
  @@map("product_images")
}
```

---

## Relacionamentos

```
Company (1)─── (N) User
Company (1)─── (N) Product
Company (1)─── (N) Category
Category (1)─── (N) Product
Product  (1)─── (N) ProductImage
```

- `User` depende de `Company` (onDelete: Cascade)
- `Product` depende de `Company` (onDelete: Cascade)
- `Product` pode ter `Category` opcional (onDelete: SetNull)
- `Category` depende de `Company` (onDelete: Cascade)
- `ProductImage` depende de `Product` (onDelete: Cascade)

---

## Índices Estratégicos

```prisma
@@index([email])                  // login rápido
@@index([companyId])             // filtrar recursos da empresa
@@index([companyId, slug])       // buscar produto/categoria na empresa
@@index([companyId, active])     // listar apenas ativos no catálogo
@@index([productId])             // buscar imagens de um produto
@@index([productId, isPrimary])  // buscar imagem principal
@@unique([companyId, slug])      // slug único por empresa
@@unique([email])                // email único global
```

---

## Constraints e Regras

| Regra | Implementação |
|---|---|---|
| slug único global | `@unique` em `Company.slug` |
| slug único por empresa | `@@unique([companyId, slug])` em Product e Category |
| email único global | `@unique` em `User.email` |
| todo registro de negócio tem empresa | `companyId` obrigatório + `@relation` |
| deleção em cascata | `onDelete: Cascade` em todas as relations de Company |
| apenas uma imagem principal por produto | regra de negócio validada no serviço |
| preço não negativo | validação em camada de serviço (Zod) |
| empresa não pode ser deletada com dados | Cascade resolve, mas UI pedirá confirmação |

---

## Planos e Expansão Futura

```prisma
// Futuro: assinaturas
model Subscription {
  id        String   @id @default(uuid()) @db.Uuid
  companyId String   @unique @map("company_id") @db.Uuid
  plan      Plan
  status    SubscriptionStatus
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  @@map("subscriptions")
}

// Futuro: limite por plano
model PlanLimit {
  id          String @id @default(uuid()) @db.Uuid
  plan        Plan
  maxProducts Int    @map("max_products")
  maxUsers    Int    @map("max_users")
  customDomain Boolean @default(false) @map("custom_domain")
  analytics   Boolean @default(false)

  @@unique([plan])
  @@map("plan_limits")
}
```

### Limites do MVP (regra de negócio, não DB):

| Plano | Produtos | Usuários | Domínio próprio |
|---|---|---|---|
| FREE | 20 | 1 | Não |
| PRO | Ilimitado | 3 | Sim |
| PREMIUM | Ilimitado | Ilimitado | Sim |

---

## Observações sobre o Schema

1. **UUIDs**: todas as PKs são UUID v4 (segurança, sharding futuro)
2. **Pluralização**: tabelas em snake_case plural
3. **Map**: `@map` usado para colunas snake_case no DB, campos camelCase no Prisma
4. **Select**: campos booleanos com `@default` explícito
5. **Decimal**: `price` como Decimal(10,2) — precisão financeira
6. **onDelete: Cascade**: removal de empresa limpa todos os dados associados
7. **onDelete: SetNull**: remoção de categoria não remove produtos
8. **ProductImage**: tabela separada para suportar múltiplas imagens por produto com controle de ordem e imagem principal
9. **isPrimary**: apenas uma imagem pode ser `isPrimary = true` por produto (regra de negócio, não constraint)
