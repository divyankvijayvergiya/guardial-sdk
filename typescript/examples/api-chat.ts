/**
 * Example API route: Chat endpoint with LLM prompt protection
 * 
 * Place this in: src/routes/api/chat/+server.ts
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GuardialClient } from '@guardial/sveltekit-sdk';

const guardial = new GuardialClient({
  apiKey: process.env.GUARDIAL_API_KEY!,
  customerId: 'your-app-name'
});

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();

  if (!message || typeof message !== 'string') {
    throw error(400, { message: 'Message is required' });
  }

  // Analyze LLM prompt for injection attacks
  const analysis = await guardial.promptGuard(message, {
    user_id: request.headers.get('x-user-id') || 'anonymous',
    model: 'gpt-4'
  });

  if (!analysis.allowed) {
    console.warn('LLM prompt blocked:', {
      reasons: analysis.reasons,
      detections: analysis.detections
    });

    throw error(403, {
      message: 'Prompt blocked by security policy',
      details: {
        reasons: analysis.reasons,
        detections: analysis.detections.map(d => ({
          title: d.title,
          severity: d.severity
        }))
      }
    });
  }

  // Safe to send to LLM
  // const llmResponse = await callYourLLM(message);
  
  return json({
    response: 'This is a simulated LLM response',
    analysis: {
      allowed: analysis.allowed,
      processingTime: analysis.processingTime
    }
  });
};



