import { prisma } from '../lib/prisma.js'
import { NotFoundError, ConflictError } from '../middlewares/error-handler.js'
import type { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.js'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function listCategories(companyId: string) {
  return prisma.category.findMany({
    where: { companyId },
    orderBy: { order: 'asc' },
  })
}

export async function createCategory(companyId: string, input: CreateCategoryInput) {
  const slug = generateSlug(input.name)

  const existing = await prisma.category.findUnique({
    where: { companyId_slug: { companyId, slug } },
  })
  if (existing) {
    throw new ConflictError('Categoria já existe')
  }

  return prisma.category.create({
    data: {
      companyId,
      name: input.name,
      slug,
      order: input.order,
    },
  })
}

export async function updateCategory(
  companyId: string,
  id: string,
  input: UpdateCategoryInput,
) {
  const category = await prisma.category.findFirst({
    where: { id, companyId },
  })
  if (!category) {
    throw new NotFoundError('Category')
  }

  const data: Record<string, unknown> = { ...input }
  if (input.name) {
    data.slug = generateSlug(input.name)
  }

  return prisma.category.update({
    where: { id },
    data,
  })
}

export async function deleteCategory(companyId: string, id: string) {
  const category = await prisma.category.findFirst({
    where: { id, companyId },
  })
  if (!category) {
    throw new NotFoundError('Category')
  }

  return prisma.category.delete({ where: { id } })
}
