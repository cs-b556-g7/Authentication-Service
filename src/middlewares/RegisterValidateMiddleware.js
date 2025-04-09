import { z } from "zod";

// ✅ Schema + middleware in one
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  role: z.enum(["user", "venue_owner"], {
    errorMap: () => ({ message: "Role must be 'user' or 'venue_owner'" })
  })
});

// ✅ Middleware function
export const validateRegister = (req, res, next) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      issues: result.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message
      }))
    });
  }

  next();
};
