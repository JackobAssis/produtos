# 🔧 Troubleshooting - Guia Detalhado

## 🔴 Erro: HTTP 404 em Todas as Rotas

### Sintomas
```
curl https://produtos-production.up.railway.app/api/v1/health
# Retorna: HTTP 404 Not Found
```

### Diagnóstico

**1. Verificar Logs do Railway**

```bash
# Railway Dashboard → api-production → Logs
# Procure por:
```

✅ **Log de Sucesso:**
```
[2026-06-07T16:00:00.123Z] INFO (1234): server started
    port: "3001"
```

❌ **Log de Erro - DATABASE_URL:**
```
Error: PARSING ERROR: invalid connection URL
    at Parser.parseDsn (...)
```
**Solução**: Ver seção "DATABASE_URL inválida"

❌ **Log de Erro - JWT_SECRET:**
```
ZodError: [
  {
    "code": "too_small",
    "minimum": 16,
    "type": "string",
    "path": ["JWT_SECRET"],
    "message": "String must contain at least 16 character(s)"
  }
]
```
**Solução**: Ver seção "JWT_SECRET inválido"

❌ **Log de Erro - Missing Variable:**
```
Error: DATABASE_URL is required
```
**Solução**: Ver seção "Variáveis de ambiente faltando"

### Soluções Rápidas

**2. Confirmar Variáveis no Railway**

```bash
# Railway Dashboard → api-production → Settings → Variables
# Verificar que existem:
✅ DATABASE_URL (não vazia)
✅ JWT_SECRET (não vazia)

# Se faltarem, adicionar:
DATABASE_URL = postgresql://user:pass@host:port/db
JWT_SECRET = [gerar com openssl rand -base64 32]
```

**3. Redeploy**

```
Railway Dashboard → Deployments → Redeploy
Aguardar conclusão (ver logs verdes)
```

**4. Testar Novamente**

```bash
curl -I https://produtos-production.up.railway.app/api/v1/health
# Esperado: HTTP 200
```

---

## 🟡 Erro: DATABASE_URL Inválida

### Sintomas
```
PARSING ERROR: invalid connection URL
```

### Verificação

**1. Testar Localmente**

```bash
# Copiar DATABASE_URL do Railway
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Testar conexão
psql "$DATABASE_URL" -c "SELECT 1"

# Se funcionar: psql (1 row)
# Se não funcionar: error connecting
```

**2. Formato Correto**

```
postgresql://[user]:[password]@[host]:[port]/[database]

Exemplo real:
postgresql://catalogpro:my-password@prod-db.railway.internal:5432/catalogpro
```

**3. Obter DATABASE_URL Correto do Railway**

```
Railway Dashboard → PostgreSQL service → Conectar
Copie o valor em "Connection String"
Cole no Railway → api-production → Settings → Variables → DATABASE_URL
```

---

## 🟡 Erro: JWT_SECRET Inválido

### Sintomas
```
ZodError: JWT_SECRET must be at least 16 characters
```

### Solução

**1. Gerar Novo JWT_SECRET**

```bash
# Linux/Mac
openssl rand -base64 32
# Output: 7kN9mB2pQxL8vR4wZ6cD1eF5gH3jI9nO0rS2tU4vW6xY8zZ

# Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**2. Copiar para Railway**

```
Railway Dashboard → api-production → Settings → Variables
JWT_SECRET = [colar valor gerado]
```

**3. Redeploy**

```
Railway → Deployments → Redeploy
Aguardar logs verdes
```

---

## 🔍 Erro: CORS "Access-Control-Allow-Origin"

### Sintomas
```
Access to XMLHttpRequest at 'https://api.../auth/login' blocked by CORS policy
```

### Verificação

**1. Testar Preflight**

```bash
curl -X OPTIONS \
  -H "Origin: https://produtos-9di.pages.dev" \
  -H "Access-Control-Request-Method: POST" \
  https://produtos-production.up.railway.app/api/v1/auth/login \
  -v 2>&1 | grep -i access-control

# Esperado:
# access-control-allow-origin: https://produtos-9di.pages.dev
# access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
# access-control-allow-headers: Content-Type, Authorization, X-Requested-With
```

**2. Se Não Retorna Headers CORS**

```bash
# Verificar se API está respondendo
curl -I https://produtos-production.up.railway.app/api/v1/health

# Se 404: API não está rodando
# Se 200: OK, mas CORS pode estar mal configurado
```

**3. Verificar CORS_ORIGIN no Railway**

```
Railway Dashboard → api-production → Settings → Variables
CORS_ORIGIN = https://catalogpro.pages.dev,https://produtos-9di.pages.dev,http://localhost:5173
```

**4. Verificar Código CORS**

```
# apps/api/src/app.ts
# Deve ter:
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)  // ← Permite origem
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}))
```

---

## 🧪 Teste de Conexão Passo-a-Passo

### 1. Health Check Local

```bash
# Terminal 1
cd /home/jackob/ArquivosDev/produtos
pnpm -F @catalogpro/api start

# Terminal 2 (aguardar "server started")
sleep 2
curl http://localhost:3001/api/v1/health

# Esperado: {"success":true,"data":{"status":"ok"}}
```

### 2. Health Check Railway

```bash
curl -I https://produtos-production.up.railway.app/api/v1/health

# Esperado: HTTP 200
# Se 404: Ver "Erro: HTTP 404"
```

### 3. Test Auth Endpoint Localmente

```bash
# Terminal com API rodando

# Test Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Esperado: {"success":true,"data":{...user...}}
```

### 4. Test CORS Preflight Local

```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3001/api/v1/auth/login \
  -v 2>&1 | grep -i access-control

# Esperado:
# access-control-allow-origin: http://localhost:5173
```

---

## 🔐 Segurança: Secrets Expostos no Git

### Verificação

```bash
# Verificar se .env.production está no git
git ls-files | grep -E "\.env"

# Não deve retornar nada, ou só .env.example
```

### Se Secrets Estão Expostos

**1. Remover do Git**

```bash
git rm --cached .env .env.production
git add .gitignore
git commit -m "remove: secrets from git history"
git push
```

**2. Rotate Secrets**

```bash
# Gerar novo JWT_SECRET
openssl rand -base64 32

# Atualizar no Railway
# Railway → Settings → Variables → JWT_SECRET

# Redeploy
# Railway → Deployments → Redeploy

# Mudar DATABASE_URL se credenciais foram públicas
```

**3. Histórico Git**

⚠️ **AVISO**: Commitar para git NÃO remove do histórico

Se credenciais foram públicas por tempo:
- Mudar SECRET no banco
- Mudar DATABASE_URL/user/pass
- Considerar usar `git-filter-branch` ou BFG Repo-Cleaner
- Notificar security team

---

## 📊 Debug: Listar Todas as Variáveis

### Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link projeto
railway link

# Ver variáveis
railway variables

# Output esperado:
# DATABASE_URL    = postgresql://...
# JWT_SECRET      = ●●●●●●●●●●●●●●●● (redacted)
# NODE_ENV        = production
# CORS_ORIGIN     = https://...
```

### Via API (Manual)

```bash
# Railway Dashboard → api-production → Settings → Variables
# Ver cada variável e valores
```

---

## 🚀 Build Falha Silenciosamente

### Sintomas
```
Railway → Deployments → Build status: Failed
Railway → Logs: Sem mensagens claras
```

### Diagnóstico

**1. Verificar Build Logs**

```
Railway → Deployments → Clique no deployment
Railway → Logs → Ver a seção de build
```

**2. Build Local**

```bash
cd /home/jackob/ArquivosDev/produtos

# Limpar
rm -rf node_modules dist apps/*/dist

# Rebuild
npm run build

# Se falhar, mensagem deve explicar por quê
```

**3. Verificar Dependências**

```bash
# Verificar se todas as dependências estão definidas
pnpm install

# Verificar se build passa
pnpm -F @catalogpro/api build

# Se erro, corrigir localmente e fazer commit
```

---

## ✅ Verificação Final

### Checklist de Funcionamento

```bash
# 1. Health Endpoint
curl -I https://produtos-production.up.railway.app/api/v1/health
# Deve retornar: HTTP 200

# 2. CORS Headers
curl -X OPTIONS \
  -H "Origin: https://produtos-9di.pages.dev" \
  https://produtos-production.up.railway.app/api/v1/auth/login \
  -v 2>&1 | grep access-control
# Deve retornar access-control-allow-origin

# 3. Auth Endpoint
curl -X POST https://produtos-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
# Não deve retornar 404

# 4. Logs
# Railway Dashboard → Logs
# Deve ter: "server started"
# Não deve ter: "Error", "Failed"
```

### Se Todos Passam ✅

🎉 **API está funcionando!**

Próximas validações:
- [ ] Frontend consegue fazer login
- [ ] Frontend consegue registrar
- [ ] Cookies/JWT são salvos
- [ ] Perfil do usuário carrega

