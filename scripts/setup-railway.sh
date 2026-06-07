#!/bin/bash

# Setup Railway Environment Variables
# Este script ajuda a configurar as variáveis de ambiente no Railway

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Railway Environment Setup Helper                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI não está instalado"
    echo "Instale com: npm i -g @railway/cli"
    exit 1
fi

echo "🔑 Gerando JWT_SECRET seguro..."
JWT_SECRET=$(openssl rand -base64 32)
echo "   JWT_SECRET gerado: ${JWT_SECRET:0:20}... (full token hidden)"
echo ""

echo "📋 Configure as seguintes variáveis no Railway Dashboard:"
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ VARIÁVEIS OBRIGATÓRIAS                                       │"
echo "├──────────────────────────────────────────────────────────────┤"
echo "│ DATABASE_URL (PostgreSQL connection string)                  │"
echo "│ JWT_SECRET (gerado acima)                                    │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

echo "JWT_SECRET gerado:"
echo "$JWT_SECRET"
echo ""
echo "📍 Próximas etapas:"
echo "   1. Abra https://railway.app"
echo "   2. Selecione projeto 'produtos' → 'api-production'"
echo "   3. Vá para Settings → Variables"
echo "   4. Adicione DATABASE_URL e JWT_SECRET"
echo "   5. Vá para Deployments e Redeploy"
