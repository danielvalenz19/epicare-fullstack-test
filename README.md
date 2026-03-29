# Epicare Fullstack Technical Test

Aplicación fullstack construida con Next.js App Router, TypeScript, Tailwind CSS y Supabase Auth SSR.

## Objetivo

La aplicación permite:

- registro e inicio de sesión con Supabase Auth
- protección de rutas para que solo usuarios autenticados accedan al dashboard
- búsqueda de planes mediante una API externa
- visualización de resultados en cards
- visualización de detalle completo de cada plan en un modal

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth SSR
- Route Handler interno para consumir la API externa de forma segura

## Requisitos

- Node.js 20.9 o superior
- npm
- un proyecto de Supabase configurado
- provider de Email habilitado en Supabase
- Confirm email desactivado para pruebas locales

## Variables de entorno

Crear un archivo `.env.local` basado en `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
EPICARE_API_KEY=your-epicare-api-key
```

## Instalación

```bash
npm install
npm run dev
```

La aplicación quedará disponible en:

```bash
http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Flujo de autenticación

La autenticación está implementada con Supabase Auth SSR.

### Rutas públicas

- `/login`
- `/register`

### Rutas protegidas

- `/dashboard`

### Comportamiento

- un usuario no autenticado que intenta entrar a `/dashboard` es redirigido a `/login`
- un usuario autenticado que intenta entrar a `/login` o `/register` es redirigido a `/dashboard`
- el cierre de sesión regresa al usuario a `/login`

## Búsqueda de planes

El dashboard contiene un formulario con estos campos:

- Zip Code
- Fecha efectiva
- Frecuencia de pago
- Fecha de nacimiento
- Género

Los campos fijos requeridos por la prueba se construyen en el backend:

- company = `allstate`
- agentId = `159208`
- relationshipType = `Primary`

## Seguridad del consumo de API

La aplicación **no consume la API externa directamente desde el frontend**.

En su lugar, usa un endpoint interno:

```bash
POST /api/plans/search
```

Ese endpoint:

- valida que el usuario esté autenticado
- valida los datos del formulario
- construye el payload requerido
- usa `EPICARE_API_KEY` del servidor
- llama a la API externa
- normaliza la respuesta para el frontend

Esto evita exponer la API key en el navegador.

## Estructura general

```txt
src/
  app/
    (auth)/
      login/
      register/
    api/
      plans/
        search/
    dashboard/
    actions/
  components/
    auth/
    dashboard/
  lib/
    plans.ts
    supabase/
  types/
```

## Notas técnicas

- se usa `proxy.ts` para refrescar la sesión con Supabase en Next.js 16
- se usa `@supabase/ssr` para clientes server y browser
- la respuesta de planes se normaliza para mostrar cards y detalle aunque el shape del proveedor varíe

## Casos recomendados para probar

### Auth

1. registrar usuario
2. iniciar sesión
3. acceder a `/dashboard`
4. cerrar sesión
5. intentar abrir `/dashboard` sin sesión

### Dashboard

1. buscar con valores por defecto
2. buscar con fecha de nacimiento válida
3. intentar buscar con Zip vacío
4. intentar buscar con fecha de nacimiento futura
5. abrir el modal de detalle de un plan

## Entrega

Subir el proyecto a GitHub y compartir el repositorio junto con este README.
