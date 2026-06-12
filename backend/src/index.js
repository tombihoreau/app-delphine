require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./db/database'); // Initialize database

const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

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
