# Docker Secrets Management

This guide covers secure credential management for production deployments using Docker secrets.

## Overview

Docker secrets provide a secure way to store and manage sensitive data like passwords, API keys, and tokens. Secrets are:
- Encrypted at rest and in transit
- Only accessible to services that need them
- Never stored in container images or source code

## Quick Start

```bash
# 1. Initialize Docker Swarm (if not already done)
docker swarm init

# 2. Create your .env file with all secrets
cp .env.complete.example .env
# Edit .env with your actual values

# 3. Initialize Docker secrets
chmod +x scripts/secrets-*.sh
./scripts/secrets-init.sh

# 4. Deploy with secrets
docker stack deploy -c docker-compose.secrets.yml social-publisher
```

## Available Scripts

### `scripts/secrets-init.sh`
Creates Docker secrets from your .env file.

```bash
./scripts/secrets-init.sh
```

### `scripts/secrets-list.sh`
Lists all configured secrets with metadata.

```bash
./scripts/secrets-list.sh
```

### `scripts/secrets-rotate.sh`
Rotates a specific secret with zero downtime.

```bash
# Interactive (will prompt for new value)
./scripts/secrets-rotate.sh encryption_key

# With new value
./scripts/secrets-rotate.sh postgres_password 'new-secure-password'
```

### `scripts/secrets-export.sh`
Exports secrets metadata for backup (encrypted with GPG).

```bash
./scripts/secrets-export.sh
```

## Secret Categories

### Database Secrets
| Secret Name | Description |
|-------------|-------------|
| `postgres_password` | PostgreSQL superuser password |
| `db_connection_string` | Full database connection URL |

### Supabase Secrets
| Secret Name | Description |
|-------------|-------------|
| `supabase_url` | Supabase API URL |
| `supabase_anon_key` | Public/anonymous key |
| `supabase_service_role_key` | Admin service role key |

### JWT/Auth Secrets
| Secret Name | Description |
|-------------|-------------|
| `jwt_secret` | JWT signing secret |
| `anon_key` | Anonymous access key |
| `service_role_key` | Service role key |

### OAuth Provider Secrets
| Secret Name | Description |
|-------------|-------------|
| `facebook_app_id` | Facebook App ID |
| `facebook_app_secret` | Facebook App Secret |
| `google_client_id` | Google OAuth Client ID |
| `google_client_secret` | Google OAuth Client Secret |
| `tiktok_client_key` | TikTok Client Key |
| `tiktok_client_secret` | TikTok Client Secret |

### Encryption Secrets
| Secret Name | Description |
|-------------|-------------|
| `encryption_key` | 32-byte key for token encryption |

### AI Service Secrets
| Secret Name | Description |
|-------------|-------------|
| `openai_api_key` | OpenAI API key |
| `gemini_api_key` | Google Gemini API key |

## Using Secrets in Services

### Docker Compose (Swarm Mode)

```yaml
services:
  backend:
    environment:
      - SUPABASE_URL_FILE=/run/secrets/supabase_url
    secrets:
      - supabase_url

secrets:
  supabase_url:
    external: true
```

### In Application Code

```typescript
import { getSecret } from './lib/secrets';

// Automatically reads from Docker secret file or env var
const supabaseUrl = getSecret('SUPABASE_URL', true);
```

## Best Practices

### 1. Never Commit Secrets
- Add `.env` and secrets files to `.gitignore`
- Use `.env.example` files with placeholder values

### 2. Rotate Regularly
- Rotate secrets every 90 days
- Immediately rotate if compromised
- Use the rotation script for zero-downtime updates

### 3. Principle of Least Privilege
- Only mount secrets that a service needs
- Use separate secrets for different environments

### 4. Backup Securely
- Store secret values in a secure vault (HashiCorp Vault, AWS Secrets Manager)
- Never store unencrypted backups

### 5. Audit Access
- Monitor secret access in logs
- Review which services have access to which secrets

## Troubleshooting

### Secret not found
```bash
# Check if secret exists
docker secret ls | grep <secret_name>

# Verify service has access
docker service inspect <service_name> --format '{{json .Spec.TaskTemplate.ContainerSpec.Secrets}}'
```

### Permission denied
```bash
# Secrets are mounted as files owned by root
# Your app needs to run as root or have appropriate permissions
```

### Secret value incorrect
```bash
# Remove and recreate the secret
docker secret rm <secret_name>
echo -n "new_value" | docker secret create <secret_name> -
```

## Migration from Environment Variables

If you're migrating from plain environment variables:

1. Run `secrets-init.sh` to create secrets from your .env
2. Update docker-compose to use `docker-compose.secrets.yml`
3. Deploy using `docker stack deploy`
4. Remove .env file from production servers

## Security Considerations

- Secrets are only available in Swarm mode
- Secrets are stored in the Raft log (encrypted)
- Secrets are decrypted only in memory within the container
- Secrets are mounted as tmpfs (never written to disk in container)
