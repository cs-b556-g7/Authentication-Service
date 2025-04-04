import { registerSchema } from './registerSchema.js';

export const authValidation = (req, res, next) => {
  try {
    req.body = registerSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: error.errors.map(e => ({
        field: e.path[0],
        message: e.message
      }))
    });
  }
};
