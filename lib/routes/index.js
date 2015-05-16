'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {});
});

router.get('/config', function (req, res, next) {
    res.render('config', {});
});

router.get('/about', function (req, res, next) {
    res.render('about', {});
});

router.get('/resizing/:url', function (req, res, next) {
    res.render('resizing', {
        url: req.params.url
    });
});

module.exports = router;
