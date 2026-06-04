import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../logger.js'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details: unknown = null,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(404, `${entity.toUpperCase()}_NOT_FOUND`, `${entity} não encontrado`)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(401, 'UNAUTHORIZED', message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(403, 'FORBIDDEN', message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message)
  }
}

export class PlanLimitError extends AppError {
  constructor(message: string) {
    super(422, 'PLAN_LIMIT', message)
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: err.errors,
      },
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    })
    return
  }

  logger.error({ err }, 'unhandled error')

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      details: null,
    },
  })
}
