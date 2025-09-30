#!/bin/bash
# Quick setup script for Google Cloud VM deployment
# Run this after cloning the repository to /opt/dental-erp

set -e

echo "🚀 Setting up Dental ERP on VM..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p /opt/dental-erp/backups
mkdir -p /opt/dental-erp/logs/backend
mkdir -p /opt/dental-erp/logs/nginx

# Generate secure secrets
echo "🔐 Generating secure secrets..."
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')

# Get VM's external IP (if on GCP)
EXTERNAL_IP=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip 2>/dev/null || echo "YOUR_IP_OR_DOMAIN")

# Create .env.production file
echo "📝 Creating .env.production file..."
cat > /opt/dental-erp/.env.production <<EOF
# Database Configuration
POSTGRES_DB=dental_erp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@dental-erp-postgres:5432/dental_erp

# Redis Configuration
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://:${REDIS_PASSWORD}@dental-erp-redis:6379

# JWT Secrets (Keep these secure!)
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}

# Application Configuration
NODE_ENV=production
FRONTEND_URL=http://${EXTERNAL_IP}
VITE_API_BASE_URL=/api

# Feature Flags
MOCK_INTEGRATIONS=true
ENABLE_AUDIT_LOGGING=true

# Optional: Monitoring (add your keys)
SENTRY_DSN=

# Optional: Email notifications
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@yourdomain.com
EOF

echo "✅ .env.production created!"
echo ""
echo "⚠️  IMPORTANT: Save these credentials securely!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Database Password: ${POSTGRES_PASSWORD}"
echo "Redis Password: ${REDIS_PASSWORD}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your application will be accessible at: http://${EXTERNAL_IP}"
echo ""
echo "📋 Next steps:"
echo "1. Update FRONTEND_URL in .env.production with your domain (if you have one)"
echo "2. Run: docker-compose -f docker-compose.prod.yml up -d"
echo "3. Set up SSL: sudo certbot --nginx -d yourdomain.com"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To restart: docker-compose -f docker-compose.prod.yml restart"
echo ""
