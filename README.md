# Projet Docker Compose : frontend + backend + base de donnees

Ce projet realise une application web full stack avec :

- `frontend` pour l'interface React
- `backend` pour l'API Node.js + Express
- `db` pour la base MySQL

Les trois services sont lances ensemble avec `docker-compose.yml`.

## Ce que fait le projet

Flux :

```text
Browser -> frontend -> backend -> db
```

Le frontend affiche les produits.
Le backend gere les requetes CRUD.
MySQL stocke les donnees.

## Structure du projet

```text
t/
|-- backend/
|   |-- src/
|   |   |-- db.js
|   |   `-- server.js
|   |-- Dockerfile
|   `-- package.json
|-- db/
|   `-- init.sql
|-- frontend/
|   |-- nginx/
|   |   `-- default.conf
|   |-- src/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- Dockerfile
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- docker-compose.yml
`-- README.md
```

## 1. Backend

Le backend est cree avec Node.js + Express.

Il :

- se connecte a MySQL avec `mysql2`
- valide les donnees recues
- expose une API REST CRUD
- renvoie les reponses au frontend en JSON

Routes disponibles :

- `GET /api`
- `GET /api/:id`
- `POST /api`
- `PUT /api/:id`
- `DELETE /api/:id`

Fichiers principaux :

- `backend/src/server.js`
- `backend/src/db.js`

## 2. Base de donnees

La base utilise MySQL.

Le fichier `db/init.sql` :

- cree la base `testdb`
- cree la table `products`
- ajoute des donnees de test

Champs principaux :

- `id`
- `name`
- `description`
- `price`

## 3. Frontend

Le frontend est developpe avec React.

Il permet de :

- afficher la liste des produits
- ajouter un produit
- modifier un produit
- supprimer un produit
- afficher les erreurs et le chargement

Fichier principal :

- `frontend/src/App.jsx`

## 4. Dockerfiles

### Backend

Le fichier `backend/Dockerfile` :

- utilise `node:20-alpine`
- installe les dependances
- copie le code
- lance `npm start`

### Frontend

Le fichier `frontend/Dockerfile` :

- build l'application React avec Node.js
- sert le build avec Nginx

## 5. Docker Compose

Le fichier `docker-compose.yml` declare :

- le service `db`
- le service `backend`
- le service `frontend`
- le volume `mysql-data`
- le reseau `app-network`

### Service `db`

- image : `mysql:8.4`
- port : `3306:3306`
- volume : `mysql-data:/var/lib/mysql`
- script SQL monte depuis `db/init.sql`

### Service `backend`

- build depuis `./backend`
- port : `3001:3001`
- connexion MySQL via :

```text
DB_HOST=db
```

### Service `frontend`

- build depuis `./frontend`
- port : `3000:80`

## 6. Reseau Docker

Le reseau est declare manuellement dans Compose :

```yaml
networks:
  app-network:
    driver: bridge
```

Les trois services utilisent ce meme reseau.

Cela permet :

- au backend de joindre MySQL avec `db`
- au frontend de joindre le backend avec `backend`

## 7. Role de Nginx

Nginx est utilise dans le conteneur frontend.

Il sert :

- les fichiers React builds
- les requetes `/api` vers le backend

Fichier :

```text
frontend/nginx/default.conf
```

## 8. Lancement du projet

Depuis la racine du projet :

```bash
docker compose up --build
```

Pour lancer en arriere-plan :

```bash
docker compose up --build -d
```

## 9. Acces

- Frontend : `http://localhost:3000`
- Backend : `http://localhost:3001/api`
- MySQL : `localhost:3306`

## 10. Verifications

Apres lancement :

- ouvrir `http://localhost:3000`
- verifier que les produits de test s'affichent
- ajouter un produit
- modifier un produit
- supprimer un produit

Cela confirme la communication entre :

- le frontend
- le backend
- la base MySQL

## 11. Commandes utiles

Arreter les services :

```bash
docker compose down
```

Arreter et supprimer aussi le volume :

```bash
docker compose down -v
```

Voir les conteneurs :

```bash
docker compose ps
```

Voir les logs :

```bash
docker compose logs
```

## 12. Logique de communication

- le navigateur accede au frontend via `localhost:3000`
- Nginx envoie `/api` au backend
- le backend interroge MySQL avec `db`
- les donnees reviennent ensuite vers React

Point important :

Dans Docker, les services communiquent avec leur nom de service :

- `db`
- `backend`
- `frontend`

Le backend n'utilise donc pas `localhost` pour joindre MySQL.
