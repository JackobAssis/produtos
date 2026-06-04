import { Router } from 'express'
import * as categoryController from '../controllers/category.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { CreateCategorySchema, UpdateCategorySchema } from '../schemas/category.js'

const router = Router()

router.use(requireAuth)

router.get('/', categoryController.listCategories)
router.post('/', validate(CreateCategorySchema), categoryController.createCategory)
router.patch('/:id', validate(UpdateCategorySchema), categoryController.updateCategory)
router.delete('/:id', categoryController.deleteCategory)

export { router as categoryRoutes }
