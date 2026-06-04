// ─── Company ───────────────────────────────────────────────
export type Company = {
  id: string
  name: string
  slug: string
  document: string | null
  phone: string | null
  whatsapp: string | null
  logoUrl: string | null
  bannerUrl: string | null
  plan: Plan
  status: CompanyStatus
  createdAt: string
  updatedAt: string
}

export type CompanyPublic = {
  name: string
  slug: string
  logoUrl: string | null
  bannerUrl: string | null
  whatsapp: string | null
}

// ─── Enums ─────────────────────────────────────────────────
export type Plan = 'FREE' | 'PRO' | 'PREMIUM'
export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL'
export type UserRole = 'OWNER' | 'STAFF'

// ─── User ──────────────────────────────────────────────────
export type User = {
  id: string
  companyId: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
  updatedAt: string
}

// ─── Category ──────────────────────────────────────────────
export type Category = {
  id: string
  companyId: string
  name: string
  slug: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

// ─── Product Image ─────────────────────────────────────────
export type ProductImage = {
  id: string
  productId: string
  imageUrl: string
  isPrimary: boolean
  position: number
  createdAt: string
  updatedAt: string
}

// ─── Product ───────────────────────────────────────────────
export type Product = {
  id: string
  companyId: string
  categoryId: string | null
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  imageUrl: string | null
  images: ProductImage[]
  active: boolean
  featured: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

// ─── API Response ──────────────────────────────────────────
export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: {
    code: string
    message: string
    details: unknown
  }
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── Auth ──────────────────────────────────────────────────
export type AuthPayload = {
  sub: string
  companyId: string
  role: UserRole
}
