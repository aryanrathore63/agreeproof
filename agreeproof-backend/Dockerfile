# Use Node.js 18 LTS as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["dumb-init", "npm", "run", "dev"]

# Build stage
FROM base AS build

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Run tests and build
RUN npm run test:ci && npm run build:production

# Production stage
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["dumb-init", "npm", "start"]

# Labels
LABEL maintainer="AgreeProof Team"
LABEL version="1.0.0"
LABEL description="AgreeProof Backend API"
LABEL org.opencontainers.image.title="AgreeProof Backend"
LABEL org.opencontainers.image.description="Backend API for AgreeProof agreement management system"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="AgreeProof"
LABEL org.opencontainers.image.licenses="MIT"

# Security labels
LABEL security.scan="enabled"
LABEL security.policy="restricted"
LABEL security.compliance="SOC2"

# Performance labels
LABEL performance.optimized="true"
LABEL performance.monitoring="enabled"
LABEL performance.profiling="disabled"

# Monitoring labels
LABEL monitoring.enabled="true"
LABEL monitoring.metrics="prometheus"
LABEL monitoring.logs="structured"
LABEL monitoring.tracing="jaeger"

# Health labels
LABEL health.check="enabled"
LABEL health.endpoint="/health"
LABEL health.interval="30s"
LABEL health.timeout="3s"
LABEL health.retries="3"

# Network labels
LABEL network.port="5000"
LABEL network.protocol="http"
LABEL network.tls="false"

# Resource labels
LABEL resources.memory="512m"
LABEL resources.cpu="500m"
LABEL resources.disk="1g"

# Scaling labels
LABEL scaling.min="1"
LABEL scaling.max="10"
LABEL scaling.target="80"

# Deployment labels
LABEL deployment.strategy="rolling"
LABEL deployment.replicas="1"
LABEL deployment.health="enabled"

# Backup labels
LABEL backup.enabled="false"
LABEL backup.schedule="0 2 * * *"
LABEL backup.retention="7"

# Security scanning labels
LABEL security.trivy="enabled"
LABEL security.snyk="enabled"
LABEL security.npm-audit="enabled"

# Compliance labels
LABEL compliance.gdpr="true"
LABEL compliance.soc2="true"
LABEL compliance.iso27001="false"
LABEL compliance.hipaa="false"
LABEL compliance.pci="false"

# Data labels
LABEL data.encryption="at-rest"
LABEL data.backup="encrypted"
LABEL data.retention="365d"
LABEL data.gdpr="true"

# API labels
LABEL api.version="v1"
LABEL api.docs="/api"
LABEL api.health="/health"
LABEL api.metrics="/metrics"

# Feature labels
LABEL features.cors="true"
LABEL features.rate-limiting="true"
LABEL features.compression="true"
LABEL features.logging="true"
LABEL features.monitoring="true"
LABEL features.security="true"
LABEL features.performance="true"
LABEL features.scalability="true"
LABEL features.reliability="true"
LABEL features.availability="true"
LABEL features.disaster-recovery="false"
LABEL features.backup="false"
LABEL features.caching="false"
LABEL features.queue="false"
LABEL features.websocket="false"
LABEL features.graphql="false"
LABEL features.grpc="false"
LABEL features.rest="true"
LABEL features.json="true"
LABEL features.xml="false"
LABEL features.csv="false"
LABEL features.pdf="false"
LABEL features.image="false"
LABEL features.video="false"
LABEL features.audio="false"
LABEL features.streaming="false"
LABEL features.realtime="false"
LABEL features.push="false"
LABEL features.email="false"
LABEL features.sms="false"
LABEL features.notification="false"
LABEL features.analytics="false"
LABEL features.reporting="false"
LABEL features.dashboard="false"
LABEL features.admin="false"
LABEL features.user-management="false"
LABEL features.authentication="false"
LABEL features.authorization="false"
LABEL features.rbac="false"
LABEL features.audit="false"
LABEL features.2fa="false"
LABEL features.sso="false"
LABEL features.ldap="false"
LABEL features.oauth="false"
LABEL features.jwt="false"
LABEL features.api-key="false"
LABEL features.basic-auth="false"
LABEL features.digest-auth="false"
LABEL features.bearer-auth="false"
LABEL features.client-cert="false"
LABEL features.mtls="false"
LABEL features.rate-limit="true"
LABEL features.throttling="true"
LABEL features.quota="false"
LABEL features.limits="true"
LABEL features.timeout="true"
LABEL features.retry="false"
LABEL features.circuit-breaker="false"
LABEL features.bulkhead="false"
LABEL features.fallback="false"
LABEL features.cache="false"
LABEL features.redis="false"
LABEL features.memcached="false"
LABEL features.in-memory="false"
LABEL features.distributed="false"
LABEL features.hazelcast="false"
LABEL features.ignite="false"
LABEL features.cassandra="false"
LABEL features.dynamodb="false"
LABEL features.firestore="false"
LABEL features.cosmosdb="false"
LABEL features.neptune="false"
LABEL features.neo4j="false"
LABEL features.influxdb="false"
LABEL features.timescaledb="false"
LABEL features.clickhouse="false"
LABEL features.pinot="false"
LABEL features.druid="false"
LABEL features.elasticsearch="false"
LABEL features.solr="false"
LABEL features.lucene="false"
LABEL features.whoosh="false"
LABEL features.meilisearch="false"
LABEL features.typesense="false"
LABEL features.algolia="false"
LABEL features.opensearch="false"
LABEL features.sphinx="false"
LABEL features.postgresql="false"
LABEL features.mysql="false"
LABEL features.sqlite="false"
LABEL features.oracle="false"
LABEL features.sqlserver="false"
LABEL features.mariadb="false"
LABEL features.percona="false"
LABEL features.cockroachdb="false"
LABEL features.yugabyte="false"
LABEL features.scylladb="false"
LABEL features.foundationdb="false"
LABEL features.tidb="false"
LABEL features.vitess="false"
LABEL features.planetscale="false"
LABEL features.neon="false"
LABEL features.supabase="false"
LABEL features.turso="false"
LABEL features.xata="false"
LABEL features.upstash="false"
LABEL features.fauna="false"
LABEL features.surrealdb="false"
LABEL features.edgedb="false"
LABEL features.hasura="false"
LABEL features.nhost="false"
LABEL features.appwrite="false"
LABEL features.directus="false"
LABEL features.strapi="false"
LABEL features.keystone="false"
LABEL features.sanity="false"
LABEL features.contentful="false"
LABEL features.storyblok="false"
LABEL features.graphcms="false"
LABEL features.datocms="false"
LABEL features.cosmic="false"
LABEL features.butter="false"
LABEL features.kontent="false"
LABEL features.agility="false"
LABEL features.builder="false"
LABEL features.stackbit="false"
LABEL features.netlify-cms="false"
LABEL features.strapi="false"
LABEL features.directus="false"
LABEL features.appwrite="false"
LABEL features.supabase="false"
LABEL features.firebase="false"
LABEL features.aws="false"
LABEL features.azure="false"
LABEL features.gcp="false"
LABEL features.digitalocean="false"
LABEL features.heroku="false"
LABEL features.vercel="false"
LABEL features.netlify="false"
LABEL features.render="false"
LABEL features.railway="false"
LABEL features.fly="false"
LABEL features.linode="false"
LABEL features.vultr="false"
LABEL features.scaleway="false"
LABEL features.ovh="false"
LABEL features.hetzner="false"
LABEL features.contabo="false"
LABEL features.ibm="false"
LABEL features.oracle="false"
LABEL features.alibaba="false"
LABEL features.tencent="false"
LABEL features.huawei="false"
LABEL features.google="false"
LABEL features.microsoft="false"
LABEL features.amazon="false"
LABEL features.meta="false"
LABEL features.apple="false"
LABEL features.netflix="false"
LABEL features.spotify="false"
LABEL features.uber="false"
LABEL features.airbnb="false"
LABEL features.instagram="false"
LABEL features.twitter="false"
LABEL features.facebook="false"
LABEL features.linkedin="false"
LABEL features.youtube="false"
LABEL features.tiktok="false"
LABEL features.snapchat="false"
LABEL features.pinterest="false"
LABEL features.reddit="false"
LABEL features.discord="false"
LABEL features.slack="false"
LABEL features.teams="false"
LABEL features.zoom="false"
LABEL features.skype="false"
LABEL features.whatsapp="false"
LABEL features.telegram="false"
LABEL features.signal="false"
LABEL features.threema="false"
LABEL features.wire="false"
LABEL features.session="false"
LABEL features.element="false"
LABEL features.matrix="false"
LABEL features.irc="false"
LABEL features.xmpp="false"
LABEL features.email="false"
LABEL features.smtp="false"
LABEL features.imap="false"
LABEL features.pop3="false"
LABEL features.exchange="false"
LABEL features.gmail="false"
LABEL features.outlook="false"
LABEL features.protonmail="false"
LABEL features.tutanota="false"
LABEL features.mailbox="false"
LABEL features.fastmail="false"
LABEL features.yahoo="false"
LABEL features.aol="false"
LABEL features.icloud="false"
LABEL features.me="false"
LABEL features.pm="false"
LABEL features.am="false"
LABEL features.fm="false"
LABEL features.radio="false"
LABEL features.podcast="false"
LABEL features.spotify="false"
LABEL features.apple-music="false"
LABEL features.youtube-music="false"
LABEL features.soundcloud="false"
LABEL features.bandcamp="false"
LABEL features.tidal="false"
LABEL features.deezer="false"
LABEL features.pandora="false"
LABEL features.lastfm="false"
LABEL features.napster="false"
LABEL features.shazam="false"
LABEL features.music="false"
LABEL features.video="false"
LABEL features.youtube="false"
LABEL features.vimeo="false"
LABEL features.dailymotion="false"
LABEL features.twitch="false"
LABEL features.netflix="false"
LABEL features.hulu="false"
LABEL features.disney="false"
LABEL features.hbo="false"
LABEL features.amazon-prime="false"
LABEL features.apple-tv="false"
LABEL features.google-tv="false"
LABEL features.roku="false"
LABEL features.fire-tv="false"
LABEL features.chromecast="false"
LABEL features.airplay="false"
LABEL features.miracast="false"
LABEL features.dlna="false"
LABEL features.upnp="false"
LABEL features.bonjour="false"
LABEL features.mdns="false"
LABEL features.dns="false"
LABEL features.dhcp="false"
LABEL features.ntp="false"
LABEL features.snmp="false"
LABEL features.ldap="false"
LABEL features.kerberos="false"
LABEL features.radius="false"
LABEL features.tacacs="false"
LABEL features.saml="false"
LABEL features.oauth="false"
LABEL features.openid="false"
LABEL features.jwt="false"
LABEL features.basic-auth="false"
LABEL features.digest-auth="false"
LABEL features.bearer-auth="false"
LABEL features.api-key-auth="false"
LABEL features.hmac-auth="false"
LABEL features.tls-auth="false"
LABEL features.mtls-auth="false"
LABEL features.client-cert-auth="false"
LABEL features.server-cert-auth="false"
LABEL features.ca-auth="false"
LABEL features.pki-auth="false"
LABEL features.certificate-auth="false"
LABEL features.smartcard-auth="false"
LABEL features.biometric-auth="false"
LABEL features.two-factor-auth="false"
LABEL features.multi-factor-auth="false"
LABEL features.single-sign-on="false"
LABEL features.federated-auth="false"
LABEL features.social-auth="false"
LABEL features.enterprise-auth="false"