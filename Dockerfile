FROM oven/bun:alpine
LABEL org.opencontainers.image.source=https://github.com/HeyItsBATMAN/openldap-search-server
RUN apk add --no-cache openldap openldap-clients
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]