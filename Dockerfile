FROM node:lts-alpine
RUN apk add --no-cache g++ make python3
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production

FROM node:lts-alpine
RUN apk add --no-cache g++ make python3
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:lts-alpine

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001 -G nodejs

RUN npm install -g pm2
WORKDIR /app

# Install Kaigara
RUN apk add --no-cache libc6-compat curl
ARG KAIGARA_VERSION=v1.0.10
RUN curl -Lo /usr/local/bin/kaigara https://github.com/openware/kaigara/releases/download/${KAIGARA_VERSION}/kaigara \
  && chmod +x /usr/local/bin/kaigara

COPY migrations migrations
COPY ecosystem.config.js package.json ./
COPY --from=0 /app/node_modules node_modules
COPY --from=1 /app/dist dist

USER nextjs

EXPOSE 5000
CMD ["pm2-runtime", "ecosystem.config.js"]
