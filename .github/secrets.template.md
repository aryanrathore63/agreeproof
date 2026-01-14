# GitHub Secrets Configuration Template

This document contains all the secrets that need to be configured in GitHub repository settings for the AgreeProof project.

## How to Configure Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret** for each secret listed below
4. Copy the name and value exactly as shown

## Required Secrets

### 🚀 Deployment Secrets

#### Frontend Deployment (Vercel)
```
Name: VERCEL_TOKEN
Value: your-vercel-api-token
Description: Vercel API token for frontend deployment
```

```
Name: VERCEL_PROJECT_URL
Value: your-vercel-project-url.vercel.app
Description: Production Vercel project URL
```

```
Name: VERCEL_ORG_ID
Value: your-vercel-org-id
Description: Vercel organization ID
```

```
Name: VERCEL_PROJECT_ID
Value: your-vercel-project-id
Description: Vercel project ID
```

#### Backend Deployment (Render)
```
Name: RENDER_API_KEY
Value: your-render-api-key
Description: Render API key for backend deployment
```

```
Name: RENDER_PRODUCTION_SERVICE_ID
Value: your-render-production-service-id
Description: Render production service ID
```

```
Name: RENDER_PRODUCTION_URL
Value: your-app.onrender.com
Description: Production Render application URL
```

```
Name: RENDER_STAGING_SERVICE_ID
Value: your-render-staging-service-id
Description: Render staging service ID
```

```
Name: RENDER_STAGING_URL
Value: your-staging-app.onrender.com
Description: Staging Render application URL
```

```
Name: RENDER_ROLLBACK_HOOK
Value: your-render-rollback-webhook-url
Description: Render rollback webhook URL
```

### 🐳 Docker Registry Secrets

```
Name: DOCKER_USERNAME
Value: your-dockerhub-username
Description: Docker Hub username for container registry
```

```
Name: DOCKER_PASSWORD
Value: your-dockerhub-password-or-token
Description: Docker Hub password or access token
```

### 🗄️ Database Secrets

```
Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/agreeproof_production
Description: MongoDB Atlas connection string for production
```

```
Name: MONGODB_STAGING_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/agreeproof_staging
Description: MongoDB Atlas connection string for staging
```

### 🔐 Authentication & Security

```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-for-production
Description: JWT secret token for authentication
```

```
Name: JWT_REFRESH_SECRET
Value: your-refresh-token-secret-for-production
Description: JWT refresh token secret
```

### 📧 Email Service Secrets

#### SendGrid
```
Name: SENDGRID_API_KEY
Value: SG.your-sendgrid-api-key
Description: SendGrid API key for email services
```

```
Name: SENDGRID_FROM_EMAIL
Value: noreply@agreeproof.com
Description: Default sender email address
```

#### SMTP (Alternative)
```
Name: SMTP_HOST
Value: smtp.gmail.com
Description: SMTP server host
```

```
Name: SMTP_PORT
Value: 587
Description: SMTP server port
```

```
Name: SMTP_USER
Value: your-email@gmail.com
Description: SMTP username
```

```
Name: SMTP_PASS
Value: your-app-password
Description: SMTP password
```

### ☁️ Cloud Storage Secrets

#### AWS S3
```
Name: AWS_ACCESS_KEY_ID
Value: your-aws-access-key-id
Description: AWS access key for S3 storage
```

```
Name: AWS_SECRET_ACCESS_KEY
Value: your-aws-secret-access-key
Description: AWS secret access key for S3 storage
```

```
Name: AWS_DEFAULT_REGION
Value: us-east-1
Description: AWS default region
```

```
Name: AWS_S3_BUCKET
Value: agreeproof-documents
Description: S3 bucket name for document storage
```

```
Name: AWS_S3_BACKUP_BUCKET
Value: agreeproof-backups
Description: S3 bucket name for backups
```

### 📊 Monitoring & Analytics

#### Sentry
```
Name: SENTRY_AUTH_TOKEN
Value: your-sentry-auth-token
Description: Sentry authentication token
```

```
Name: SENTRY_DSN
Value: https://your-sentry-dsn@sentry.io/project-id
Description: Sentry DSN for error tracking
```

#### DataDog
```
Name: DATADOG_API_KEY
Value: your-datadog-api-key
Description: DataDog API key for monitoring
```

```
Name: DATADOG_APP_KEY
Value: your-datadog-app-key
Description: DataDog application key
```

#### New Relic
```
Name: NEW_RELIC_LICENSE_KEY
Value: your-newrelic-license-key
Description: New Relic license key for APM
```

### 🔍 Security & Code Quality

#### Snyk
```
Name: SNYK_TOKEN
Value: your-snyk-token
Description: Snyk token for security scanning
```

#### CodeQL
```
Name: CODEQL_PAT
Value: github_pat_your-personal-access-token
Description: Personal access token for CodeQL analysis
```

### 🎯 Performance Testing

#### Lighthouse CI
```
Name: LHCI_GITHUB_APP_TOKEN
Value: v1.your-lhci-github-app-token
Description: Lighthouse CI GitHub App token
```

```
Name: LHCI_SERVER_URL
Value: https://lhci.herokuapp.com
Description: Lighthouse CI server URL
```

### 💬 Notifications

#### Slack
```
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
Description: Slack webhook URL for deployment notifications
```

#### Discord (Alternative)
```
Name: DISCORD_WEBHOOK_URL
Value: https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
Description: Discord webhook URL for notifications
```

### 💳 Payment Processing

#### Stripe
```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_your-stripe-publishable-key
Description: Stripe publishable key for payments
```

```
Name: STRIPE_SECRET_KEY
Value: sk_live_your-stripe-secret-key
Description: Stripe secret key for payments
```

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_your-stripe-webhook-secret
Description: Stripe webhook secret for payment events
```

#### PayPal
```
Name: PAYPAL_CLIENT_ID
Value: your-paypal-live-client-id
Description: PayPal client ID for payments
```

```
Name: PAYPAL_CLIENT_SECRET
Value: your-paypal-live-client-secret
Description: PayPal client secret for payments
```

### 📱 SMS & Communication

#### Twilio
```
Name: TWILIO_ACCOUNT_SID
Value: your-twilio-account-sid
Description: Twilio account SID for SMS services
```

```
Name: TWILIO_AUTH_TOKEN
Value: your-twilio-auth-token
Description: Twilio authentication token
```

```
Name: TWILIO_PHONE_NUMBER
Value: +1234567890
Description: Twilio phone number for SMS
```

### 🔗 Social Login

#### Google
```
Name: GOOGLE_CLIENT_ID
Value: your-google-client-id
Description: Google OAuth client ID
```

```
Name: GOOGLE_CLIENT_SECRET
Value: your-google-client-secret
Description: Google OAuth client secret
```

#### Facebook/Meta
```
Name: FACEBOOK_APP_ID
Value: your-facebook-app-id
Description: Facebook app ID for social login
```

```
Name: FACEBOOK_APP_SECRET
Value: your-facebook-app-secret
Description: Facebook app secret for social login
```

#### LinkedIn
```
Name: LINKEDIN_CLIENT_ID
Value: your-linkedin-client-id
Description: LinkedIn client ID for social login
```

```
Name: LINKEDIN_CLIENT_SECRET
Value: your-linkedin-client-secret
Description: LinkedIn client secret for social login
```

### 🗃️ Cache & Session Storage

#### Redis
```
Name: REDIS_URL
Value: redis://username:password@your-redis-host:6379
Description: Redis connection URL for caching
```

```
Name: REDIS_PASSWORD
Value: your-redis-password
Description: Redis password if required
```

### 📈 Analytics

#### Google Analytics
```
Name: GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX
Description: Google Analytics 4 measurement ID
```

```
Name: GA_API_SECRET
Value: your-ga-api-secret
Description: Google Analytics API secret
```

#### Mixpanel
```
Name: MIXPANEL_TOKEN
Value: your-mixpanel-token
Description: Mixpanel token for analytics
```

### 🛡️ Additional Security

#### Cloudflare
```
Name: CLOUDFLARE_API_TOKEN
Value: your-cloudflare-api-token
Description: Cloudflare API token for DNS management
```

```
Name: CLOUDFLARE_ZONE_ID
Value: your-cloudflare-zone-id
Description: Cloudflare zone ID for domain
```

#### SSL Certificates
```
Name: SSL_CERT_PATH
Value: /path/to/ssl/certificate.crt
Description: Path to SSL certificate file
```

```
Name: SSL_KEY_PATH
Value: /path/to/ssl/private.key
Description: Path to SSL private key file
```

## Environment-Specific Secrets

### Production Environment
All secrets listed above should be configured for production.

### Staging Environment
Create staging-specific versions with `_STAGING` suffix:
- `MONGODB_STAGING_URI`
- `JWT_STAGING_SECRET`
- `STRIPE_STAGING_SECRET_KEY` (use test keys)
- etc.

### Development Environment
Most secrets can use test values or be left empty for local development.

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use strong, unique values for each secret**
3. **Rotate secrets regularly**
4. **Limit secret access to necessary team members**
5. **Use GitHub's secret scanning feature**
6. **Enable audit logs for secret access**
7. **Use environment-specific secrets**

## Testing Secrets Configuration

After configuring secrets, test them by:

1. Creating a test pull request
2. Running the workflows manually
3. Checking workflow logs for secret access
4. Verifying deployments work correctly

## Troubleshooting

### Common Issues

1. **Secret not found**: Check exact name matches
2. **Invalid secret value**: Verify the secret is correct
3. **Permission denied**: Ensure GitHub Actions has access
4. **Expired secret**: Update the secret value

### Debug Steps

1. Check workflow logs for secret-related errors
2. Verify secret names match exactly
3. Ensure secrets are properly encoded
4. Test with a simple workflow first

## Secret Rotation Schedule

Recommended rotation intervals:
- **API Keys**: Every 90 days
- **Database Passwords**: Every 180 days
- **JWT Secrets**: Every 365 days
- **Service Account Keys**: Every 90 days

## Emergency Procedures

If a secret is compromised:

1. Immediately rotate the compromised secret
2. Update GitHub repository secret
3. Revoke old credentials if applicable
4. Review access logs
5. Notify security team
6. Document the incident

## Support

For issues with GitHub secrets:
- GitHub Documentation: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions
- GitHub Support: https://support.github.com/
- Repository maintainers: Create an issue in the repository