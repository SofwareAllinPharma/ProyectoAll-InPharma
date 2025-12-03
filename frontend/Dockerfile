# ========= STAGE 1: BUILD =========
FROM node:20-alpine AS builder
WORKDIR /app

# Archivos de config principales
COPY package.json package-lock.json* ./
COPY tsconfig.json tsconfig.*.json ./
COPY vite.config.* ./
COPY index.html ./

# Código fuente
COPY src ./src
# (si tenés public/, descomentá)
# COPY public ./public

# Instalar deps
RUN npm ci

# Build de producción
RUN npm run build


# ========= STAGE 2: RUNTIME (NGINX) =========
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copiamos el build de Vite
COPY --from=builder /app/dist ./

# Configuración básica para SPA (fallback a index.html)
# (opcional pero recomendable)
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
