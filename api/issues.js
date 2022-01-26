const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = express.Router({mergeParams: true});

module.exports = issuesRouter;

// Read all issues from Issue Table for related series
issuesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = $seriesId`, { $seriesId: req.params.seriesId },(err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({issues: rows});
        }
    });
});

// Create new issue for related series
issuesRouter.post('/', (req, res ,next) => {
    if ( req.body.issue.name && req.body.issue.issueNumber && req.body.issue.publicationDate && req.body.issue.artistId ) { 
        // Check for valid artistId.
        db.get(`SELECT * FROM Artist WHERE id = $artistId`, { $artistId: req.body.issue.artistId }, (err, artist) => {
            if(!artist) {
                res.status(400).send('Invalid artist-ID!');
            } 
        });

        db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`, {
            $name: req.body.issue.name,
            $issueNumber: req.body.issue.issueNumber,
            $publicationDate: req.body.issue.publicationDate,
            $artistId: req.body.issue.artistId,
            $seriesId: req.params.seriesId
        }, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Issue WHERE id = $id`, { $id: this.lastID }, (err, newIssue) => {
                    res.status(201).json({issue: newIssue});
                });
            }
        });
    } else {
        res.status(400).send('Missing data (name, issueNumber, publicationDate, artistId)!');
    }
});

// Handle issueId parameter
issuesRouter.param('issueId', (req, res, next, id) => {
    db.get(`SELECT * FROM Issue WHERE id = $issueId`, { $issueId: id }, (err, issue) => {
        if(err) {
            next(err);
        } else {
            if(issue) {
                req.issue = issue;
                next(); 
            } else {
                res.status(404).send('Invalid issueId!');
            }
        }
    });
});

// Update specific Issue
issuesRouter.put('/:issueId', (req, res, next) => {
    if ( req.body.issue.name && req.body.issue.issueNumber && req.body.issue.publicationDate && req.body.issue.artistId ) {
        // Check for valid artistId.
        db.get(`SELECT * FROM Artist WHERE id = $artistId`, { $artistId: req.body.issue.artistId }, (err, artist) => {
            if(!artist) {
                res.status(400).send('Invalid artist-ID!');
            } 
        });

        db.run(`UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId, series_id = $seriesId WHERE id = $id `, {
            $id: req.params.issueId,
            $name: req.body.issue.name,
            $issueNumber: req.body.issue.issueNumber,
            $publicationDate: req.body.issue.publicationDate,
            $artistId: req.body.issue.artistId,
            $seriesId: req.params.seriesId
        }, (err) => {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Issue WHERE id = $id`, { $id: req.params.issueId }, (err, updatedIssue) => {
                    if(err) {
                        next(err);
                    } else {
                        res.status(200).json({issue: updatedIssue});
                    }
                });
            }
        });
    } else {
        res.status(400).send('Missing data (name, issueNumber, publicationDate, artistId)!');
    }
});