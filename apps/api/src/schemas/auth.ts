import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  companyName: z.string().min(2).max(255),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
