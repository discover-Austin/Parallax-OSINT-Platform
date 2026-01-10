import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from './tauri';

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini AI with API key from secure storage
 */
export async function initializeGemini(): Promise<void> {
  try {
    const apiKey = await getGeminiApiKey();
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    throw new Error('Gemini AI not configured. Please add your API key in settings.');
  }
}

/**
 * Ensure Gemini is initialized before use
 */
async function ensureInitialized(): Promise<GoogleGenerativeAI> {
  if (!genAI) {
    await initializeGemini();
  }
  if (!genAI) {
    throw new Error('Failed to initialize Gemini AI');
  }
  return genAI;
}

export interface DorkGenerationRequest {
  description: string;
  searchEngine?: 'google' | 'bing' | 'duckduckgo';
  category?: string;
  advanced?: boolean;
}

export interface DorkGenerationResult {
  query: string;
  explanation: string;
  category: string;
  tags: string[];
  alternatives?: string[];
}

/**
 * Generate a search dork based on natural language description
 */
export async function generateDork(
  request: DorkGenerationRequest
): Promise<DorkGenerationResult> {
  const ai = await ensureInitialized();
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = buildDorkGenerationPrompt(request);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const parsed = parseGeminiResponse(text);

    return {
      query: parsed.query || '',
      explanation: parsed.explanation || '',
      category: parsed.category || request.category || 'General',
      tags: parsed.tags || [],
      alternatives: parsed.alternatives,
    };
  } catch (error) {
    console.error('Dork generation failed:', error);
    throw new Error(
      `Failed to generate dork: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Build prompt for dork generation
 */
function buildDorkGenerationPrompt(request: DorkGenerationRequest): string {
  const { description, searchEngine = 'google', category, advanced } = request;

  return `You are an expert in creating search engine dorks (advanced search queries) for OSINT and security research.

User Request: "${description}"
Search Engine: ${searchEngine}
Category: ${category || 'General'}
Advanced Mode: ${advanced ? 'Yes' : 'No'}

Generate a search dork query that accomplishes the user's goal. Return ONLY a JSON object with this structure:

{
  "query": "the actual search dork query",
  "explanation": "brief explanation of what this dork finds and how it works",
  "category": "appropriate category (e.g., Files, Login Pages, Vulnerable Sites, Exposed Data, etc.)",
  "tags": ["relevant", "tags", "for", "categorization"],
  "alternatives": ["alternative query 1", "alternative query 2"]
}

Important guidelines:
- For Google, use operators like: site:, filetype:, inurl:, intitle:, intext:, ext:, cache:
- For Bing, use similar operators with some variations
- Focus on ethical OSINT and authorized security testing
- Make queries specific and effective
- Provide 2-3 alternative queries with different approaches
- Keep explanations concise but informative

Return ONLY the JSON object, no additional text.`;
}

/**
 * Parse Gemini response and extract JSON
 */
function parseGeminiResponse(text: string): Partial<DorkGenerationResult> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, try parsing the whole text
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    // Return a fallback structure
    return {
      query: text,
      explanation: 'Failed to parse structured response',
      category: 'General',
      tags: [],
    };
  }
}

/**
 * Analyze an image for OSINT intelligence
 */
export async function analyzeImage(
  imageData: string,
  analysisType: 'metadata' | 'content' | 'full' = 'full'
): Promise<{
  findings: string;
  metadata?: Record<string, unknown>;
  locations?: string[];
  people?: string[];
  objects?: string[];
}> {
  const ai = await ensureInitialized();
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analyze this image for OSINT intelligence gathering. Focus on:

${analysisType === 'metadata' || analysisType === 'full' ? '- Visible metadata, timestamps, locations' : ''}
${analysisType === 'content' || analysisType === 'full' ? '- Important objects, text, signs, landmarks' : ''}
${analysisType === 'full' ? '- Any identifying information that could be useful for investigation' : ''}

Provide a structured analysis in JSON format:
{
  "findings": "detailed description of what you found",
  "locations": ["possible location 1", "possible location 2"],
  "objects": ["notable object 1", "notable object 2"],
  "text": "any visible text in the image",
  "recommendations": "suggestions for further investigation"
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/... prefix
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const text = result.response.text();
    const parsed = parseGeminiResponse(text);

    return {
      findings: parsed.findings || text,
      locations: parsed.locations,
      objects: parsed.objects,
    };
  } catch (error) {
    console.error('Image analysis failed:', error);
    throw new Error(
      `Failed to analyze image: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Enhance a basic dork with advanced operators
 */
export async function enhanceDork(
  basicQuery: string,
  goal: string
): Promise<string[]> {
  const ai = await ensureInitialized();
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Given this basic search query: "${basicQuery}"
Goal: "${goal}"

Enhance it with advanced Google dork operators to make it more effective. Provide 3-5 enhanced variations.

Return as JSON array:
["enhanced query 1", "enhanced query 2", "enhanced query 3"]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Try to parse as JSON array
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: split by newlines
    return text
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(0, 5);
  } catch (error) {
    console.error('Dork enhancement failed:', error);
    return [basicQuery]; // Return original if enhancement fails
  }
}

/**
 * Get dork suggestions for a specific category
 */
export async function getDorkSuggestions(
  category: string
): Promise<Array<{ query: string; description: string }>> {
  const ai = await ensureInitialized();
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Generate 5 useful Google dork queries for the "${category}" category.
Focus on ethical OSINT and authorized security testing.

Return as JSON array:
[
  {"query": "dork query 1", "description": "what it finds"},
  {"query": "dork query 2", "description": "what it finds"},
  ...
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error('Suggestion generation failed:', error);
    return [];
  }
}

/**
 * Rate limiter for AI requests (client-side)
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    this.requests.push(now);
  }
}

export const aiRateLimiter = new RateLimiter();
