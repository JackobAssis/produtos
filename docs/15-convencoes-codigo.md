# Convenções de Código

## 1. TypeScript Strict

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false
  }
}
```

- **Proibido** usar `any`
- Use `unknown` quando o tipo for indeterminado
- Use `as` casting apenas em casos extremos e justificados
- Sempre prefira `type` sobre `interface`

---

## 2. Nomenclatura

| Contexto | Estilo | Exemplo |
|---|---|---|
| Arquivos | `kebab-case` | `create-product.ts` |
| Pastas | `kebab-case` | `product-service/` |
| Componentes React | `PascalCase` | `ProductCard.tsx` |
| Hooks | `camelCase` prefixo `use` | `useProducts.ts` |
| Tipos | `PascalCase` sem prefixo `I` | `Product`, `CreateProductInput` |
| Enums | `PascalCase` | `Plan`, `ProductStatus` |
| Zod schemas | `PascalCase` sufixo `Schema` | `CreateProductSchema` |
| Variáveis | `camelCase` | `productName` |
| Funções | `camelCase` verbo + substantivo | `getProductById` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_PRODUCTS_FREE` |
| Rotas Express | `kebab-case` | `/api/v1/products` |
| Tabelas Prisma | `snake_case` plural | `products`, `product_categories` |
| Colunas Prisma | `snake_case` | `company_id`, `password_hash` |
| Arquivos de teste | mesmo nome + `.test.ts` | `create-product.test.ts` |

---

## 3. Estrutura de Arquivos

### Backend (`apps/api/src/`)

```
src/
├── controllers/     # handlers das rotas (req → service → res)
├── services/        # lógica de negócio
├── repositories/    # acesso ao banco (Prisma)
├── middlewares/     # auth, error, validation
├── routes/          # definição de rotas
├── schemas/         # validação Zod
├── utils/           # helpers genéricos
├── types/           # tipos específicos do módulo
├── config/          # env, constants
├── index.ts         # entry point
└── app.ts           # configuração Express
```

### Frontend (`apps/web/src/`)

```
src/
├── pages/           # páginas da aplicação
├── components/      # componentes reutilizáveis
│   ├── ui/          # shadcn/ui components
│   └── shared/      # componentes compartilhados do domínio
├── layouts/         # layouts (admin, public)
├── services/        # chamadas HTTP (axios)
├── hooks/           # hooks customizados
├── contexts/        # React contexts
├── types/           # tipos específicos do frontend
├── lib/             # utils, constants
└── main.tsx         # entry point
```

---

## 4. Organização de Imports

Ordem obrigatória (separar por linha em branco):

1. Node builtins (`fs`, `path`)
2. Pacotes externos (`express`, `react`)
3. Pacotes internos (`@catalogpro/types`)
4. Módulos relativos (`../services/product`)

```typescript
// Externo
import { z } from 'zod'
import { Router } from 'express'

// Interno do pacote
import type { Product } from '@catalogpro/types'

// Relativo
import { createProduct } from '../services/product'
import { requireAuth } from '../middlewares/auth'
```

### Regras

- Sem default exports (exceto páginas React)
- Named exports sempre
- `import type` para tipos (tree-shaking)

---

## 5. Componentes React

```typescript
// ProductCard.tsx
type ProductCardProps = {
  product: Product
  onEdit: (id: string) => void
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  return (
    <div>
      <h3>{product.name}</h3>
    </div>
  )
}
```

### Regras

- Componente = pasta ou arquivo único
- Props sempre tipadas com `type` no próprio arquivo
- Nome do arquivo = nome do componente
- Evitar componentes gigantes (> 200 linhas)
- Extrair lógica para hooks

---

## 6. Services (Backend)

```typescript
// services/product.ts
export async function getProductById(id: string, companyId: string): Promise<Product> {
  const product = await productRepository.findById(id, companyId)
  if (!product) throw new NotFoundError('Product not found')
  return product
}
```

### Regras

- Um arquivo por entidade (`product.ts`, `category.ts`)
- Nome da função: `verbo + Substantivo` em camelCase
- Primeiro parâmetro é sempre o identificador
- `companyId` é sempre passado explicitamente (nunca global)
- Lançar erros de negócio com classes customizadas

---

## 7. Controllers

```typescript
// controllers/product.ts
export async function createProduct(req: Request, res: Response) {
  const { companyId } = req.auth
  const data = CreateProductSchema.parse(req.body)
  const product = await productService.createProduct(data, companyId)
  res.status(201).json({ success: true, data: product })
}
```

### Regras

- Controller não contém lógica de negócio
- Controller chama service e formata resposta
- Validação via Zod no controller
- Tratamento de erros delegado ao middleware global

---

## 8. Rotas

```typescript
// routes/product.ts
const router = Router()

router.get('/', requireAuth, productController.listProducts)
router.post('/', requireAuth, validate(CreateProductSchema), productController.createProduct)
router.get('/:id', requireAuth, productController.getProductById)
router.patch('/:id', requireAuth, validate(UpdateProductSchema), productController.updateProduct)
router.delete('/:id', requireAuth, productController.deleteProduct)

export { router as productRoutes }
```

### Regras

- Um arquivo por entidade
- Middlewares: autenticação → validação → controller
- Verbos REST padronizados

---

## 9. Comentários

### Regras

- **Não** escrever comentários óbvios
- Comentar apenas decisões não óbvias (ex: "por que isso foi feito assim")
- Nunca comentar código sem remover (se não usa, delete)
- JSDoc apenas em APIs públicas ou exports de packages

```typescript
// RUIM
const x = a + b // soma a com b

// BOM (decisão de negócio)
// Plano FREE permite no máximo 20 produtos ativos
if (activeCount >= 20) throw new PlanLimitError()
```

---

## 10. Evitar any

```typescript
// ERRADO
function process(data: any) { }

// CERTO
function process(data: unknown) {
  if (typeof data === 'string') { }
}

// CERTO (com genérico)
function process<T>(data: T): T { return data }
```

Exceções aceitáveis (raras e justificadas):

- `console.log` em desenvolvimento
- Parsing de JSON externo sem type guarantee

---

## 11. Arquivos de Configuração

| Arquivo | Propósito |
|---|---|
| `.env.example` | Variáveis de ambiente documentadas |
| `tsconfig.json` | TypeScript config |
| `.eslintrc.cjs` | ESLint rules |
| `.prettierrc` | Formatação |
| `pnpm-workspace.yaml` | Workspace config |
| `vite.config.ts` | Vite config (web) |
