import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

const createScanSchema = z.object({
  url: z.string().min(1, 'URL is required').url('Must be a valid URL string'),
  options: z
    .object({
      maxPages: z.number().int().min(1).max(20).optional(),
      devices: z.array(z.enum(['desktop', 'tablet', 'mobile'])).optional(),
      captureScreenshots: z.boolean().optional(),
      recordVideo: z.boolean().optional(),
    })
    .optional(),
});

export function validateCreateScan(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = createScanSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.errors[0]?.message || 'Invalid scan request payload.',
          details: err.errors,
        },
      });
    }
    next(err);
  }
}
