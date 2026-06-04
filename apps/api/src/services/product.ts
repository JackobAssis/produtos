import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { NotFoundError, PlanLimitError } from '../middlewares/error-handler.js'
import type { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../schemas/product.js'

const MAX_PRODUCTS_FREE = 20

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const productInclude = {
  category: { select: { id: true, name: true } },
  images: { orderBy: { position: 'asc' as const } },
}

export async function listProducts(companyId: string, query: ProductQueryInput) {
  const where: Prisma.ProductWhereInput = { companyId }

  if (query.categoryId) {
    where.categoryId = query.categoryId
  }
  if (query.active !== undefined) {
    where.active = query.active
  }
  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' }
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ])

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getProductById(companyId: string, id: string) {
  const product = await prisma.product.findFirst({
    where: { id, companyId },
    include: productInclude,
  })
  if (!product) {
    throw new NotFoundError('Product')
  }
  return product
}

export async function createProduct(companyId: string, input: CreateProductInput) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { plan: true },
  })

  if (company?.plan === 'FREE') {
    const activeCount = await prisma.product.count({
      where: { companyId, active: true },
    })
    if (activeCount >= MAX_PRODUCTS_FREE) {
      throw new PlanLimitError(
        `Plano FREE permite no máximo ${MAX_PRODUCTS_FREE} produtos ativos`,
      )
    }
  }

  const slug = generateSlug(input.name)

  const { images, ...productData } = input

  return prisma.product.create({
    data: {
      companyId,
      name: productData.name,
      slug,
      description: productData.description ?? null,
      price: productData.price,
      comparePrice: productData.comparePrice ?? null,
      categoryId: productData.categoryId ?? null,
      imageUrl: productData.imageUrl ?? null,
      active: productData.active ?? true,
      featured: productData.featured ?? false,
      stock: productData.stock ?? 0,
      images: images?.length
        ? {
            create: images,
          }
        : undefined,
    },
    include: productInclude,
  })
}

export async function updateProduct(
  companyId: string,
  id: string,
  input: UpdateProductInput,
) {
  const product = await prisma.product.findFirst({
    where: { id, companyId },
  })
  if (!product) {
    throw new NotFoundError('Product')
  }

  const { images, ...fields } = input

  const data: Record<string, unknown> = { ...fields }
  if (input.name) {
    data.slug = generateSlug(input.name)
  }

  if (images) {
    await prisma.productImage.deleteMany({ where: { productId: id } })
    await prisma.productImage.createMany({
      data: images.map((img) => ({
        productId: id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        position: img.position,
      })),
    })
  }

  return prisma.product.update({
    where: { id },
    data,
    include: productInclude,
  })
}

export async function deleteProduct(companyId: string, id: string) {
  const product = await prisma.product.findFirst({
    where: { id, companyId },
    include: { images: true },
  })
  if (!product) {
    throw new NotFoundError('Product')
  }

  return prisma.product.delete({ where: { id } })
}

export async function listPublicProducts(companySlug: string, categoryId?: string, search?: string) {
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
    select: { id: true },
  })
  if (!company) {
    throw new NotFoundError('Company')
  }

  const where: Prisma.ProductWhereInput = {
    companyId: company.id,
    active: true,
  }

  if (categoryId) {
    where.categoryId = categoryId
  }
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      comparePrice: true,
      imageUrl: true,
      categoryId: true,
      category: { select: { id: true, name: true } },
      images: {
        where: { isPrimary: true },
        select: { imageUrl: true },
        take: 1,
      },
    },
  })
}
