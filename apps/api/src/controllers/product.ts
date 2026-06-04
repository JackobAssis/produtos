import type { Request, Response } from 'express'
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
} from '../schemas/product.js'
import * as productService from '../services/product.js'

export async function listProducts(req: Request, res: Response) {
  const query = ProductQuerySchema.parse(req.query)
  const result = await productService.listProducts(req.auth.companyId, query)
  res.json({ success: true, ...result })
}

export async function getProductById(req: Request, res: Response) {
  const product = await productService.getProductById(
    req.auth.companyId,
    req.params.id as string,
  )
  res.json({ success: true, data: product })
}

export async function createProduct(req: Request, res: Response) {
  const data = CreateProductSchema.parse(req.body)
  const product = await productService.createProduct(req.auth.companyId, data)
  res.status(201).json({ success: true, data: product })
}

export async function updateProduct(req: Request, res: Response) {
  const data = UpdateProductSchema.parse(req.body)
  const product = await productService.updateProduct(
    req.auth.companyId,
    req.params.id as string,
    data,
  )
  res.json({ success: true, data: product })
}

export async function deleteProduct(req: Request, res: Response) {
  await productService.deleteProduct(req.auth.companyId, req.params.id as string)
  res.json({ success: true, data: null })
}

export async function listPublicProducts(req: Request, res: Response) {
  const { categoryId, search } = req.query as { categoryId?: string; search?: string }
  const products = await productService.listPublicProducts(
    req.params.slug as string,
    categoryId,
    search,
  )
  res.json({ success: true, data: products })
}
