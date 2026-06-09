# ─────────────────────────────────────────────────────────────
# Dockerfile — Backend Node.js
# Sistema de Órdenes de Servicio — Taller Mecánico
# ─────────────────────────────────────────────────────────────

FROM node:20-alpine

# Metadatos
LABEL maintainer="Francisco R. Diaz"
LABEL project="taller-mecanico-backend"

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema (necesario para algunos paquetes nativos)
RUN apk add --no-cache openssl

# Copiar manifiestos de dependencias primero (para aprovechar cache de Docker)
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/

# Instalar dependencias de Node
RUN npm install --omit=dev

# Generar cliente Prisma
RUN npx prisma@5 generate

# Copiar el resto del código fuente
COPY . .

# Puerto expuesto (Render usa la variable PORT)
EXPOSE 10000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=10000

# Script de inicio: ejecuta migraciones y luego arranca el servidor
CMD npx prisma@5 db push && node prisma/seed.js && node src/interfaces/http/server.js
