import { z } from 'zod'

export const UpdateCompanySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  whatsapp: z.string().max(20).nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
})

export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>
