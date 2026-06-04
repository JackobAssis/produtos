import type { Request, Response } from 'express'
import { RegisterSchema, LoginSchema } from '../schemas/auth.js'
import * as authService from '../services/auth.js'

export async function register(req: Request, res: Response) {
  const data = RegisterSchema.parse(req.body)
  const result = await authService.register(data)
  res.status(201).json({ success: true, data: result })
}

export async function login(req: Request, res: Response) {
  const data = LoginSchema.parse(req.body)
  const result = await authService.login(data)
  res.json({ success: true, data: result })
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.auth.userId)
  res.json({ success: true, data: user })
}
