# ALL-IN PHARMA – Proyecto Integrador  
Guía de instalación y arranque para el equipo.  

## 🚀 Tecnologías
- **Frontend**: React + Tailwind CSS (TypeScript, Vite)  
- **Backend**: Node.js + Express (TypeScript)  
- **ORM**: Prisma  
- **Base de datos**: PostgreSQL  

---

## 📋 Requisitos previos
1. [Node.js 20 LTS](https://nodejs.org/)  
2. [Git](https://git-scm.com/) y cuenta en GitHub  
3. [PostgreSQL](https://www.postgresql.org/download/)  
   - Crear base `allinpharma_dev`  
4. Editor recomendado: **VS Code** con extensiones:  
   - ESLint  
   - Prettier  
   - Prisma  

---

## ⚙️ Backend – Instalación
```bash
# Entrar a la carpeta backend
cd backend

# Inicializar proyecto
npm init -y

# Instalar dependencias
npm install express cors dotenv @prisma/client

# Instalar dependencias de desarrollo
npm install -D typescript ts-node tsx @types/node

# Inicializar TypeScript
npx tsc --init

# Inicializar Prisma
npx prisma init

# Scripts recomendados en package.json
"scripts": {
  "dev": "tsx src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}

# Variables de entorno (.env) por ejemplo:
DATABASE_URL="postgresql://user:password@localhost:5432/allinpharma_dev?schema=public"
PORT=3000

# Crear proyecto con Vite
npm create vite@latest frontend

# Entrar a la carpeta
cd frontend

# Instalar dependencias
npm install

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Ruteo y utilidades
npm install react-router-dom axios react-hook-form

# Levantar el servidor de desarrollo:

npm run dev


## Prettier en VS Code

# Instalar extensión: Prettier – Code formatter
# Configuración en settings.json:

{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}