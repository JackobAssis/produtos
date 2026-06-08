#!/bin/bash

# Script de Validação da Configuração Railway
# Uso: ./scripts/validate-railway-setup.sh

set -e

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║             VALIDADOR DE CONFIGURAÇÃO RAILWAY - API PRODUCTION              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="https://produtos-production.up.railway.app"
ENDPOINTS=(
  "/api/v1/health"
  "/api/v1/auth/login"
  "/api/v1/auth/register"
)

echo -e "${BLUE}🔍 Verificando conectividade com Railway...${NC}\n"

# Test 1: Basic connectivity
echo -e "${YELLOW}1. Testando endpoint /health${NC}"
if response=$(curl -s -w "\n%{http_code}" -I "$API_URL/api/v1/health" 2>/dev/null); then
  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ API respondendo (HTTP 200)${NC}"
  else
    echo -e "${RED}❌ API retornou HTTP $http_code${NC}"
    echo "   Esperado: 200"
    echo "   Possível: Variáveis de ambiente não configuradas no Railway"
  fi
else
  echo -e "${RED}❌ Erro ao conectar${NC}"
  echo "   Verifique:"
  echo "   - URL do Railway está correta?"
  echo "   - Conexão com internet?"
  echo "   - Railway app está rodando?"
fi

echo ""
echo -e "${YELLOW}2. Verificando headers CORS${NC}"
if response=$(curl -s -I -H "Origin: https://produtos-9di.pages.dev" "$API_URL/api/v1/health" 2>/dev/null); then
  if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    origin=$(echo "$response" | grep "Access-Control-Allow-Origin" | head -1)
    echo -e "${GREEN}✅ CORS Header presente${NC}"
    echo "   $origin"
  else
    echo -e "${YELLOW}⚠️  CORS header não encontrado${NC}"
    echo "   Pode indicar que a API ainda não está inicializando corretamente"
  fi
else
  echo -e "${RED}❌ Erro ao verificar headers${NC}"
fi

echo ""
echo -e "${YELLOW}3. Testando POST /login (sem credenciais)${NC}"
if response=$(curl -s -w "\n%{http_code}" -X OPTIONS "$API_URL/api/v1/auth/login" 2>/dev/null); then
  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "204" ] || [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ Preflight request aceito${NC}"
  else
    echo -e "${YELLOW}⚠️  Preflight retornou HTTP $http_code${NC}"
  fi
else
  echo -e "${RED}❌ Erro no preflight${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4: Environment validation
echo -e "${YELLOW}4. Checklist de Configuração Railway${NC}"
echo ""
echo "   Verifique se as seguintes variáveis estão configuradas:"
echo "   (Railway Dashboard → api-production → Variables)"
echo ""
echo "   ☐ DATABASE_URL"
echo "     └─ Formato: postgresql://user:pass@host:5432/dbname"
echo "     └─ Fonte: Railway PostgreSQL → Connect → Postgres Connection String"
echo ""
echo "   ☐ JWT_SECRET"
echo "     └─ Mínimo 16 caracteres"
echo "     └─ Gerar: openssl rand -base64 32"
echo ""
echo "   ☐ NODE_ENV = production"
echo ""
echo "   ☐ CORS_ORIGIN (opcional, já tem default)"
echo "     └─ Valores: https://produtos-9di.pages.dev,https://catalogpro.pages.dev,http://localhost:5173"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5: Local build check
echo -e "${YELLOW}5. Verificando build local${NC}"
if [ -f "apps/api/dist/index.js" ]; then
  echo -e "${GREEN}✅ API built locally${NC}"
else
  echo -e "${YELLOW}⚠️  Build local não encontrado${NC}"
  echo "   Execute: npm run build"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📋 Próximos Passos:${NC}"
echo ""
echo "1. Se DATABASE_URL e JWT_SECRET NÃO estão configurados:"
echo "   → Ir para: QUICK_START.md (3 passos)"
echo ""
echo "2. Se estão configurados mas API retorna 404:"
echo "   → Verificar Railway Logs:"
echo "     Railway Dashboard → api-production → Logs"
echo "   → Procurar por 'Error' ou 'ENOENT'"
echo ""
echo "3. Se CORS headers não aparecem:"
echo "   → Railway pode estar offline"
echo "   → Redeploy: Railway → Deployments → Redeploy Latest"
echo ""
echo "4. Após confirmar HTTP 200 em /health:"
echo "   → Testar login no navegador"
echo "   → Verificar console.log da browser (F12)"
echo ""
echo -e "${BLUE}Documentação:${NC}"
echo "   • QUICK_START.md - Solução rápida (5 min)"
echo "   • DEPLOYMENT.md - Guia completo (15 min)"
echo "   • TROUBLESHOOTING.md - Debug avançado"
echo ""
