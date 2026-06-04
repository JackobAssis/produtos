import { Router } from 'express'
import * as productController from '../controllers/product.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { CreateProductSchema, UpdateProductSchema } from '../schemas/product.js'

const router = Router()

router.use(requireAuth)

router.get('/', productController.listProducts)
router.post('/', validate(CreateProductSchema), productController.createProduct)
router.get('/:id', productController.getProductById)
router.patch('/:id', validate(UpdateProductSchema), productController.updateProduct)
router.delete('/:id', productController.deleteProduct)

export { router as productRoutes }
