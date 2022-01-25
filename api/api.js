const express = require('express');

const artistsRouter = require('./artists');

const apiRouter = express.Router();

module.exports = apiRouter;

// Mount artistRouter
apiRouter.use('/artists', artistsRouter);