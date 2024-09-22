FROM oven/bun:alpine
RUN apk add --no-cache openldap openldap-clients
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]