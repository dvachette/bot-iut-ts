# ---- build stage ----
FROM node:24-alpine AS build
WORKDIR /repo

COPY shared ./shared
COPY bot/package.json bot/package-lock.json ./bot/
RUN npm ci --prefix bot

COPY bot/tsconfig.json bot/tsup.config.ts ./bot/
COPY bot/src ./bot/src
RUN npm run build --prefix bot

# ---- runtime stage ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY bot/package.json bot/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /repo/bot/dist ./dist

RUN mkdir -p src/calendars/nextweek src/calendars/tomorrow

CMD ["node", "dist/index.js"]