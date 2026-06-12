# Sport Coach App

Application mobile-first de coaching sportif avec espace coach et espace client.

Le projet est compose de deux applications :

- `backend/` : API Express, authentification JWT et base SQLite.
- `frontend/` : application React + Vite + Tailwind, avec support Capacitor.

## Prerequis

- Node.js `20.20.2`
- npm
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
PORT=3001
JWT_SECRET=change-me
```

Frontend, dans `frontend/.env` :

```env
VITE_API_URL=http://localhost:3001
```

Si aucune variable n'est definie, le backend ecoute sur `3001` et le frontend appelle `http://localhost:3001`.

## Lancement en local

Lancer backend et frontend ensemble :

```bash
npm run dev
```

Ou separement :

```bash
npm run dev:backend
npm run dev:frontend
```

URLs par defaut :

- Frontend : `http://localhost:5180`
- Backend : `http://localhost:3001`

## Scripts utiles

Racine :

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
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

La base SQLite est creee automatiquement au demarrage du backend :

```text
backend/coaching.db
```

Elle est ignoree par Git. Pour repartir d'une base propre en local, il suffit d'arreter le serveur puis de supprimer ce fichier.

Au premier demarrage, des donnees de demo et un compte coach sont crees si necessaire.

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
