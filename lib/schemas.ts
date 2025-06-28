// lib/schemas.ts
import { z } from "zod";

export const AddLinkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().optional(),
  clicks: z.number().optional(), // ✅ add this
});

