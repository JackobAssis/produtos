import { z } from 'zod'

const ProductImageSchema = z.object({
  imageUrl: z.string().url(),
  isPrimary: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
})

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  price: z.number().min(0).max(99999999.99),
  comparePrice: z.number().min(0).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  images: z.array(ProductImageSchema).max(5).optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  stock: z.number().int().min(0).default(0),
})

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0).optional(),
  comparePrice: z.number().min(0).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  images: z.array(ProductImageSchema).max(5).optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
})

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  active: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sort: z.enum(['createdAt', 'name', 'price']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>
