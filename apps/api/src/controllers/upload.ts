import type { Request, Response } from 'express'
import { z } from 'zod'
import { generateUploadUrl, buildImageKey } from '../lib/r2.js'

const RequestUploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  productId: z.string().uuid().optional(),
})

export async function requestUploadUrl(req: Request, res: Response) {
  const { fileName, contentType, productId } = RequestUploadSchema.parse(req.body)
  const companyId = req.auth.companyId

  const imageKey = productId
    ? buildImageKey(companyId, productId, fileName)
    : `companies/${companyId}/${fileName}`

  const url = await generateUploadUrl(imageKey, contentType)

  res.json({
    success: true,
    data: {
      url,
      key: imageKey,
      publicUrl: url
        ? `${process.env.R2_PUBLIC_URL}/${imageKey}`
        : null,
    },
  })
}
