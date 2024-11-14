FROM node:22 AS builder

WORKDIR /app
COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run ui:lexgen && \
    npm run lexgen && \
    npm run ui:build && \
    npm run build && \
    npm prune --omit=dev

FROM node:22 AS gstand

WORKDIR /app
COPY --from=builder /app/package.json /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/client/dist /app/client/dist

CMD ["npm", "run", "start"]
