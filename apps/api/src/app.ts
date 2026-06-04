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

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
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
