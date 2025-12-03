# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development

# Copiamos configuraciones
COPY package.json package-lock.json* tsconfig.json ./

# Copiamos código fuente
COPY src ./src

# Instalamos todas las dependencias (incluye tsx, typescript, prisma)
RUN npm ci

# Generamos Prisma Client
RUN npx prisma generate

# Compilamos el proyecto
RUN npm run build

# Compilamos también el seed (TS → JS)
RUN npx tsc src/prisma/seed.ts --outDir dist/prisma


# =========================
# Etapa de runtime
# =========================
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copiamos package.json para instalar solo dependencias de producción
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copiamos el dist compilado (incluye index.js)
COPY --from=builder /app/dist ./dist

# Copiamos Prisma engines
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiamos migrations + schema
COPY --from=builder /app/src/prisma ./src/prisma

# Copiamos seed ya compilado
COPY --from=builder /app/dist/prisma ./dist/prisma

EXPOSE 4000

# Arranque del servidor
CMD ["node", "dist/index.js"]
