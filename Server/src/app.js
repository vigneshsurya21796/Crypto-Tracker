const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const pricesRouter = require('./routes/prices');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/prices', pricesRouter);

app.use(errorHandler);

module.exports = app;
