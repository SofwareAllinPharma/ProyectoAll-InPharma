# ========= STAGE 1: BUILD =========
FROM node:20-alpine AS builder
WORKDIR /app

# Archivos de config principales
COPY package.json package-lock.json* ./

# ⬇️ IMPORTANTE: copiamos configs de TS, Vite, Tailwind y PostCSS
COPY tsconfig.json tsconfig.*.json ./
COPY vite.config.* ./
COPY tailwind.config.* ./
COPY postcss.config.* ./

# HTML y estáticos
COPY index.html ./
COPY public ./public

# Código fuente
COPY src ./src

# Instalar dependencias
RUN npm ci

# Build de producción (Vite + Tailwind + PostCSS)
# Limitamos heap de Node a 1536MB para evitar OOM kill en VPS con poca RAM
RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build


# ========= STAGE 2: RUNTIME (NGINX) =========
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist ./

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
