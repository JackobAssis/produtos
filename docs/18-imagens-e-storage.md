# Imagens e Storage

## Objetivo

Definir as regras de armazenamento, organização e exibição de imagens do sistema CatalogPro.

Este documento complementa:

* 05-banco-de-dados.md
* 13-modelagem-prisma.md

---

# Princípios

As imagens não serão armazenadas no banco de dados.

O banco armazenará apenas referências (URLs).

As imagens serão armazenadas no Cloudflare R2.

Benefícios:

* Menor consumo de banco de dados
* Backups menores
* Melhor escalabilidade
* Menor custo operacional
* Melhor performance

---

# Fluxo de Upload

Fluxo esperado:

Usuário
↓
Frontend
↓
Cloudflare R2
↓
URL salva no banco
↓
Catálogo exibe a imagem

O backend será responsável apenas por:

* autenticação
* autorização
* geração de URL temporária de upload (presigned URL)
* persistência da URL no banco

---

# Estrutura do Storage

Organização dos arquivos no Cloudflare R2:

companies/
├── company-id/
│
├── products/
│   ├── product-id/
│   │   ├── image-1.webp
│   │   ├── image-2.webp
│   │   └── image-3.webp
│
├── logo.webp
└── banner.webp

Exemplo:

companies/abc123/products/prod001/image-1.webp

---

# Formato das Imagens

Formato oficial:

WEBP

Motivos:

* menor tamanho
* boa qualidade
* suporte amplo nos navegadores modernos

Não armazenar:

* BMP
* TIFF

Formatos aceitos para upload:

* JPG
* JPEG
* PNG
* WEBP

Todos devem ser convertidos para WEBP antes do armazenamento final.

---

# Otimização

Objetivo:

Padronizar qualidade e reduzir consumo de banda.

Regras:

Largura máxima:
1200px

Altura máxima:
1200px

Qualidade:
80%

Tamanho alvo:

150KB a 300KB por imagem

Tamanho máximo permitido após processamento:

2MB

---

# Imagem Principal

Todo produto deve possuir uma imagem principal.

A imagem principal será utilizada:

* na listagem de produtos
* em resultados de busca
* em cards
* em compartilhamentos futuros

Estratégia:

Tabela product_images

Campos:

id
product_id
image_url
is_primary
position
created_at

Apenas uma imagem poderá possuir:

is_primary = true

para cada produto.

---

# Estrutura da Tabela product_images

Campos:

id
product_id
image_url
is_primary
position
created_at
updated_at

Relacionamentos:

product_images.product_id
→ products.id

---

# Quantidade de Imagens

MVP:

mínimo:
1 imagem

máximo:
5 imagens por produto

---

# Limites por Plano

Plano Free

* até 20 produtos
* até 3 imagens por produto

Plano Pro

* produtos ilimitados
* até 10 imagens por produto

Plano Premium

* produtos ilimitados
* até 20 imagens por produto

Observação:

A implementação dos limites poderá ocorrer após a validação do MVP.

---

# Exclusão de Arquivos

Ao remover um produto:

1. remover registros da tabela product_images
2. remover arquivos físicos do Cloudflare R2

Não permitir arquivos órfãos.

---

# CDN

As imagens deverão ser servidas através da infraestrutura da Cloudflare.

Objetivos:

* carregamento rápido
* cache global
* menor latência
* menor consumo de banda no storage

---

# Futuras Melhorias

Após validação do MVP poderão ser adicionados:

* geração automática de thumbnails
* múltiplas resoluções
* marca d'água opcional
* compressão avançada
* lazy loading otimizado
* galeria com zoom
* imagens 360°

Essas funcionalidades não fazem parte do escopo inicial do MVP.

---

# Decisão Arquitetural

O CatalogPro utilizará:

* PostgreSQL para dados
* Cloudflare R2 para arquivos
* Cloudflare CDN para distribuição

O banco armazenará apenas URLs das imagens.

Nenhuma imagem será armazenada diretamente no PostgreSQL.
