'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {});
});

router.get('/config', function (req, res, next) {
    res.render('config', {});
});

router.get('/resizing/', function (req, res, next) {
    var device_sizes = require('../js/device_sizes');
    var params = {
        extra_scripts: true,
        device_sizes: device_sizes
    };

    if (req.query.url) {
        params.url = req.query.url;
    }
    res.render('resizing', params);
});

module.exports = router;
