import type { Request, Response } from 'express'
import { UpdateCompanySchema } from '../schemas/company.js'
import * as companyService from '../services/company.js'

export async function getMyCompany(req: Request, res: Response) {
  const company = await companyService.getCompany(req.auth.companyId)
  res.json({ success: true, data: company })
}

export async function updateMyCompany(req: Request, res: Response) {
  const data = UpdateCompanySchema.parse(req.body)
  const company = await companyService.updateCompany(req.auth.companyId, data)
  res.json({ success: true, data: company })
}

export async function getPublicCompany(req: Request, res: Response) {
  const slug = req.params.slug as string
  const company = await companyService.getCompanyBySlug(slug)
  res.json({ success: true, data: company })
}
