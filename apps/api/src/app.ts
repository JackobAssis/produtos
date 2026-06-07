import express from 'express'
import cors from 'cors'
import { errorHandler } from './middlewares/error-handler.js'
import { authRoutes } from './routes/auth.js'
import { companyRoutes } from './routes/company.js'
import { catalogRoutes } from './routes/catalog.js'
import { categoryRoutes } from './routes/category.js'
import { productRoutes } from './routes/product.js'

export function createApp() {
  const app = express()

  const envOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const allowedOrigins = [
    ...envOrigins,
    'http://localhost:5173',
    'http://localhost:4173',
    'https://catalogpro.pages.dev',
    'https://produtos-9di.pages.dev',
  ]

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  }))
  app.use(express.json())

  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } })
  })

  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/companies', companyRoutes)
  app.use('/api/v1/categories', categoryRoutes)
  app.use('/api/v1/products', productRoutes)
  app.use('/api/v1/catalog', catalogRoutes)

  app.use(errorHandler)

  return app
}
