# TP : Application Web Full Stack avec Docker Compose

## 1. Objectif du projet

Ce projet consiste a realiser une application web complete en respectant une architecture full stack separee en trois services :

- un frontend en React
- un backend en Node.js avec Express
- une base de donnees MySQL

L'ensemble est orchestre avec Docker Compose pour pouvoir lancer toute l'application avec une seule commande, sans installer Node.js ou MySQL localement.

## 2. Resultat final

Apres execution de la commande ci-dessous, l'application est accessible et les trois services communiquent entre eux :

```bash
docker compose up --build
```

Acces :

- Frontend : http://localhost:3000
- Backend : http://localhost:3001/api
- Base MySQL : localhost:3306

Fonctionnalites disponibles :

- afficher la liste des produits stockes dans MySQL
- ajouter un produit
- modifier un produit
- supprimer un produit
- gerer les etats de chargement et d'erreur

## 3. Architecture generale

L'application repose sur trois conteneurs Docker :

### Frontend

Le frontend est developpe avec React. Il affiche l'interface utilisateur et envoie les requetes HTTP au backend.

### Backend

Le backend est developpe avec Node.js et Express. Il expose une API REST, valide les donnees recues, execute les requetes SQL et renvoie les reponses au frontend.

### Base de donnees

La base de donnees utilise MySQL. Elle contient une table `products` avec des donnees de test initialisees automatiquement au demarrage.

## 4. Structure du projet

```text
.
|-- backend
|   |-- src
|   |   |-- db.js
|   |   `-- server.js
|   |-- Dockerfile
|   `-- package.json
|-- db
|   `-- init.sql
|-- frontend
|   |-- nginx
|   |   `-- default.conf
|   |-- src
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

## 5. Technologies utilisees

- React pour l'interface utilisateur
- Vite pour builder le frontend React
- Node.js pour executer le serveur backend
- Express pour construire l'API REST
- mysql2 pour connecter Node.js a MySQL
- MySQL 8.4 pour le stockage des donnees
- Nginx pour servir le frontend et faire le proxy vers le backend
- Docker pour conteneuriser les services
- Docker Compose pour lancer l'ensemble

## 6. Comment le projet a ete realise

### Etape 1 : creation du backend

Le backend a ete cree dans le dossier `backend`.

Les elements principaux sont :

- `server.js` : initialise Express et declare les routes de l'API
- `db.js` : configure la connexion a MySQL avec un pool de connexions

Le backend utilise :

- `express.json()` pour lire les donnees JSON
- `cors()` pour autoriser les appels HTTP
- des fonctions de validation pour verifier les champs recus
- une gestion centralisee des erreurs
- un mecanisme de tentative de reconnexion a MySQL au demarrage

### Etape 2 : creation de la base de donnees

La base est preparee avec le fichier `db/init.sql`.

Ce script SQL :

- selectionne la base `testdb`
- cree la table `products` si elle n'existe pas
- definit `id` comme cle primaire auto-incrementee
- ajoute des donnees de test

La table contient :

- `id`
- `name`
- `description`
- `price`
- `created_at`

### Etape 3 : creation du frontend

Le frontend a ete cree dans le dossier `frontend` avec React.

Il permet :

- d'afficher tous les produits
- d'ajouter un produit avec un formulaire
- de modifier un produit existant
- de supprimer un produit
- d'afficher les messages de succes
- d'afficher les erreurs
- d'afficher un etat de chargement pendant les requetes

Le composant principal est `frontend/src/App.jsx`.

### Etape 4 : dockerisation

Chaque partie du projet a ete preparee pour fonctionner dans un conteneur.

#### Backend

Le backend possede son propre `Dockerfile`.

Ce Dockerfile :

- part de l'image `node:20-alpine`
- copie `package.json`
- installe les dependances
- copie le code source
- lance le serveur avec `npm start`

#### Frontend

Le frontend possede egalement son propre `Dockerfile`.

Ce Dockerfile utilise deux etapes :

- une etape Node.js pour installer les dependances et generer le build React
- une etape Nginx pour servir les fichiers statiques produits par Vite

#### Base de donnees

La base n'a pas besoin d'un Dockerfile personnalise car elle utilise l'image officielle :

```text
mysql:8.4
```

### Etape 5 : orchestration avec Docker Compose

Le fichier `docker-compose.yml` decrit l'ensemble de l'application.

Il declare :

- les trois services `frontend`, `backend` et `db`
- un volume `mysql-data`
- un reseau manuel `app-network`

Il configure aussi :

- les ports
- les variables d'environnement
- les dependances entre services
- l'initialisation automatique de la base
- le healthcheck MySQL

## 7. Explication du fichier docker-compose.yml

### Service `db`

Le service `db` represente la base de donnees MySQL.

Il contient :

- l'image officielle `mysql:8.4`
- les variables `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`
- le port `3306:3306`
- le volume `mysql-data:/var/lib/mysql` pour conserver les donnees
- le montage du script `./db/init.sql` dans `/docker-entrypoint-initdb.d/init.sql`
- un `healthcheck` pour verifier que MySQL est pret

### Service `backend`

Le service `backend` est construit a partir du dossier `backend`.

Il contient :

- le port `3001:3001`
- les variables de connexion a la base
- `DB_HOST=db`

Le point important est que le backend ne se connecte pas a `localhost`, mais au service Docker `db`, ce qui respecte la contrainte du sujet.

### Service `frontend`

Le service `frontend` est construit a partir du dossier `frontend`.

Il contient :

- le port `3000:80`
- une dependance vers le backend

Le navigateur accede donc a l'application via `http://localhost:3000`.

### Volume

Le volume `mysql-data` permet de garder les donnees meme si le conteneur MySQL est recree.

### Reseau

Le reseau `app-network` est declare manuellement :

```yaml
networks:
  app-network:
    driver: bridge
```

Les trois services sont attaches a ce meme reseau. Cela permet aux conteneurs de communiquer entre eux avec leur nom de service.

Exemples :

- le backend accede a MySQL avec `db:3306`
- le frontend accede au backend avec `backend:3001`

## 8. Role de Nginx dans le projet

Nginx est utilise dans le conteneur frontend.

Il a deux roles :

- servir les fichiers statiques du build React
- faire un proxy des requetes `/api` vers le backend

Cela permet au frontend d'appeler simplement `/api` sans avoir a gerer un probleme de communication entre origines.

Le fichier de configuration se trouve dans :

```text
frontend/nginx/default.conf
```

## 9. Comment l'application fonctionne

Voici le cheminement complet d'une requete :

1. L'utilisateur ouvre le frontend sur `http://localhost:3000`
2. Nginx sert les fichiers du frontend React
3. React envoie une requete HTTP vers `/api`
4. Nginx redirige cette requete vers le service `backend`
5. Express recoit la requete
6. Le backend interroge MySQL via le service `db`
7. MySQL renvoie les donnees
8. Le backend renvoie une reponse JSON au frontend
9. React met a jour l'interface

## 10. API REST implementee

L'API REST complete implemente les routes suivantes :

### `GET /api`

Retourne tous les produits.

### `GET /api/:id`

Retourne un produit selon son identifiant.

### `POST /api`

Ajoute un nouveau produit.

Exemple de corps JSON :

```json
{
  "name": "Casque audio",
  "description": "Casque sans fil",
  "price": 99.99
}
```

### `PUT /api/:id`

Modifie un produit existant.

### `DELETE /api/:id`

Supprime un produit.

## 11. Gestion des erreurs

Le backend gere plusieurs types d'erreurs :

- identifiant invalide
- produit inexistant
- champ `name` vide
- champ `price` invalide
- erreurs internes du serveur
- erreurs de connexion a MySQL

Le frontend affiche egalement les erreurs recues afin d'informer l'utilisateur.

## 12. Donnees de test

Au premier lancement, MySQL execute automatiquement `db/init.sql`.

Ce fichier insere des produits de demonstration pour que l'application soit directement utilisable apres le demarrage.

## 13. Lancement du projet

Depuis la racine du projet :

```bash
docker compose up --build
```

Pour lancer en arriere-plan :

```bash
docker compose up --build -d
```

Pour arreter les services :

```bash
docker compose down
```

Pour arreter et supprimer aussi les volumes :

```bash
docker compose down -v
```

## 14. Verifications effectuees

Le projet a ete verifie de la facon suivante :

- validation de la configuration avec `docker compose config`
- build et lancement complet avec `docker compose up --build`
- verification du fonctionnement des trois services
- test des routes CRUD
- verification de l'acces aux donnees MySQL depuis le frontend

## 15. Ce que montre ce projet

Ce TP permet de mettre en pratique :

- une architecture full stack separee
- le developpement d'une API REST CRUD
- la connexion d'un backend a une base MySQL
- la consommation d'une API depuis React
- la conteneurisation avec Docker
- l'orchestration multi-services avec Docker Compose

## 16. Conclusion

Cette application montre comment construire une petite architecture web complete, claire et modulaire.

Le frontend, le backend et la base de donnees sont separes, mais fonctionnent ensemble grace a Docker Compose, au reseau Docker partage et aux variables d'environnement.

Le projet respecte les contraintes demandees :

- separation frontend / backend
- utilisation de MySQL
- API REST CRUD complete
- utilisation du nom de service `db` pour la base
- aucun service a installer localement
- orchestration complete avec Docker Compose
