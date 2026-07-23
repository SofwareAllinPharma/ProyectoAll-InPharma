# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS builder
WORKDIR /app
ARG CACHEBUST=1
RUN echo "CACHEBUST $CACHEBUST"

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

# Debug: Listar archivos generados en dist y dist/prisma
RUN echo "\n==== Archivos en /app/dist ====\n" && ls -l /app/dist && \
	echo "\n==== Archivos en /app/dist/prisma ====\n" && ls -l /app/dist/prisma || echo "No existe /app/dist/prisma"


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

# Debug: Listar archivos copiados en runtime
RUN echo "\n==== Archivos en /app/dist (runtime) ====\n" && ls -l /app/dist && \
	echo "\n==== Archivos en /app/dist/prisma (runtime) ====\n" && ls -l /app/dist/prisma || echo "No existe /app/dist/prisma"

EXPOSE 4000

# Corre migraciones pendientes antes de iniciar (idempotente: si ya están aplicadas, no hace nada)
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./src/prisma/schema.prisma && node dist/index.js"]
