import { z } from 'zod';

// Input validation schemas
export const UrlSchema = z.string().url().max(2048);

export const PolicyContentSchema = z.object({
  content: z.string().max(1000000), // 1MB limit
  title: z.string().max(500),
  url: z.string().url(),
  extractedAt: z.string().datetime(),
  contentHash: z.string().max(64)
});

export const AnalysisRequestSchema = z.object({
  url: UrlSchema,
  action: z.literal('analyzePage'),
  timestamp: z.number().optional()
});

export const StorageDataSchema = z.object({
  analysisResults: z.record(z.string(), z.any()).optional(),
  userPreferences: z.object({
    consentGiven: z.boolean(),
    dataRetentionDays: z.number().min(1).max(365),
    analyticsEnabled: z.boolean()
  }).optional(),
  encryptionKey: z.string().optional()
});

// Security validation functions
export function validateUrl(url: string): string {
  const result = UrlSchema.safeParse(url);
  if (!result.success) {
    throw new Error(`Invalid URL: ${result.error.message}`);
  }
  return result.data;
}

export function validatePolicyContent(content: unknown): PolicyContentSchema {
  const result = PolicyContentSchema.safeParse(content);
  if (!result.success) {
    throw new Error(`Invalid policy content: ${result.error.message}`);
  }
  return result.data;
}

export function sanitizeText(text: string): string {
  // Remove potentially dangerous characters and limit length
  return text
    .replace(/[<>\"'&]/g, '') // Remove HTML/script chars
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .slice(0, 10000); // Limit length
}

export type ValidatedUrl = z.infer<typeof UrlSchema>;
export type ValidatedPolicyContent = z.infer<typeof PolicyContentSchema>;
export type ValidatedAnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type ValidatedStorageData = z.infer<typeof StorageDataSchema>;