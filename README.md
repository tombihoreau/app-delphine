# Sport Coach App

Application mobile-first de coaching sportif avec espace coach et espace client.

Le projet est compose de deux applications :

- `backend/` : API Express, authentification JWT et base PostgreSQL.
- `frontend/` : application React + Vite + Tailwind, avec support Capacitor.

## Prerequis

- Node.js `20.20.2`
- npm
- Docker Desktop pour lancer PostgreSQL en local facilement
- nvm recommande

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

Les fichiers `.env` ne sont pas versionnes.

Backend, dans `backend/.env` :

```env
PORT=3002
JWT_SECRET=change-me
PGHOST=localhost
PGPORT=5432
PGDATABASE=sport_coach_app
PGUSER=postgres
PGPASSWORD=sportcoach
```

En production, il est plus simple d'utiliser une URL fournie par l'hebergeur :

```env
DATABASE_URL=postgres://user:password@host:5432/database
DATABASE_SSL=true
JWT_SECRET=une-cle-longue-et-secrete
```

Frontend, dans `frontend/.env` :

```env
VITE_API_URL=http://localhost:3002
```

Si aucune variable n'est definie, le backend ecoute sur `3001`. En local dans ce projet, on utilise plutot `3002`, comme dans les fichiers `.env`.

## Lancement en local

Lancer backend et frontend ensemble :

```bash
npm run db:up
npm run dev
```

Ou separement :

```bash
npm run dev:backend
npm run dev:frontend
```

URLs par defaut :

- Frontend : `http://localhost:5180`
- Backend : `http://localhost:3002`

## Scripts utiles

Racine :

```bash
npm run db:up
npm run dev
npm run dev:backend
npm run dev:frontend
npm run db:down
```

Frontend :

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

Backend :

```bash
cd backend
npm run dev
npm start
```

## Base de donnees

Le backend utilise PostgreSQL. En local, le plus simple est de lancer la base avec Docker :

```bash
npm run db:up
```

Cette commande demarre un conteneur PostgreSQL avec :

```text
Base: sport_coach_app
User: postgres
Password: sportcoach
Port: 5432
```

Elle demarre aussi Adminer pour consulter la base visuellement :

```text
URL: http://localhost:8081
Systeme: PostgreSQL
Serveur: postgres
Utilisateur: postgres
Mot de passe: sportcoach
Base: sport_coach_app
```

Pour recopier l'ancienne base SQLite locale vers PostgreSQL :

```bash
npm run db:migrate:sqlite
```

Attention : cette commande remplace les donnees actuellement presentes dans PostgreSQL par celles de `backend/coaching.db`.

Si tu utilises une installation PostgreSQL locale sans Docker, cree la base manuellement :

```sql
CREATE DATABASE sport_coach_app;
```

Au premier demarrage, les tables, des donnees de demo et un compte coach sont crees si necessaire.

L'ancienne base SQLite locale `backend/coaching.db` n'est plus utilisee. Si tu as besoin de recuperer des donnees dedans, il faudra lancer un script de migration dedie avant de la supprimer.

## Compte coach par defaut

```text
Email: admin@sportcoach.com
Mot de passe: admin123
```

## Parcours utilisateur

Coach :

- Gestion des programmes
- Creation et duplication de seances
- Attribution de programmes aux clients
- Gestion des clients
- Consultation du suivi client

Client :

- Connexion par adresse e-mail
- Creation du mot de passe a la premiere connexion
- Agenda des seances
- Suivi humeur, fatigue, sommeil et stress
- Retour apres seance

## Build mobile avec Capacitor

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

Les dossiers natifs generes sont ignores par Git dans ce projet.

## Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── styles/
│   └── package.json
├── package.json
└── README.md
```

## Notes de developpement

- Les dependances, builds, fichiers `.env` et bases locales sont ignores par Git.
- Le frontend utilise `VITE_API_URL` pour joindre l'API.
- Le backend expose toutes les routes sous `/api`.
- Les assets visuels de l'application sont dans `frontend/src/assets`.
