import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { ConflictError, UnauthorizedError } from '../middlewares/error-handler.js'
import type { RegisterInput, LoginInput } from '../schemas/auth.js'
import { env } from '../env.js'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateToken(userId: string, companyId: string, role: string): string {
  return jwt.sign({ sub: userId, companyId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } })
  if (existingUser) {
    throw new ConflictError('Email já cadastrado')
  }

  const slug = generateSlug(input.companyName)

  const existingCompany = await prisma.company.findUnique({ where: { slug } })
  if (existingCompany) {
    throw new ConflictError('Nome de empresa já está em uso')
  }

  const passwordHash = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      company: {
        create: {
          name: input.companyName,
          slug,
        },
      },
    },
    include: { company: true },
  })

  const token = generateToken(user.id, user.companyId, user.role)

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    company: {
      id: user.company.id,
      name: user.company.name,
      slug: user.company.slug,
    },
  }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { company: true },
  })

  if (!user || !user.active) {
    throw new UnauthorizedError('Email ou senha inválidos')
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash)
  if (!validPassword) {
    throw new UnauthorizedError('Email ou senha inválidos')
  }

  const token = generateToken(user.id, user.companyId, user.role)

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    company: {
      id: user.company.id,
      name: user.company.name,
      slug: user.company.slug,
    },
  }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  })

  if (!user) {
    throw new UnauthorizedError('Usuário não encontrado')
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    company: {
      id: user.company.id,
      name: user.company.name,
      slug: user.company.slug,
      logoUrl: user.company.logoUrl,
      whatsapp: user.company.whatsapp,
      plan: user.company.plan,
    },
  }
}
