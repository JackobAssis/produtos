import type { Request, Response } from 'express'
import { CreateCategorySchema, UpdateCategorySchema } from '../schemas/category.js'
import * as categoryService from '../services/category.js'

export async function listCategories(req: Request, res: Response) {
  const categories = await categoryService.listCategories(req.auth.companyId)
  res.json({ success: true, data: categories })
}

export async function createCategory(req: Request, res: Response) {
  const data = CreateCategorySchema.parse(req.body)
  const category = await categoryService.createCategory(req.auth.companyId, data)
  res.status(201).json({ success: true, data: category })
}

export async function updateCategory(req: Request, res: Response) {
  const data = UpdateCategorySchema.parse(req.body)
  const category = await categoryService.updateCategory(
    req.auth.companyId,
    req.params.id as string,
    data,
  )
  res.json({ success: true, data: category })
}

export async function deleteCategory(req: Request, res: Response) {
  await categoryService.deleteCategory(req.auth.companyId, req.params.id as string)
  res.json({ success: true, data: null })
}
