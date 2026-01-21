FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

USER node

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/package*.json ./

COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "app.js"]