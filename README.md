# 💊 ALL-IN PHARMA – Proyecto Integrador  
Guía de instalación y arranque para el equipo.  

---

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
   - Crear base de datos: `allinpharma_dev`  
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
```

### 📑 Scripts recomendados en `package.json`
```json
"scripts": {
  "dev": "tsx src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### 🌱 Variables de entorno (`.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/allinpharma_dev?schema=public"
PORT=3000
```

---

## 🎨 Frontend – Instalación
```bash
# Crear proyecto con Vite ya esta creado no lo creen de nuevo
npm create vite@latest frontend

# Entrar a la carpeta
cd frontend

# Instalar dependencias
npm install

# Instalar y configurar Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Ruteo y utilidades
npm install react-router-dom axios react-hook-form

# Levantar el servidor de desarrollo
npm run dev
```
---

## ✨ Prettier en VS Code
1. Instalar la extensión **Prettier – Code formatter**.  
2. Configurar en `settings.json`:  

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

---

## ✅ Validación de instalación
Ejecutar los siguientes comandos para verificar versiones:  
```bash
node -v   # debería mostrar v20.x.y
npm -v    # debería mostrar 10.x.y
```

# 📌 Guía de Comandos Git

### Inicializar el repositorio local
```bash
git clone https://github.com/SeminarioAllInPharme/proyecto.git
cd proyecto
```

### Crear y subir una nueva rama por funcionalidad
```bash
git checkout -b feature/consultar-producto
git push -u origin feature/consultar-producto
```

### Crear una subrama dentro de una feature
```bash
# estando en la rama principal de la feature
git checkout -b feature/consultar-producto/ui
git push -u origin feature/consultar-producto/ui
```

### Actualizar tu rama con lo último de main
```bash
git fetch origin
git merge origin/main
# o si se prefiere historial lineal
git rebase origin/main
```

### Confirmar cambios con commits claros
```bash
git add .
git commit -m "feat: agrega endpoint para consulta de producto"
```

### Subir cambios al remoto
```bash
git push
```

### Formatear código con Prettier
```bash
npx prettier --write .
```

### Revisar historial de commits
```bash
git log --oneline --graph --decorate
```

### Merge supervisado con main (por otro miembro del equipo)
```bash
# cambiar a main
git checkout main

# actualizar main
git pull origin main

# hacer merge de la rama
git merge feature/consultar-producto

# subir cambios
git push origin main