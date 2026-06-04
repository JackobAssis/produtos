# Regras para o OpenCode (Agente)

## Comportamento Obrigatório

### 1. Nunca modificar documentação sem informar

Toda alteração em arquivos `docs/` deve ser precedida de uma mensagem ao usuário especificando o que será alterado e por quê.

### 2. Nunca criar dependências sem justificar

Nova dependência (npm, Prisma plugin, etc.) exige:

- justificativa por escrito
- alternativa considerada
- impacto no tamanho do bundle/build

### 3. Nunca duplicar lógica

- Código duplicado deve ser extraído para função reutilizável
- Lógica de validação não deve ser duplicada entre frontend e backend (compartilhar via `packages/types`)
- Queries similares devem usar funções de repositório com parâmetros

### 4. Reutilizar código sempre que possível

- Componentes de UI usam shadcn/ui como base
- Schemas Zod são compartilhados entre validação backend e formulários frontend
- Tipos são centralizados em `packages/types`

### 5. Manter simplicidade

- Preferir funções puras
- Evitar classes desnecessárias
- Evitar abstrações prematuras
- Uma função = uma responsabilidade

### 6. Seguir KISS (Keep It Simple, Stupid)

- Se uma implementação parece complexa, provavelmente está errada
- Preferir soluções diretas
- Evitar patterns que adicionam complexidade sem benefício claro no MVP

### 7. Seguir DRY (Don't Repeat Yourself)

- Extrair repetições em funções/módulos
- Compartilhar tipos entre frontend e backend
- Usar middlewares para lógica transversal

### 8. Seguir YAGNI (You Ain't Gonna Need It)

- Não implementar funcionalidades futuras agora
- Não criar abstrações para cenários hipotéticos
- Não adicionar colunas/tabelas que não serão usadas no MVP
- Se surgir necessidade real, refatora-se na hora

### 9. Sempre verificar impacto multiempresa

Antes de qualquer alteração no banco ou API, verificar:

- A entidade tem `companyId`?
- A query filtra por `companyId`?
- Um usuário de outra empresa pode acessar este recurso?
- O slug/identificador público é único por empresa?

### 10. Sempre atualizar documentação quando arquitetura mudar

Se durante a implementação uma decisão arquitetural for alterada:

- Atualizar o documento relevante em `docs/`
- Informar o usuário da mudança e justificativa

---

## Fluxo Obrigatório para Cada Tarefa

```
1. ANALISAR
   ├── Ler documentação relevante
   ├── Identificar impacto em outros módulos
   └── Verificar regras multiempresa

2. PROPOR PLANO
   ├── Esboçar abordagem técnica
   ├── Listar arquivos que serão modificados
   └── Aguardar aprovação (se necessário)

3. IMPLEMENTAR
   ├── Seguir convenções do projeto
   ├── Manter tipagem estrita
   ├── Escrever código limpo
   └── Sem deixar TODOs

4. VALIDAR
   ├── Verificar build (tsc --noEmit)
   ├── Verificar lint (eslint)
   ├── Verificar testes (se existirem)
   └── Validar manualmente o fluxo

5. DOCUMENTAR
   ├── Atualizar docs se arquitetura mudou
   └── Relatar o que foi feito
```

---

## Lembretes Constantes

- `companyId` nunca é opcional
- `slug` é único por empresa
- `email` é único globalmente
- Toda query de negócio filtra por `companyId`
- Preferir Zod a validação manual
- Preferir funções a classes
- Preferir `type` a `interface`
- Evitar `any` a todo custo
