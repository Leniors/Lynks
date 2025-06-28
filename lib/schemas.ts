// lib/schemas.ts
import { z } from "zod";

export const AddLinkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().optional(),
  color: z.string().optional(),
});
