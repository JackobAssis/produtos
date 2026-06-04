import { Router } from 'express'
import * as authController from '../controllers/auth.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { RegisterSchema, LoginSchema } from '../schemas/auth.js'

const router = Router()

router.post('/register', validate(RegisterSchema), authController.register)
router.post('/login', validate(LoginSchema), authController.login)
router.get('/me', requireAuth, authController.me)

export { router as authRoutes }
