/**
 * Security validation utilities
 * DO NOT modify these without security review
 */

const MAX_INPUT_LENGTH = 10000;
const MAX_FILENAME_LENGTH = 255;

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // XSS prevention
    .replace(/[\x00-\x1F\x7F]/g, '') // Control characters
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
}

export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function validateDorkQuery(query: string): { valid: boolean; error?: string } {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }

  if (query.length > 1000) {
    return { valid: false, error: 'Query too long (max 1000 characters)' };
  }

  // Check for potential XSS
  if (/<script|javascript:|onerror=/i.test(query)) {
    return { valid: false, error: 'Invalid characters detected' };
  }

  return { valid: true };
}

export function validateLicenseKey(key: string): { valid: boolean; error?: string } {
  const pattern = /^PRLX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

  if (!pattern.test(key)) {
    return { valid: false, error: 'Invalid license key format. Expected: PRLX-XXXX-XXXX-XXXX-XXXX' };
  }

  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!pattern.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email too long' };
  }

  return { valid: true };
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs allowed' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL' };
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, MAX_FILENAME_LENGTH);
}

export function validateFileUpload(
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  if (file.size > 50 * 1024 * 1024) { // 50MB
    return { valid: false, error: 'File too large (max 50MB)' };
  }

  return { valid: true };
}

export function validateApiKey(key: string): { valid: boolean; error?: string } {
  if (!key || key.trim().length === 0) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  if (key.length < 20) {
    return { valid: false, error: 'API key too short' };
  }

  if (key.length > 500) {
    return { valid: false, error: 'API key too long' };
  }

  return { valid: true };
}
