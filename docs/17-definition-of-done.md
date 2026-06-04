# Definition of Done (DoD)

Uma tarefa só é considerada **concluída** quando todos os critérios abaixo são atendidos.

---

## Checklist Obrigatório

### 1. Código Implementado

- [ ] Código escrito seguindo as convenções do projeto (`docs/15-convencoes-codigo.md`)
- [ ] Segue o princípio de responsabilidade única
- [ ] Sem duplicação de lógica
- [ ] Sem code smells identificáveis
- [ ] Nomenclatura consistente com o resto do código

### 2. Tipagem Correta

- [ ] TypeScript strict habilitado
- [ ] Sem uso de `any`
- [ ] Tipos exportados quando reutilizáveis
- [ ] Props de componentes React tipadas
- [ ] Parâmetros e retornos de funções tipados
- [ ] Zod schemas definidos para toda entrada de dados

### 3. Lint sem Erros

- [ ] `eslint .` executa sem erros
- [ ] `eslint .` executa sem warnings
- [ ] Regras de import organizadas conforme convenção
- [ ] Sem variáveis não utilizadas

### 4. Build sem Erros

- [ ] `tsc --noEmit` sem erros (backend)
- [ ] `vite build` sem erros (frontend)
- [ ] `pnpm build` na raiz sem erros (monorepo)
- [ ] Prisma generate compila sem erros

### 5. Documentação Atualizada

- [ ] Se a arquitetura mudou, `docs/` foi atualizado
- [ ] Se nova rota foi criada, está refletida na documentação
- [ ] Se nova variável de ambiente foi adicionada, está em `.env.example`
- [ ] Mudanças em schemas Prisma foram documentadas

### 6. Validação Manual Realizada

- [ ] Fluxo feliz testado manualmente
- [ ] Fluxo de erro testado (validação, 404, 401, 403)
- [ ] Impacto multiempresa validado (nenhum dado vazou entre empresas)
- [ ] Testado em mobile (se frontend)

### 7. Sem TODO Pendente

- [ ] Nenhum `// TODO`, `// FIXME`, `// HACK` no código
- [ ] Se um TODO é necessário, virou issue separada
- [ ] Código comentado foi removido

---

## Resumo Visual

```
[ ] Código implementado
[ ] Tipagem correta
[ ] Lint sem erros
[ ] Build sem erros
[ ] Documentação atualizada
[ ] Validação manual OK
[ ] Sem TODO pendente
       ↓
    ✅ DONE
```

---

## Exceções

Exceções precisam ser **justificadas e aprovadas**:

| Critério | Exceção possível | Exemplo |
|---|---|---|
| Validação manual | CI/CD confiável | Pipeline de testes automatizados |
| Documentação | Mudança trivial | Renome de variável local |
| Build sem erros | Breaking change em progresso | Refatoração em andamento (branch) |
