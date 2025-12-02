import { readFileSync, existsSync } from 'fs';

/**
 * Docker Secrets Helper
 * Reads secrets from Docker secret files or falls back to environment variables
 */

/**
 * Get a secret value from Docker secrets file or environment variable
 * @param name - The name of the secret/environment variable
 * @param required - Whether the secret is required (throws if missing)
 * @returns The secret value or undefined
 */
export function getSecret(name: string, required = false): string | undefined {
  // First, check if there's a _FILE environment variable pointing to a secret
  const fileEnvVar = `${name}_FILE`;
  const secretFilePath = process.env[fileEnvVar];

  if (secretFilePath && existsSync(secretFilePath)) {
    try {
      const value = readFileSync(secretFilePath, 'utf8').trim();
      return value;
    } catch (error) {
      console.error(`Failed to read secret from file: ${secretFilePath}`, error);
    }
  }

  // Fall back to direct environment variable
  const value = process.env[name];

  if (required && !value) {
    throw new Error(`Required secret '${name}' is not configured`);
  }

  return value;
}

/**
 * Get all secrets needed for the application
 * @returns Object containing all secret values
 */
export function loadSecrets() {
  return {
    // Supabase
    supabaseUrl: getSecret('SUPABASE_URL', true),
    supabaseAnonKey: getSecret('SUPABASE_ANON_KEY', true),
    supabaseServiceRoleKey: getSecret('SUPABASE_SERVICE_ROLE_KEY', true),

    // Encryption
    encryptionKey: getSecret('ENCRYPTION_KEY', true),

    // OAuth - Facebook
    facebookAppId: getSecret('FACEBOOK_APP_ID'),
    facebookAppSecret: getSecret('FACEBOOK_APP_SECRET'),

    // OAuth - Google/YouTube
    googleClientId: getSecret('GOOGLE_CLIENT_ID'),
    googleClientSecret: getSecret('GOOGLE_CLIENT_SECRET'),

    // OAuth - TikTok
    tiktokClientKey: getSecret('TIKTOK_CLIENT_KEY'),
    tiktokClientSecret: getSecret('TIKTOK_CLIENT_SECRET'),

    // AI Services
    openaiApiKey: getSecret('OPENAI_API_KEY'),
    geminiApiKey: getSecret('GEMINI_API_KEY'),

    // JWT
    jwtSecret: getSecret('JWT_SECRET'),

    // Database
    postgresPassword: getSecret('POSTGRES_PASSWORD'),
    dbConnectionString: getSecret('DB_CONNECTION_STRING'),
  };
}

/**
 * Validate that all required secrets are present
 * Call this at application startup
 */
export function validateSecrets(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ENCRYPTION_KEY',
  ];

  const missing: string[] = [];

  for (const name of required) {
    if (!getSecret(name)) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required secrets: ${missing.join(', ')}\n` +
      'Please configure these using Docker secrets or environment variables.'
    );
  }

  console.log('✅ All required secrets validated');
}

export default { getSecret, loadSecrets, validateSecrets };
