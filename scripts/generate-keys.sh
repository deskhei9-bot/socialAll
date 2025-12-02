#!/bin/bash
# =====================================================
# Generate JWT Keys for Self-Hosted Supabase
# =====================================================
# Usage: ./scripts/generate-keys.sh
# =====================================================

echo "🔐 Generating Supabase JWT Keys..."
echo ""

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"
echo ""

# Generate Encryption Key
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""

# Generate Postgres Password
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '+/=' | head -c 32)
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo ""

# Create JWT tokens using Node.js if available
if command -v node &> /dev/null; then
    echo "📦 Generating JWT tokens with Node.js..."
    
    node << EOF
const crypto = require('crypto');

const jwtSecret = '$JWT_SECRET';

function base64url(source) {
    let encodedSource = Buffer.from(source).toString('base64');
    encodedSource = encodedSource.replace(/=+\$/, '');
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    return encodedSource;
}

function createJWT(payload, secret) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerEncoded = base64url(JSON.stringify(header));
    const payloadEncoded = base64url(JSON.stringify(payload));
    const signature = crypto
        .createHmac('sha256', secret)
        .update(headerEncoded + '.' + payloadEncoded)
        .digest('base64')
        .replace(/=+\$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return headerEncoded + '.' + payloadEncoded + '.' + signature;
}

const now = Math.floor(Date.now() / 1000);
const exp = now + (10 * 365 * 24 * 60 * 60); // 10 years

const anonPayload = {
    role: 'anon',
    iss: 'supabase',
    iat: now,
    exp: exp
};

const servicePayload = {
    role: 'service_role',
    iss: 'supabase',
    iat: now,
    exp: exp
};

console.log('ANON_KEY=' + createJWT(anonPayload, jwtSecret));
console.log('');
console.log('SERVICE_ROLE_KEY=' + createJWT(servicePayload, jwtSecret));
EOF

else
    echo "⚠️  Node.js not found. Please generate ANON_KEY and SERVICE_ROLE_KEY manually."
    echo "   Visit: https://supabase.com/docs/guides/self-hosting#api-keys"
fi

echo ""
echo "✅ Done! Copy these values to your .env file."
echo ""
echo "📝 Quick setup:"
echo "   cp .env.complete.example .env"
echo "   # Then paste the values above into .env"
echo ""
