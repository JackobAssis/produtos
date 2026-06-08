# 🚀 Guia de Deployment

## ⚡ Problema Atual

A API está retornando **HTTP 404** ao ser acessada de `https://produtos-9di.pages.dev`.

### 🔴 Causa Raiz
- **DATABASE_URL** não está configurada no Railway
- **JWT_SECRET** não está configurada no Railway
- A validação de environment variables falha e a API não inicia

### ✅ Código está correto
- CORS está 100% configurado
- TypeScript compila sem erros
- API funciona perfeitamente localmente

---

## 🔧 Solução: Configurar Railway

### 1️⃣ Acessar Railway Dashboard

1. Vá para https://railway.app
2. Faça login
3. Selecione projeto **"produtos"**
4. Selecione serviço **"api-production"**

### 2️⃣ Gerar JWT_SECRET Seguro

Execute este comando no seu terminal:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Exemplo de saída:**
```
7kN9mB2pQxL8vR4wZ6cD1eF5gH3jI9nO0rS2tU4vW6xY8zZ
```

### 3️⃣ Configurar Variáveis no Railway

1. No Railway Dashboard, clique em **Settings**
2. Vá para **Variables**
3. Adicione/atualize:

#### VARIÁVEIS OBRIGATÓRIAS

**DATABASE_URL**
- Formato: `postgresql://user:password@host:port/database`
- Obtém em: Railway → PostgreSQL service → Conectar
- Exemplo: `postgresql://user:pass@localhost:5432/catalogpro`

**JWT_SECRET**
- Cole o valor gerado no passo 2️⃣
- Mínimo 16 caracteres (gerado tem 44)

#### VARIÁVEIS RECOMENDADAS

```
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://catalogpro.pages.dev,https://produtos-9di.pages.dev,http://localhost:5173
```

#### VARIÁVEIS OPCIONAIS (Cloudflare R2)

Se usar upload de arquivos:
```
R2_ACCOUNT_ID=seu_account_id
R2_ACCESS_KEY_ID=seu_access_key
R2_SECRET_ACCESS_KEY=seu_secret_key
R2_BUCKET_NAME=seu_bucket
R2_PUBLIC_URL=https://seu_bucket.seu_domain.com
```

### 4️⃣ Redeploy a Aplicação

1. Clique em **Deployments**
2. Clique no botão **Redeploy** da última versão
3. Aguarde a conclusão (veja os logs verde)

### 5️⃣ Verificar Logs

1. Vá para **Logs** (aba ao lado de Settings)
2. Procure por mensagens como:
   - ✅ `server started` → Sucesso!
   - ❌ `Error: Invalid environment` → Falta variável
   - ❌ `DATABASE_URL` → Falta configurar

### 6️⃣ Testar API

```bash
# Test 1: Health endpoint
curl -I https://produtos-production.up.railway.app/api/v1/health

# Esperado: HTTP 200 OK
# ✅ Se retornar 200, a API está funcionando!
# ❌ Se retornar 404, volte ao passo 4️⃣

# Test 2: CORS Preflight
curl -X OPTIONS \
  -H "Origin: https://produtos-9di.pages.dev" \
  -H "Access-Control-Request-Method: POST" \
  https://produtos-production.up.railway.app/api/v1/auth/login \
  -v | grep -i access-control

# Esperado: access-control-allow-origin: https://produtos-9di.pages.dev
```

---

## 🔐 Segurança: Secrets

### ❌ NUNCA FAÇA ISTO

```bash
# ❌ NÃO commit secrets no git
echo "JWT_SECRET=my-secret" > .env.production
git add .env.production
git push  # Credenciais expostas! 🔓
```

### ✅ FAÇA ISTO

1. **Localmente**: Use arquivo `.env` (git-ignorado)
   ```bash
   # .env (git-ignorado, só local)
   JWT_SECRET=seu-secret-local
   DATABASE_URL=seu-database-local
   ```

2. **Production (Railway)**: Configure via Dashboard
   - Nunca adicione `.env.production` ao git
   - Railway → Settings → Variables
   - Injeta automaticamente no container

3. **Verificação**:
   ```bash
   # Verificar que .env.production não está no git
   git ls-files | grep .env
   # Não deve retornar nada, só .env.example
   ```

---

## 🧪 Desenvolvimento Local

### Setup Inicial

```bash
# 1. Copiar .env.example
cp .env.example .env

# 2. Editar .env com valores locais
# DATABASE_URL=postgresql://localhost/catalogpro_dev
# JWT_SECRET=seu-secret-local-minimo-16-chars

# 3. Build
npm run build

# 4. Iniciar API
pnpm -F @catalogpro/api start

# 5. Testar (outro terminal)
curl http://localhost:3001/api/v1/health
# Esperado: {"success":true,"data":{"status":"ok"}}
```

### Development Mode

```bash
# Terminal 1: Watch mode da API
pnpm -F @catalogpro/api dev

# Terminal 2: Dev server do frontend
pnpm -F @catalogpro/web dev

# Acesso em: http://localhost:5173
```

---

## 🐛 Troubleshooting

### ❌ API retorna 404

**Possíveis Causas:**

1. **Variáveis de ambiente não configuradas**
   - Solução: Ver passo 3️⃣
   - Verificação: `Railway → Settings → Variables`

2. **Build falhou silenciosamente**
   - Verificação: `Railway → Deployments → Logs`
   - Procure por: "Error", "Build failed"

3. **PORT conflita**
   - Solução: Verificar se PORT está livre
   - Railway → Settings → Deploy

### ❌ "Access-Control-Allow-Origin" error

**Possíveis Causas:**

1. **CORS_ORIGIN não configurada**
   - Solução: Ver passo 3️⃣
   - Verificação: Testar preflight curl

2. **Frontend usando URL errada**
   - Verificar: `apps/web/src/services/api.ts`
   - VITE_API_URL deve ser URL do Railway

### ✅ Tudo funcionando localmente mas não em Production?

1. Verificar logs do Railway: `Railway → Logs`
2. Comparar variáveis locais vs Railway:
   ```bash
   # Local (deve funcionar)
   pnpm -F @catalogpro/api start
   curl http://localhost:3001/api/v1/health
   
   # Railway (verificar logs se falhar)
   curl https://produtos-production.up.railway.app/api/v1/health
   ```

---

## 📋 Checklist de Deployment

Antes de considerar pronto:

- [ ] `DATABASE_URL` configurada no Railway
- [ ] `JWT_SECRET` configurada no Railway (>= 16 chars)
- [ ] `NODE_ENV=production` no Railway
- [ ] `CORS_ORIGIN` contém `https://produtos-9di.pages.dev`
- [ ] Redeploy feito no Railway
- [ ] Logs mostram "server started" (verde)
- [ ] `/api/v1/health` retorna 200
- [ ] Preflight OPTIONS retorna 200
- [ ] Frontend consegue fazer login/registrar
- [ ] `.env.production` está em `.gitignore`
- [ ] Nenhum arquivo `.env*` no git (verificar: `git ls-files`)

---

## 🔄 Rotate Secrets (Se comprometidos)

Se alguém teve acesso ao JWT_SECRET:

```bash
# 1. Gerar novo JWT_SECRET
openssl rand -base64 32

# 2. Atualizar no Railway
# Railway → Settings → Variables → JWT_SECRET → Edit

# 3. Redeploy
# Railway → Deployments → Redeploy

# 4. Confirmar que aplicação iniciou
# Railway → Logs (procure por "server started")
```

---

## 📚 Referências

- [Railway Docs - Environment Variables](https://railway.app/docs/develop/environment)
- [Express CORS Package](https://github.com/expressjs/cors)
- [Zod Validation](https://zod.dev/)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)

---

## ✨ Checklist de Deploy Bem-Sucedido

Quando tudo estiver funcionando:

✅ API responde com `HTTP 200` em `/api/v1/health`
✅ CORS preflight retorna headers corretos
✅ Frontend consegue fazer requisições autenticadas
✅ Login e Registro funcionam
✅ Ambiente seguro (secrets não em git)
✅ Logs do Railway mostram "server started"

🎉 **Pronto para produção!**

