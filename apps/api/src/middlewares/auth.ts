import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../env.js'
import { UnauthorizedError, ForbiddenError } from './error-handler.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth: {
        userId: string
        companyId: string
        role: string
      }
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token não fornecido')
  }

  const token = header.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string
      companyId: string
      role: string
    }

    req.auth = {
      userId: payload.sub,
      companyId: payload.companyId,
      role: payload.role,
    }

    next()
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado')
  }
}

export function requireCompany(req: Request, _res: Response, next: NextFunction) {
  const { companyId } = req.auth
  const resourceCompanyId = req.params.companyId ?? req.body.companyId

  if (resourceCompanyId && resourceCompanyId !== companyId) {
    throw new ForbiddenError('Acesso a recurso de outra empresa')
  }

  next()
}
