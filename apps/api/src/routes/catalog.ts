import { Router } from 'express'
import * as companyController from '../controllers/company.js'
import * as productController from '../controllers/product.js'

const router = Router()

router.get('/:slug', companyController.getPublicCompany)
router.get('/:slug/products', productController.listPublicProducts)

export { router as catalogRoutes }
