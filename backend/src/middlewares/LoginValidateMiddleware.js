import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 6 characters long"),
});

export const validateMiddleware = (req, res, next) => {
  try {
    loginSchema.safeParse(req.body); 
    next(); 
  } catch (err) {
    return res.status(400).json({ error: err.errors.map(e => e.message) });
  }
};
