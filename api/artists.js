const express = require('express');
const sqlite3 = require('sqlite3');

const artistsRouter = express.Router();

module.exports = artistsRouter;

const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

artistsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({artists: rows});
        }
    });
});

