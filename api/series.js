const express = require('express');
const sqlite3 = require('sqlite3');

const issuesRouter = require('./issues');

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
seriesRouter.param('seriesId', (req, res, next, id) => {
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

// Read specific series via id
seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({ series: req.series });
});

// Create a new series
seriesRouter.post('/', (req, res, next) => {
    if( req.body.series.name && req.body.series.description ) {
        db.run(`INSERT INTO Series (name, description) VALUES ($name, $description)`, {
            $name: req.body.series.name,
            $description: req.body.series.description
        }, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Series WHERE id = $id`, { $id: this.lastID }, (err, newSeries) => {
                    res.status(201).json({series: newSeries});
                });
            }
        });
    } else {
        res.status(400).send('Missing Data (name, description)!')    
    }
});

// Update specific series via id
seriesRouter.put('/:seriesId', (req, res, next) => {
    if( req.body.series.name && req.body.series.description ) {
        db.run(`UPDATE Series SET name = $name, description = $description WHERE id = $id`, {
            $id: req.params.seriesId,
            $name: req.body.series.name,
            $description: req.body.series.description
        }, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Series WHERE id = $id`, { $id: req.params.seriesId }, (err, updatedSeries) => {
                    res.status(200).json({series: updatedSeries});
                });
            }
        });
    } else {
        res.status(400).send('Missing Data (name, description)!')    
    }
});

// Mount issuesRouter
seriesRouter.use('/:seriesId/issues', issuesRouter);


