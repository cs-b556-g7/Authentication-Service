import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
  role: z.enum(["user", "venue_owner"], {
    errorMap: () => ({ message: "Role must be 'user' or 'venue_owner'" })
  }),
  captchaToken: z.string().min(1, 'Captcha token is required')
});

export const validateLogin = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      issues: result.error.errors.map(e => ({
        field: e.path[0],
        message: e.message
      }))
    });
  }

  req.body = result.data;
  next();
};
