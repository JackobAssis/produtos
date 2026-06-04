import { z } from 'zod'

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(255),
  order: z.number().int().default(0),
})

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
})

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
