import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const passwordHash = await bcrypt.hash('123456', 10)

  const company = await prisma.company.create({
    data: {
      name: 'Loja do João',
      slug: 'loja-do-joao',
      whatsapp: '5511999999999',
      phone: '5511999999999',
      plan: 'PRO',
    },
  })
  console.log(`✅ Company created: ${company.name} (${company.slug})`)

  const user = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'João Silva',
      email: 'joao@email.com',
      passwordHash,
      role: 'OWNER',
    },
  })
  console.log(`✅ User created: ${user.email} / senha: 123456`)

  const categories = await Promise.all([
    prisma.category.create({ data: { companyId: company.id, name: 'Bebidas', slug: 'bebidas', order: 1 } }),
    prisma.category.create({ data: { companyId: company.id, name: 'Alimentos', slug: 'alimentos', order: 2 } }),
    prisma.category.create({ data: { companyId: company.id, name: 'Limpeza', slug: 'limpeza', order: 3 } }),
    prisma.category.create({ data: { companyId: company.id, name: 'Hortifrúti', slug: 'hortifruti', order: 4 } }),
    prisma.category.create({ data: { companyId: company.id, name: 'Padaria', slug: 'padaria', order: 5 } }),
  ])
  console.log(`✅ ${categories.length} categories created`)

  const productData = [
    { name: 'Coca-Cola 2L', cat: 'Bebidas', price: 8.99 },
    { name: 'Guaraná Antarctica 2L', cat: 'Bebidas', price: 7.99 },
    { name: 'Suco de Laranja Natural 1L', cat: 'Bebidas', price: 6.50 },
    { name: 'Água Mineral 500ml', cat: 'Bebidas', price: 2.50 },
    { name: 'Cerveja Heineken Lata', cat: 'Bebidas', price: 4.99 },
    { name: 'Arroz Branco 5kg', cat: 'Alimentos', price: 22.90 },
    { name: 'Feijão Preto 1kg', cat: 'Alimentos', price: 7.90 },
    { name: 'Macarrão Espaguete 500g', cat: 'Alimentos', price: 4.50 },
    { name: 'Óleo de Soja 900ml', cat: 'Alimentos', price: 6.90 },
    { name: 'Açúcar Cristal 5kg', cat: 'Alimentos', price: 15.90 },
    { name: 'Detergente Líquido 500ml', cat: 'Limpeza', price: 3.50 },
    { name: 'Água Sanitária 1L', cat: 'Limpeza', price: 4.20 },
    { name: 'Sabão em Pó 1kg', cat: 'Limpeza', price: 12.90 },
    { name: 'Desinfetante 500ml', cat: 'Limpeza', price: 5.50 },
    { name: 'Esponja de Aço 8un', cat: 'Limpeza', price: 2.90 },
    { name: 'Banana Prata 1kg', cat: 'Hortifrúti', price: 5.90 },
    { name: 'Maçã Fuji 1kg', cat: 'Hortifrúti', price: 8.90 },
    { name: 'Tomate 1kg', cat: 'Hortifrúti', price: 6.90 },
    { name: 'Cebola 1kg', cat: 'Hortifrúti', price: 4.90 },
    { name: 'Alface Crespa', cat: 'Hortifrúti', price: 3.50 },
    { name: 'Pão Francês 1kg', cat: 'Padaria', price: 14.90 },
    { name: 'Bolo de Cenoura', cat: 'Padaria', price: 18.90 },
    { name: 'Pão de Forma Integral', cat: 'Padaria', price: 9.90 },
    { name: 'Sonho de Creme', cat: 'Padaria', price: 5.90 },
    { name: 'Bisnaguinha 300g', cat: 'Padaria', price: 7.90 },
  ]

  const productImages = [
    'https://placehold.co/400x400/3b82f6/ffffff?text=Produto+1',
    'https://placehold.co/400x400/10b981/ffffff?text=Produto+2',
    'https://placehold.co/400x400/f59e0b/ffffff?text=Produto+3',
    'https://placehold.co/400x400/ef4444/ffffff?text=Produto+4',
    'https://placehold.co/400x400/8b5cf6/ffffff?text=Produto+5',
  ]

  for (let i = 0; i < productData.length; i++) {
    const p = productData[i]
    const category = categories.find((c) => c.name === p.cat)

    const product = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: category?.id ?? null,
        name: p.name,
        slug: p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        price: p.price,
        active: true,
        stock: 100,
      },
    })

    const imgUrl = productImages[i % productImages.length]
    await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl: imgUrl,
        isPrimary: true,
        position: 0,
      },
    })

    if (i < 10) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: productImages[(i + 1) % productImages.length],
          isPrimary: false,
          position: 1,
        },
      })
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: productImages[(i + 2) % productImages.length],
          isPrimary: false,
          position: 2,
        },
      })
    }

    console.log(`  ✅ ${i + 1}/${productData.length}: ${p.name}`)
  }

  console.log(`✅ ${productData.length} products created with images`)
  console.log('\n🎉 Seed complete!')
  console.log(`\n📧 Login: joao@email.com`)
  console.log(`🔑 Senha: 123456`)
  console.log(`🔗 Catálogo: /catalog/loja-do-joao`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
