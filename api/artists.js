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

artistsRouter.param('artistId', (req, res, next, id) => {
    db.get(`SELECT * FROM Artist WHERE id=$id`, { $id: id }, (err, artist) => {
        if(err) {
            next(err)
        } else if(!artist) {
            res.status(404).send('Invalid Artist-ID!');
        } else {
            req.artist = artist;
            next();
        }
    }) 
});

artistsRouter.get('/:artistId', (req, res, next) => {
   res.status(200).json({artist: req.artist}); 
});

artistsRouter.post('/', (req, res, next) => {
    if( req.body.artist.name && req.body.artist.dateOfBirth && req.body.artist.biography ) {
        if( !req.body.artist.isCurrentlyEmployed ) {
            req.body.artist.isCurrentlyEmployed = 1;
        }
        db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`, {
            $name: req.body.artist.name,
            $dateOfBirth: req.body.artist.dateOfBirth,
            $biography: req.body.artist.biography,  
            $isCurrentlyEmployed: req.body.artist.isCurrentlyEmployed
        }, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Artist WHERE id = $id`, { $id: this.lastID }, (err, newArtist) => {
                    res.status(201).json({artist: newArtist});
                });
            }
        });
    } else {
        res.status(400).send('Missing data (name, date_of_birth or biography)!');
    }
});
