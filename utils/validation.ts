// utils/validation.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.union([z.literal("admin"), z.literal("citizen")]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Use enums without spaces to match earlier decision
export const createIssueSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(6),
  type: z.string().min(2),
  area: z.string().min(1),
  image: z
    .string()
    .transform((val) => val?.trim?.() || undefined)
    .optional()
    .refine((val) => !val || /^https?:\/\//i.test(val), { message: "Invalid image URL" }),
  address: z
    .string()
    .transform((val) => val?.trim?.() || undefined)
    .optional()
    .refine((val) => !val || val.length >= 2, { message: "Address must be at least 2 characters" }),
});

export const updateIssueSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(6).optional(),
  type: z.string().min(2).optional(),
  area: z.string().min(1).optional(),
  image: z
    .string()
    .transform((val) => val?.trim?.() || undefined)
    .optional()
    .refine((val) => !val || /^https?:\/\//i.test(val), { message: "Invalid image URL" }),
  address: z
    .string()
    .transform((val) => val?.trim?.() || undefined)
    .optional()
    .refine((val) => !val || val.length >= 2, { message: "Address must be at least 2 characters" }),
  // status must match enum: "Pending" | "InProgress" | "Completed"
  status: z.union([z.literal("Pending"), z.literal("InProgress"), z.literal("Completed")]).optional(),
});
