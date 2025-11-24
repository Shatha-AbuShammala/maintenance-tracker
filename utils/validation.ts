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
  image: z.string().url().optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(6).optional(),
  type: z.string().min(2).optional(),
  area: z.string().min(1).optional(),
  image: z.string().url().nullable().optional(),
  // status must match enum: "Pending" | "InProgress" | "Completed"
  status: z.union([z.literal("Pending"), z.literal("InProgress"), z.literal("Completed")]).optional(),
});
