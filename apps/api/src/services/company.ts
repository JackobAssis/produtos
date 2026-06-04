import { prisma } from '../lib/prisma.js'
import { NotFoundError } from '../middlewares/error-handler.js'
import type { UpdateCompanyInput } from '../schemas/company.js'

export async function getCompany(companyId: string) {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) {
    throw new NotFoundError('Company')
  }
  return company
}

export async function updateCompany(companyId: string, input: UpdateCompanyInput) {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: input,
  })
  return company
}

export async function getCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      bannerUrl: true,
      whatsapp: true,
      plan: true,
    },
  })
  if (!company) {
    throw new NotFoundError('Company')
  }
  return company
}
