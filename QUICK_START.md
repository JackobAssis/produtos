# ⚡ Quick Start - Resolver Erro CORS em 15 Minutos

## 🔴 O Problema
Login/Registrar retornam erro CORS 404

## 🎯 A Solução
API não está inicializando por falta de variáveis de ambiente

## 🚀 Solução em 3 Passos

### 1️⃣ Gerar JWT_SECRET (1 min)
```bash
openssl rand -base64 32
# Copie o output
```

### 2️⃣ Configurar Railway (5 min)
1. https://railway.app → Projeto "produtos" → "api-production"
2. Settings → Variables
3. Adicione:
   - `DATABASE_URL` = [copie do PostgreSQL service]
   - `JWT_SECRET` = [colar valor do passo 1]
   - `NODE_ENV` = production
   - `CORS_ORIGIN` = `https://catalogpro.pages.dev,https://produtos-9di.pages.dev,http://localhost:5173`

### 3️⃣ Redeploy (5 min)
1. Railway Dashboard → Deployments
2. Clique Redeploy
3. Aguarde logs verde

## ✅ Verificação (2 min)
```bash
curl -I https://produtos-production.up.railway.app/api/v1/health
# Esperado: HTTP 200 ✅
```

## 📚 Precisa de Mais Detalhes?
- **DEPLOYMENT.md** - Guia completo
- **TROUBLESHOOTING.md** - Se der erro

## 🎉 Pronto!
Agora o login deve funcionar
