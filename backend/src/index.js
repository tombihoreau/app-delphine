require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/database');

const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

const startServer = async () => {
  await initDatabase();

  const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Le port ${PORT} est deja utilise. Modifie backend/.env ou libere ce port avant de relancer l'application.`
      );
      process.exit(1);
    }

    throw error;
  });
};

startServer().catch((error) => {
  console.error('Erreur au démarrage du serveur:', error);
  process.exit(1);
});
