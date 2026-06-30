# Sport Coach App

Application web mobile-first pour le suivi sportif entre une coach et ses clientes.

L'application propose deux espaces :

- un espace coach pour créer des programmes, les attribuer, suivre les clientes et consulter leur agenda ;
- un espace cliente pour voir ses séances, renseigner son humeur quotidienne et envoyer son ressenti après une séance.

## Stack technique

- Front-end : React, Vite, Tailwind CSS
- Back-end : Node.js, Express
- Base de données : PostgreSQL
- Authentification : JWT
- Mobile : Capacitor
- Développement local : Docker Compose pour PostgreSQL et Adminer

## Prérequis

- Node.js `20.20.2`
- npm
- Docker Desktop

Le projet contient un fichier `.nvmrc`, donc avec `nvm` :

```bash
nvm install
nvm use
```

## Installation

Depuis la racine du projet :

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Configuration

Les fichiers `.env` ne sont pas versionnés.

Créer le fichier backend :

```bash
cp backend/.env.example backend/.env
```

Créer le fichier frontend :

```bash
cp frontend/.env.example frontend/.env
```

Configuration locale par défaut :

```env
PORT=3002
JWT_SECRET=change-me
PGHOST=localhost
PGPORT=5432
PGDATABASE=sport_coach_app
PGUSER=postgres
PGPASSWORD=sportcoach
```

En production, utiliser une clé JWT longue et unique, et une configuration PostgreSQL adaptée à l'hébergement.

## Lancement en local

Démarrer PostgreSQL et Adminer :

```bash
npm run db:up
```

Démarrer le back-end et le front-end :

```bash
npm run dev
```

URLs locales :

- Front-end : `http://localhost:5180`
- API : `http://localhost:3002`
- Adminer : `http://localhost:8081`

Identifiants Adminer en local :

```text
Système : PostgreSQL
Serveur : postgres
Utilisateur : postgres
Mot de passe : sportcoach
Base de données : sport_coach_app
```

## Compte coach de démonstration

Au premier démarrage, le back-end initialise les tables et ajoute un compte coach si nécessaire :

```text
Email : admin@admin.com
Mot de passe : admin123
```

## Scripts utiles

Depuis la racine :

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run db:up
npm run db:down
```

Front-end :

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

Back-end :

```bash
cd backend
npm run dev
npm start
```

## Base de données

Le projet utilise PostgreSQL.

En local, Docker Compose lance :

- PostgreSQL sur le port `5432`
- Adminer sur le port `8081`

## Fonctionnalités principales

Espace coach :

- gestion des clientes ;
- création, modification, duplication et suppression de programmes ;
- attribution d'une séance à une ou plusieurs clientes ;
- agenda coach ;
- consultation du détail d'une cliente et de son historique.

Espace cliente :

- première connexion par e-mail puis création du mot de passe ;
- consultation des séances ;
- humeur quotidienne ;
- suivi fatigue, stress et sommeil ;
- validation de séance et ressenti après effort.

## Structure du projet

```text
.
├── backend/
│   ├── scripts/
│   └── src/
│       ├── controllers/
│       ├── db/
│       ├── middlewares/
│       ├── routes/
│       └── index.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── data/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── styles/
├── docker-compose.yml
├── package.json
└── README.md
```

## Build mobile

Le front-end peut être empaqueté avec Capacitor.

Android :

```bash
cd frontend
npm run build
npx cap add android
npx cap sync
npx cap open android
```

iOS :

```bash
cd frontend
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

Les dossiers natifs générés sont ignorés par Git.

## Notes de sécurité

Ne jamais versionner :

- les fichiers `.env` ;
- les exports ou sauvegardes locales de base de données ;
- les fichiers uploadés par les utilisateurs ;
- les dossiers générés comme `node_modules`, `dist`, `android` et `ios`.
