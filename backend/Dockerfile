## Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./tsconfig.json
COPY drizzle.config.ts ./drizzle.config.ts
COPY src ./src
COPY docs ./docs

# Build TypeScript
RUN npm run build

## Runtime stage
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs

EXPOSE 3001
CMD ["node", "dist/server.js"]

