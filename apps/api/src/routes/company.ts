import { Router } from 'express'
import * as companyController from '../controllers/company.js'
import * as uploadController from '../controllers/upload.js'
import { requireAuth } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { UpdateCompanySchema } from '../schemas/company.js'

const router = Router()

router.get('/me', requireAuth, companyController.getMyCompany)
router.patch('/me', requireAuth, validate(UpdateCompanySchema), companyController.updateMyCompany)
router.post('/upload-url', requireAuth, uploadController.requestUploadUrl)

export { router as companyRoutes }
