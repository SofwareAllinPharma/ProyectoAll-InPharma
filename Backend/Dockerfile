# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development

# Copiamos configuraciones
COPY package.json package-lock.json* tsconfig.json ./

# Copiamos el código fuente (incluye src/prisma y el seed)
COPY src ./src

# Instalamos TODAS las dependencias (dev + prod)
RUN npm ci

# Generamos Prisma Client
RUN npx prisma generate

# Compilamos TypeScript (genera dist/**, incluido dist/prisma/seed.js)
RUN npm run build


# =========================
# Etapa de runtime
# =========================
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Solo dependencias de producción
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copiamos el código compilado
COPY --from=builder /app/dist ./dist

# Copiamos Prisma client (engines)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiamos schema + migrations para Prisma
COPY --from=builder /app/src/prisma ./src/prisma

EXPOSE 4000

CMD ["node", "dist/index.js"]
