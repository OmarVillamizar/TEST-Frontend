# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps from lockfile (reproducible, cache-friendly)
COPY package.json package-lock.json ./
RUN npm ci

# Build production bundle -> dist/frontend/browser
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine

# SPA config with try_files fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the compiled static client (verified path from angular.json)
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

# nginx master runs as root, worker processes drop to the unprivileged 'nginx' user
CMD ["nginx", "-g", "daemon off;"]
