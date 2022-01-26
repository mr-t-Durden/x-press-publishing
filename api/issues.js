const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = express.Router({mergeParams: true});

module.exports = issuesRouter;

issuesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = $seriesId`, { $seriesId: req.params.seriesId },(err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({issues: rows});
        }
    });
});