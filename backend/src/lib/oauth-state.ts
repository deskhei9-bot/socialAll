import crypto from 'crypto';

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function getStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('OAUTH_STATE_SECRET or JWT_SECRET must be configured');
    }
    return 'dev-insecure-secret';
  }
  return secret;
}

export interface OAuthStatePayload {
  userId: string;
  [key: string]: any;
}

export function createOAuthState(payload: OAuthStatePayload, ttlMs = DEFAULT_TTL_MS): string {
  const now = Date.now();
  const statePayload = {
    ...payload,
    iat: now,
    exp: now + ttlMs,
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const body = base64UrlEncode(JSON.stringify(statePayload));
  const signature = crypto
    .createHmac('sha256', getStateSecret())
    .update(body)
    .digest('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${body}.${signature}`;
}

export function verifyOAuthState(state: string): OAuthStatePayload {
  const parts = state.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid OAuth state format');
  }

  const [body, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getStateSecret())
    .update(body)
    .digest('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    throw new Error('Invalid OAuth state signature');
  }

  const payload = JSON.parse(base64UrlDecode(body));
  if (!payload.exp || Date.now() > payload.exp) {
    throw new Error('OAuth state expired');
  }

  return payload as OAuthStatePayload;
}
