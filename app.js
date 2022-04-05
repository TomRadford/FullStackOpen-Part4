const express = require('express');
const config = require('./utils/config');

const app = express();

const cors = require('cors');

const blogsRouter = require('./controllers/blogs');

const middleware = require('./utils/middleware');

const logger = require('./utils/logger');

// const mongoose = require('mongoose');

// logger.info('Connecting to', config.MONGODB_URI);

// mongoose.connect(config.MONGODB_URI)
//   .then(() => {
//     logger.info('Connected to MongoDB');
//   })
//   .catch((error) => {
//     logger.error('Error connecting to MongoDB', error.message);
//   });

app.use(cors);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hi').end();
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

// app.use('/api/blogs', blogsRouter);

module.exports = app;
