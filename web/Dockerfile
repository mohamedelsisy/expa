# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
# Runtime config comes from NUXT_* variables at container start (NUXT_API_BASE_URL, NUXT_PUBLIC_SITE_URL, ...; see
# web/.env.example and docs/DEPLOYMENT.md). Nothing is baked in at build time; the server refuses to boot without them.
CMD ["node", ".output/server/index.mjs"]
