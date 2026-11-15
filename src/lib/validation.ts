import { z } from "zod";

/* Shared validation — used by client forms AND server actions */

export const clientSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  internalNotes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const projectSchema = z.object({
  clientId: z.string().min(1, "Select a client."),
  name: z.string().trim().min(2, "Project name is required.").max(160),
  reference: z.string().trim().max(60).optional().or(z.literal("")),
  type: z.enum(["residential", "commercial", "interior_design", "renovation", "other"]),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]),
  coverImage: z.string().trim().max(300).optional().or(z.literal("")),
});

export const documentMetaSchema = z.object({
  projectId: z.string().min(1, "Select a project."),
  name: z.string().trim().min(3, "Document name must be at least 3 characters.").max(200),
  category: z.enum(["architectural", "structural", "electrical", "plumbing", "3d-render", "other"]),
  revision: z.string().trim().min(1).max(30),
  accessMode: z.enum(["RESTRICTED_PREVIEW", "FULL_ACCESS"]),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service: z.string().trim().min(1, "Choose a service.").max(80),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  brief: z.string().trim().min(20, "Tell us a little more — at least 20 characters.").max(4000),
  preferredContact: z.enum(["email", "phone", "either"]).optional(),
  // honeypot — invisible to humans, filled by bots
  website: z.string().max(0).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(200),
  password: z.string().min(1, "Enter your password.").max(200),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z
    .string()
    .min(12, "Use at least 12 characters.")
    .max(200)
    .regex(/[a-z]/, "Include a lowercase letter.")
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/[0-9]/, "Include a number."),
});

export const linkExpirySchema = z.enum(["never", "7", "30", "90"]);
export type LinkExpiryInput = z.infer<typeof linkExpirySchema>;
