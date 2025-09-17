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

# inicializar los servicios de auth
npm i bcrypt jsonwebtoken
npm i -D @types/bcrypt @types/jsonwebtoken
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


# 🚀 Guía de Configuración de Backend con Base de datos --- All-In Pharma

## 📦 1. Requisitos previos

-   **Docker Desktop** (Windows/Mac)
-   **Node.js 20 LTS** (descargar de [nodejs.org](https://nodejs.org/))\
-   **npm** (viene con Node)\
-   **pgAdmin 4** (cliente gráfico para PostgreSQL)

Verificar instalaciones:

``` bash
docker --version
docker compose version
node -v
```

------------------------------------------------------------------------

## 🐘 2. Preparar PostgreSQL con Docker

### 2.1 Variables del contenedor

Crear el archivo **`.env.docker`** en la raíz del repo:

``` env
POSTGRES_USER=userexample
POSTGRES_PASSWORD=passwordexample
POSTGRES_DB=allinpharma
POSTGRES_PORT=0000
```

### 2.2 Levantar el contenedor

El archivo `docker-compose.yml` ya está versionado en el repo. Ejecutar:

``` bash
docker compose up -d
docker compose ps       # comprobar estado (running/healthy)
```

Ver logs si hay problemas:

``` bash
docker compose logs -f postgres
```

------------------------------------------------------------------------

## 🛠 3. Conectar a la base de datos

### 3.1 Desde el contenedor

``` bash
docker exec -it allinpharma_pg psql -U admin -d allinpharma
```

Dentro de `psql`:

``` sql
SELECT version();
\q
```

### 3.2 Desde pgAdmin

-   **Host:** `localhost`\
-   **Port:** `0000` (o el que definiste en `.env.docker`)\
-   **User:** `userexample`\
-   **Password:** `passwordexample`\
-   **Database:** `allinpharma`

> ⚠️ Dejar vacío el campo *Service* en pgAdmin.

------------------------------------------------------------------------

## ⚙️ 4. Configurar el backend

1.  Entrar a la carpeta del backend:

    ``` bash
    cd backend
    ```

2.  Crear archivo `.env` a partir de `.env.example`:

    ``` .env.example
    DATABASE_URL="postgresql://userexample:passwordexample@localhost:0000/allinpharma?schema=public"
    ```

    > Si usás otro puerto (ej: 5433), actualizalo aquí.

3.  Instalar dependencias:

    ``` bash
    npm install
    ```

4.  Generar cliente de Prisma:

    ``` bash
    npx prisma generate
    ```

------------------------------------------------------------------------

## 🗂 5. Migrar tablas por primera vez

Cuando ya exista `prisma/schema.prisma` en el repo (definido por el
equipo):

``` bash
cd backend
npx prisma migrate dev --name init
```

Esto: - Crea las tablas en la DB local. - Guarda las migraciones en
`prisma/migrations`.

Para ver los datos:

``` bash
npx prisma studio
```

------------------------------------------------------------------------

## 📊 6. Visualizar con pgAdmin

Abrí pgAdmin → expandí **Databases → allinpharma → Schemas → public →
Tables**\
Allí podés ver y consultar los datos cargados.

------------------------------------------------------------------------

## 🔧 7. Comandos útiles de Docker

-   **Iniciar contenedor**: `docker compose up -d`\

-   **Parar contenedor**: `docker compose stop`\

-   **Reiniciar**: `docker compose restart`\

-   **Apagar y borrar contenedor (pero conservar datos)**:

    ``` bash
    docker compose down
    ```

-   **Reset total (borra datos también)**:

    ``` bash
    docker compose down -v
    docker compose up -d
    npx prisma migrate dev
    ```

------------------------------------------------------------------------

## ✅ 8. Checklist por dev

-   [ ] Docker instalado y corriendo\
-   [ ] `.env.docker` creado desde `.env.docker.example`\
-   [ ] Contenedor PostgreSQL corriendo (`docker compose ps`)\
-   [ ] `.env` creado en `backend/` con la `DATABASE_URL` correcta\
-   [ ] Dependencias instaladas (`npm install`)\
-   [ ] Migraciones ejecutadas (`npx prisma migrate dev`)\
-   [ ] Acceso a DB desde `prisma studio` o pgAdmin

------------------------------------------------------------------------

👉 Con esto cada dev tendrá su **Postgres local con Docker** y podrá
trabajar en el backend de forma consistente con el resto del equipo.