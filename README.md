# 💊 ALL-IN PHARMA – Proyecto Integrador  
Guía de instalación y arranque para el equipo.  

---

## 🚀 Tecnologías
- **Frontend**: React + Tailwind CSS (TypeScript, Vite)  
- **Backend**: Node.js + Express (TypeScript)  
- **Base de datos**: PostgreSQL  

---

## 📋 Requisitos previos
1. [Node.js 20 LTS](https://nodejs.org/)  
2. [Git](https://git-scm.com/) y cuenta en GitHub  
3. [PostgreSQL](https://www.postgresql.org/download/)  
4. Editor recomendado: **VS Code** con extensiones:  
   - Prettier  
   - Prisma
   - Tailwind CSS Intellisense
   - Tailwind Twin Intellisense
   - Container tools

---

## ⚙️ Backend – Instalación
```bash
# Entrar a la carpeta backend
cd backend

# Instalar dependencias
npm install express cors bcrypt jsonwebtoken nodemailer zod @prisma/client

# Instalar dependencias de desarrollo
npm install -D prisma typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt @types/nodemailer

```

# Guía de Configuración de Backend con Base de datos --- All-In Pharma

## 1. Requisitos previos

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

Crear el archivo **`.env`** en la raíz del directorio backend con los valores de las variables especificadas en discord.
Podes sino directamente bajarte el .env del discord y adjuntarlo en la raiz del backend si no queres hacer todas las variables a mano:

``` env
POSTGRES_USER=userexample
POSTGRES_PASSWORD=passwordexample
POSTGRES_DB=allinpharma
POSTGRES_PORT=0000
```

### 2.2 Levantar el contenedor

El archivo `docker-compose.yml` ya está creado en el repo.
Este va a tener toda la informacion para que tu contenedor de docker ande perfecto.
Para crearlo tenes que ejecutar obviamente parado en ./backend:

``` bash
docker compose up -d
docker compose ps   # comprobar estado (running/healthy)
```

Ver logs si hay problemas:

``` bash
docker compose logs -f postgres
```
Una vez ejecutados con exito estos comandos les deberia aparecer en el docker desktop el contenedor de la bd creado.
Si quieren entender mas de docker fijense que hicieron con cada comando ejecutado y mas abajo hay más comandos por si quieren investigarlos.
Tip: si no pueden abrir el docker desktop intenten desde el ^ de la barra de inicio.
Cuando ejectuas el logs obviamente te tiene que aparecer "database system is ready to accept connections"
------------------------------------------------------------------------

## 🛠 3. Conectar a la base de datos

### 3.1 Desde el contenedor 
en este paso conectas nuestra bd (local de cada compu) con el contenedor que acabas de crear

``` bash
docker exec -it allinpharma_pg psql -U admin -d allinpharma
```
Esto si no tenes ningun error te va a abrir una consola de postgresql podes ejecutar una consulta para ver que todo ande bien
Dentro de `psql`:

``` sql
SELECT version();
\q
```

### 3.2 Desde pgAdmin (si tenes ganas de usar este gestor de base de datos... Pgadmin es el gestor de bd nativo de postgresql) 

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

2.  En `.env` a partir de `.env.example`:
  Si es que creas la variable a mano,me parece mejor adjuntarla desde el discord y listo 
  Copiar y pegar bien desde el discord el .env que esta ahi
    ``` bash
    ``` .env.example
    DATABASE_URL="postgresql://userexample:passwordexample@localhost:0000/allinpharma?schema=public"
    ```

------------------------------------------------------------------------

## 🗂 5. Migrar tablas por primera vez

Ya existe un prisma/schema.prisma en nuestro backend, alli se va a definir el esquema unificado de nuestra bd.
En este paso lo que hacemos es migrar la informacion que tiene el ORM prisma a la bd psql que tiene nuestro contenedor creado.

``` bash
cd backend
npx prisma generate #para generar el cliente de Prisma
npx prisma migrate dev --name init
```

Esto: - Crea las tablas en la DB local. - Guarda las migraciones en
`prisma/migrations`.

Para ver los datos:
``` bash
npx prisma studio
```
Podes usar este gestor online de prisma si te da paja usar pgadmin o la consola psql.
------------------------------------------------------------------------

## 📊 6. Visualizar con pgAdmin

Abrí pgAdmin → expandí **Databases → allinpharma → Schemas → public →
Tables**\
Allí podés ver y consultar los datos cargados.

------------------------------------------------------------------------

## 🔧 7. Comandos útiles de Docker(todo se puede gestionar tambien por el Docker Desktop)

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
-   [ ] Contenedor PostgreSQL corriendo (`docker compose ps`)\
-   [ ] `.env` creado en `backend/` con la `DATABASE_URL` correcta\
-   [ ] Dependencias instaladas (`npm install`)\
-   [ ] Migraciones ejecutadas (`npx prisma migrate dev`)\
-   [ ] Acceso a DB desde `prisma studio` o pgAdmin

------------------------------------------------------------------------

👉 Con esto cada dev tendrá su **Postgres local con Docker** y podrá
trabajar en el backend de forma consistente con el resto del equipo.

### 📑 Scripts recomendados en `package.json`
```json
"scripts": {
  "dev": "tsx src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
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
git checkout -b consultar-producto
git push -u origin consultar-producto
```

### Crear una subrama dentro de una feature
```bash
# estando en la rama principal de la feature
git checkout -b consultar-producto/ui
git push -u origin consultar-producto/ui
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


