/**
 * Example app.d.ts for SvelteKit type definitions
 * 
 * Copy this to your src/app.d.ts
 */

import type { SecurityEventResponse } from '@guardial/sveltekit-sdk';

declare global {
  namespace App {
    interface Locals {
      guardial?: {
        analysis: SecurityEventResponse;
        riskScore: number;
        eventId: string;
      };
    }
  }
}

export {};



