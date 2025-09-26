# eee outbox publisher for UNT
FROM node:18.20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || (echo "No lockfile, installing deps" && npm i --omit=dev)
COPY src ./src
# Use non-root user for runtime
RUN addgroup -S app && adduser -S app -G app
USER app
CMD ["npm", "start"]
