# 🚀 GUIA INTERATIVO - Configurar Railway e Resolver CORS

> Documentação completa para resolver o erro CORS em produção

## 📋 Checklist Rápido (5-15 minutos)

### ✅ Pré-requisitos
- [ ] Acesso ao [Railway Dashboard](https://railway.app/dashboard)
- [ ] Acesso ao PostgreSQL no Railway (deve estar rodando)
- [ ] Terminal com `curl` disponível
- [ ] Git com credenciais configuradas

---

## 🎯 PASSO 1: Gerar JWT_SECRET Seguro

### Opção A: Via Script (Recomendado)
```bash
./scripts/setup-railway.sh
# Output: JWT_SECRET=xxxxx (copiar para clipboard)
```

### Opção B: Manual com OpenSSL
```bash
openssl rand -base64 32
# Exemplo output: K7dX+9mL0pQ5rT2wY8aB3cF6gH1jK4lM5nO6pR7sT8uV9wX0yZ=
```

⏱️ **Tempo: 1 minuto**

---

## 🎯 PASSO 2: Obter DATABASE_URL do PostgreSQL

### No Railway Dashboard:
1. Ir para: **Dashboard** → **Seu Projeto**
2. Encontrar serviço **PostgreSQL**
3. Clicar em **Connect**
4. Copiar: **Postgres Connection String** (a linha inteira)

Deve parecer com:
```
postgresql://postgres:abc123def456@containers-us-west.railway.app:5432/railway
```

✅ **Testar localmente** (conexão):
```bash
psql "postgresql://postgres:xxx@containers-us-west.railway.app:5432/railway" -c "\dt"
# Deve listar as tabelas da aplicação
```

⏱️ **Tempo: 2 minutos**

---

## 🎯 PASSO 3: Configurar Variáveis no Railway

### No Railway Dashboard:

1. **Acesse:** Dashboard → Seu Projeto → api-production
2. **Clique em:** Variables (abaixo de Connect)
3. **Adicione/Atualize as variáveis:**

| Variável | Valor | Exemplo |
|----------|-------|---------|
| `DATABASE_URL` | [Copiar do Passo 2] | `postgresql://postgres:xxx@containers-us...` |
| `JWT_SECRET` | [Gerar no Passo 1] | `K7dX+9mL0pQ5rT2wY8aB3cF6gH1jK4lM5nO6pR7sT8uV9wX0yZ=` |
| `NODE_ENV` | `production` | `production` |
| `CORS_ORIGIN` | (deixar vazio, usa default) | - |

### ✅ Verificação:
- [ ] DATABASE_URL está lá
- [ ] JWT_SECRET está lá (mínimo 16 chars)
- [ ] NODE_ENV = production

⏱️ **Tempo: 5 minutos**

---

## 🎯 PASSO 4: Redeploy na Railway

### Opção A: Via Dashboard (Recomendado)
1. Vá para: **Deployments**
2. Clique em: **Redeploy Latest**
3. Aguarde até ficar verde (2-5 minutos)

### Opção B: Via Push Git
```bash
git push origin main
# Railway fará redeploy automaticamente
```

**Monitorar Logs:**
```
Railway → api-production → Logs
```

Procure por:
- ✅ `Server running on port 3000` = Sucesso!
- ❌ `Error: ENV validation failed` = Variáveis incorretas
- ❌ `Connection refused` = DATABASE_URL inválido

⏱️ **Tempo: 5 minutos (2-5 min de espera)**

---

## 🎯 PASSO 5: Validar Configuração

### Teste Automático:
```bash
./scripts/validate-railway-setup.sh
```

Você verá:
```
1. Testando endpoint /health
✅ API respondendo (HTTP 200)

2. Verificando headers CORS
✅ CORS Header presente
Access-Control-Allow-Origin: https://produtos-9di.pages.dev

3. Testando POST /login (sem credenciais)
✅ Preflight request aceito

4. Checklist de Configuração Railway
☐ DATABASE_URL
☐ JWT_SECRET
☐ NODE_ENV = production
```

### Teste Manual:
```bash
# Testar conexão básica
curl -I https://api-production-0f20.up.railway.app/api/v1/health

# Esperado: HTTP 200 OK
# ✅ Sucesso!
```

⏱️ **Tempo: 2 minutos**

---

## ✨ PASSO 6: Testar no Navegador

1. Abrir: https://produtos-9di.pages.dev
2. Tentar **Login** ou **Registrar**
3. Abrir **DevTools** (F12) → Console
4. Procurar por:
   - ✅ Sem mensagens CORS
   - ✅ Login retorna 200
   - ✅ Token salvo em cookies/localStorage

---

## 🆘 Se Algo Não Funcionar

### Cenário 1: API retorna HTTP 404

**Diagnóstico:**
```bash
# Ver logs do Railway
Railway → api-production → Logs
```

Procure por:
- `Error: ENV validation failed` → Variáveis incompletas
- `connect ECONNREFUSED` → DATABASE_URL inválido
- `listening on port 3000` → Tudo OK

**Solução:**
1. Verificar DATABASE_URL tem "@" e ":" corretos
2. Verificar JWT_SECRET tem mínimo 16 caracteres
3. Clicar "Redeploy Latest" novamente

### Cenário 2: CORS erro ainda aparece

```
Access to XMLHttpRequest blocked by CORS policy
```

**Diagnóstico:**
- API respondeu 404 (veja Cenário 1)
- Ou CORS não foi aplicado

**Solução:**
```bash
curl -I \
  -H "Origin: https://produtos-9di.pages.dev" \
  https://api-production-0f20.up.railway.app/api/v1/health
```

Procure na resposta por:
```
Access-Control-Allow-Origin: https://produtos-9di.pages.dev
```

Se não aparecer → Railway não rodou o código novo
→ Ir para: TROUBLESHOOTING.md → Seção "CORS Headers Missing"

### Cenário 3: Database retorna erro

```
Error: connection refused
Error: database "railway" does not exist
```

**Diagnóstico:**
- DATABASE_URL está apontando para servidor errado
- PostgreSQL parou

**Solução:**
```bash
# Verificar string de conexão
echo $DATABASE_URL

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"
# Deve retornar: 1
```

---

## 📚 Documentação Completa

Se ainda houver problemas, consulte:

| Documento | Para Quem | Tempo |
|-----------|-----------|-------|
| **QUICK_START.md** | Resolver rápido | 5 min |
| **DEPLOYMENT.md** | Entender completo | 15 min |
| **TROUBLESHOOTING.md** | Debug avançado | 20-30 min |
| **scripts/validate-railway-setup.sh** | Teste automático | 2 min |

---

## ✅ Resultado Esperado

Após completar todos os 6 passos:

```
✅ API respondendo em /health (HTTP 200)
✅ CORS headers presentes
✅ Login funciona
✅ Registrar funciona
✅ Cookies/JWT salvos
✅ Perfil carrega
✅ Erro CORS desapareceu
🎉 Sistema 100% funcional
```

---

## 🎯 Timeline

| Passo | O quê | Tempo |
|-------|-------|-------|
| 1 | Gerar JWT_SECRET | 1 min |
| 2 | Copiar DATABASE_URL | 2 min |
| 3 | Configurar Railway | 5 min |
| 4 | Redeploy | 5 min (espera) |
| 5 | Validar | 2 min |
| 6 | Testar browser | 3 min |
| **Total** | | **~15-20 min** |

---

## 🔗 Links Úteis

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Docs - Variables](https://docs.railway.app/deploy/variables)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect-string.html)

---

## ❓ Dúvidas Frequentes

**P: O JWT_SECRET precisa ser exatamente 32 chars?**
R: Não, mínimo é 16. Recomendado 32+ para segurança.

**P: Posso usar qualquer DATABASE_URL?**
R: Sim, desde que aponte para um PostgreSQL e o app tenha permissões.

**P: Quanto tempo leva o redeploy?**
R: 2-5 minutos normalmente. Se for mais, verificar Railway Logs.

**P: E se eu cometer erro na configuração?**
R: Railway não aceita, você refaz. Sem riscos.

---

**Última atualização:** 2024-06-07
**Status:** ✅ Pronto para usar

