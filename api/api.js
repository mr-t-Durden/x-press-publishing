const express = require('express');

const artistsRouter = require('./artists');
const seriesRouter = require('./series');

const apiRouter = express.Router();

module.exports = apiRouter;

// Mount artistRouter
apiRouter.use('/artists', artistsRouter);

// Mount seriesRouter
apiRouter.use('/series', seriesRouter);