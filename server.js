const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const apiRouter = require('./api/api');

const app = express();

const PORT = process.env.PORT || 4000;

// Setting general behavior
app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());
app.use(morgan('dev'));

// Mount apiRouter
app.use('/api', apiRouter);

// Starting server
app.listen(PORT, ()=>{
    console.log(`Server listening at Port: ${PORT}`);
});

module.exports = app;