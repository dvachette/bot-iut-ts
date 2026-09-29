# ---- frontend stage ----
FROM node:24-alpine AS frontend
WORKDIR /repo

COPY shared ./shared
COPY web/frontend/package.json web/frontend/package-lock.json ./web/frontend/
RUN npm ci --prefix web/frontend

COPY web/frontend ./web/frontend
RUN npm run build --prefix web/frontend

# ---- build stage ----
FROM node:24-alpine AS build
WORKDIR /repo

COPY shared ./shared
COPY web/backend/package.json web/backend/package-lock.json ./web/backend/
RUN npm ci --prefix web/backend

COPY web/backend/tsconfig.json web/backend/tsup.config.ts ./web/backend/
COPY web/backend/src ./web/backend/src
RUN npm run build --prefix web/backend

# ---- runtime stage ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY web/backend/package.json web/backend/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /repo/web/backend/dist ./dist
COPY --from=frontend /repo/web/frontend/dist ./public
CMD ["node", "dist/index.js"]