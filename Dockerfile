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
RUN npm install -g pm2
WORKDIR /app

# Install Kaigara
RUN apk add --no-cache libc6-compat curl
ARG KAIGARA_VERSION=0.1.34
RUN curl -Lo /usr/local/bin/kaigara https://github.com/openware/kaigara/releases/download/${KAIGARA_VERSION}/kaigara \
  && chmod +x /usr/local/bin/kaigara

COPY migrations migrations
COPY ecosystem.config.js package.json ./
COPY --from=0 /app/node_modules node_modules
COPY --from=1 /app/dist dist

EXPOSE 5000
CMD ["pm2-runtime", "ecosystem.config.js"]
