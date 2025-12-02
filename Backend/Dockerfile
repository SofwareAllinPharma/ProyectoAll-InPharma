# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

# (opcional pero ayuda a Prisma en build)
ENV NODE_ENV=development

# Copiamos archivos de configuración
COPY package.json package-lock.json* tsconfig.json ./

# Copiamos el código fuente (incluye src/prisma)
COPY src ./src

# Instalar dependencias (respeta package-lock)
RUN npm ci

# Generar cliente de Prisma (usa schema en src/prisma)
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build


# =========================
# Etapa de runtime
# =========================
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copiamos package.json / lock para instalar solo prod deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copiar dist compilado
COPY --from=builder /app/dist ./dist

# Copiar Prisma client (engines) generado en build
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 👉 Copiamos también schema + migrations para poder hacer migrate/seed en runtime
COPY --from=builder /app/src/prisma ./src/prisma

# El backend escucha en el puerto 4000 (según tu .env)
EXPOSE 4000

# Comando de arranque (usa PORT del entorno si lo seteás)
CMD ["node", "dist/index.js"]
