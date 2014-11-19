var express = require('express');
var router = express.Router();

/* search page for POSTS. */
router.get('/', function (req, res) {
	//res.render('search', { title: 'Search for Pothole Requests' });

	var ward = req.body.ward;
	var street = req.body.street;
	var html = 'Ward: ' + ward + '.<br>' +
			'Street: ' + street + '.<br>' +
			'<a href="/search">Try again.</a>';
	res.send(html);
});

module.exports = router;