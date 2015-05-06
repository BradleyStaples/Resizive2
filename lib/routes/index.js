var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	// homePage
	res.render('index', {});
});

module.exports = router;
