/**
 * Zod integration for Guardial SDK
 * 
 * Provides type-safe validation with Guardial security checks
 */

import { z } from 'zod';
import { GuardialClient } from './index';

/**
 * Options for Guardial-safe Zod parsing
 */
export interface GuardialSafeOptions {
  /** Guardial client instance */
  guardial: GuardialClient;
  /** Whether to check strings for prompt injection */
  checkPrompts?: boolean;
  /** Custom prompt check function */
  shouldCheckPrompt?: (value: unknown) => boolean;
}

/**
 * Create a Guardial-safe Zod parser
 * Validates with Zod first, then checks with Guardial if applicable
 */
export function guardialSafe<T extends z.ZodTypeAny>(
  schema: T,
  options: GuardialSafeOptions
) {
  const { guardial, checkPrompts = true, shouldCheckPrompt } = options;

  const parseFn = async (data: unknown): Promise<z.infer<T>> => {
    // First validate with Zod
    const validated = schema.parse(data);

    // Check if we should validate prompts
    if (checkPrompts) {
      const shouldCheck = shouldCheckPrompt 
        ? shouldCheckPrompt(validated)
        : typeof validated === 'string';

      if (shouldCheck && typeof validated === 'string') {
        const analysis = await guardial.promptGuard(validated);
        
        if (!analysis.allowed) {
          throw new z.ZodError([
            {
              code: 'custom',
              path: [],
              message: `Validation failed: ${analysis.reasons.join(', ')}`
            }
          ]);
        }
      }
    }

    return validated;
  };

  return {
    /**
     * Parse and validate data with Zod, then check with Guardial
     */
    parse: parseFn,

    /**
     * Safe parse that returns a result object
     */
    safeParse: async (
      data: unknown
    ): Promise<
      | { success: true; data: z.infer<T> }
      | { success: false; error: z.ZodError | Error }
    > => {
      try {
        const result = await parseFn(data);
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return { success: false, error };
        }
        return { success: false, error: error as Error };
      }
    }
  };
}

/**
 * Note: Zod's refine/superRefine don't support async validation directly
 * Use guardialSafe() for async prompt validation with Guardial
 */

