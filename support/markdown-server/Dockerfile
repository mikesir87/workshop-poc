# syntax=docker/dockerfile:1
ARG NODE_VERSION=lts
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /usr/local/app

# Install dependencies with cache and bind mounts for deterministic builds
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci --production

# Copy application source code (excluding files via .dockerignore)
COPY --link src ./src

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

USER appuser
EXPOSE 3000
CMD ["node", "src/index.mjs"]
