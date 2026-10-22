/**
 * ScholarAssist Academic & AI Response Service
 * 
 * Provides safe parsing patterns for Gemini AI text and JSON outputs.
 * Protects against markdown fencing, leading/trailing conversational text,
 * and JSON parse exceptions.
 */

export interface SafeParseResult<T = any> {
  success: boolean;
  data: T | null;
  rawText: string;
  error?: string;
}

/**
 * Safely parses JSON from Gemini responses using the robust extraction pattern:
 * - Strips ```json and ``` code blocks
 * - Finds first { and last } to isolate valid JSON payload
 * - Catches JSON parse errors cleanly without crashing
 */
export function safeJsonParse<T = any>(response: string | { text?: string } | any): T | null {
  if (!response) return null;

  let text = (typeof response === 'string' ? response : (response.text || ''))
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  // Find the first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1);
  } else {
    // Also handle array payloads if applicable
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      text = text.substring(firstBracket, lastBracket + 1);
    }
  }

  try {
    const data = JSON.parse(text);
    return data as T;
  } catch (e) {
    console.log("AI returned text, not JSON:", text);
    // Show friendly message instead of crashing
    return null;
  }
}

/**
 * Wrapper for API fetch requests with safe JSON parsing and fallback handling
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: RequestInit,
  fallbackErrorMessage: string = 'Failed to process academic response'
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, options);
    const raw = await res.text();
    
    // Safely parse JSON from server/AI
    const parsed = safeJsonParse<T>(raw);
    if (!parsed) {
      return {
        ok: false,
        error: `${fallbackErrorMessage}: Received unstructured response from AI.`,
      };
    }

    if (!res.ok) {
      const errObj = parsed as any;
      return {
        ok: false,
        error: errObj.error || errObj.message || fallbackErrorMessage,
      };
    }

    return { ok: true, data: parsed };
  } catch (err: any) {
    console.error(`Fetch error in ${url}:`, err);
    return { ok: false, error: err.message || fallbackErrorMessage };
  }
}
