const express = require('express');
const sqlite3 = require('sqlite3');

const seriesRouter = express.Router();

module.exports = seriesRouter;

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Read all series
seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({series: rows});
        }
    });
});

// Handle parameter :seriesId
seriesRouter.param('sereisId', (req, res, next, id) => {
    db.get(`SELECT * FROM Series WHERE id = $id`, { $id: id }, (err, series) => {
        if(err) {
            next(err);
        } else {
            if( !series ) {
                res.status(404).send('Invalid Series-ID!');
            } else {
                req.series = series;
                next();
            }
        }
    });
});
