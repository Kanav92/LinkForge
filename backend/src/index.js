require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./config/db');
const redisClient = require('./config/redis');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const analyticsRoutes = require('./routes/analytics');
const redirectRoute = require('./routes/redirect');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/', redirectRoute);

const PORT = process.env.PORT || 5000;

async function start() {
  await redisClient.connect();
  await db.query('SELECT 1');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);
