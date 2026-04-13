# Full Stack Docker Compose Project

This project includes:

- a React frontend
- a Node.js + Express backend
- a MySQL database
- Docker Compose orchestration

## Structure

```text
.
|-- backend
|-- db
|-- frontend
`-- docker-compose.yml
```

## Run the project

```bash
docker compose up --build
```

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- MySQL: localhost:3306

## Features

- display products from MySQL
- add a product
- update a product
- delete a product
- handle loading and error states

## API endpoints

- `GET /api`
- `GET /api/:id`
- `POST /api`
- `PUT /api/:id`
- `DELETE /api/:id`

## Seed data

The database is initialized automatically with sample products from `db/init.sql`.
