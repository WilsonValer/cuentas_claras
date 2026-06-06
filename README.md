# Cuenta Clara MVP

Aplicativo web para controlar consumos y pagos en almuerzos grupales.

## Estructura

- `frontend/`: Angular 19
- `backend/`: Node.js + Express + PostgreSQL
- `backend/sql/schema.sql`: script de creacion de base de datos

## Requisitos

- Node.js 22+
- npm 10+
- PostgreSQL 14+

## Configuracion

1. Copia `backend/.env.example` a `backend/.env` y completa credenciales.
2. Crea la base de datos `cuenta_clara` en PostgreSQL.
3. Ejecuta el script `backend/sql/schema.sql`.

## Instalacion

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Servicios:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:4000/api`

## Endpoints principales

- `GET /api/lunch-events`
- `POST /api/lunch-events`
- `GET /api/lunch-events/:id`
- `PUT /api/lunch-events/:id`
- `DELETE /api/lunch-events/:id`
- `GET /api/lunch-events/:id/participants`
- `POST /api/lunch-events/:id/participants`
- `PUT /api/participants/:id`
- `DELETE /api/participants/:id`
- `GET /api/participants/:id/items`
- `POST /api/participants/:id/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`
- `PATCH /api/participants/:id/mark-paid`
- `PATCH /api/participants/:id/mark-pending`
- `GET /api/lunch-events/:id/summary`