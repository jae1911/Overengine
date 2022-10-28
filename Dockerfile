FROM node:16 as builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

FROM node:lts-alpine AS runner

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/templates /templates
COPY --from=builder /app/build /app/build
COPY --from=builder /app/content /app/content
COPY --from=builder /app/public /app/public

EXPOSE 8080

HEALTHCHECK CMD curl --fail http://localhost:8080/health || exit 1

CMD ["node", "/app/build/index.js"]
