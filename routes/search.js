var express = require('express');
var request = require('request');
var totitlecase = require('to-title-case');

var communities = require("../includes/communities");
var wards = require("../includes/wards");

var router = express.Router();

var url = "http://data.cityofchicago.org/resource/7as2-ds3y.json?$limit=5000&$where=status = 'OPEN' OR status = 'OPEN - DUP'";
var urlWhere = "$where=";
var urlStatusOpen = "status = 'OPEN' OR status = 'OPEN - DUP'";
var urlStatusClosed = "status = 'COMPLETED' OR status = 'COMPLETED - DUP'";
var urlWard = "ward = ";
var urlCommunity = "community_area = ";
var RegEx = /^[0-9]+/;


/* POST search page */
router.route('/').post(function (req, res) {

	var potholesFound = [];

	var theUrl = "http://data.cityofchicago.org/resource/7as2-ds3y.json?$limit=50000";

	if (req.body.status == 'Open') {
		theUrl = theUrl + '&' + urlWhere + urlStatusOpen;
	}
	else {
		theUrl = theUrl + '&' + urlWhere + urlStatusClosed;
	}

	if (req.body.areas != '') {
		theUrl = theUrl + ' AND ' + urlCommunity + "'" + req.body.areas + "'";
	}
	else {
		theUrl = theUrl + ' AND ' + urlWard + "'" + req.body.ward + "'";
	}

	request({url: theUrl, json: true}, function (error, response, potholes) {

		if (!error && response.statusCode === 200) {
			potholes.forEach(function (pothole) {
				var streetSub = pothole.street_address.toLowerCase().replace(RegEx, '');
				if (
						streetSub.indexOf(req.body.street.toLowerCase()) > -1
				) {
					var TheDate = new Date(pothole.creation_date);
					var month = TheDate.getMonth() + 1;
					if(month.toString().length === 1) {
						month = '0'+month.toString();
					}
					var date = TheDate.getDate().toString();
					if(date.length === 1)
					{
						date = '0'+date;
					}
					potholesFound.push({
						creation_date: TheDate.getFullYear()+'-'+month+'-'+date,
						service_request_number: pothole.service_request_number,
						street_address: totitlecase(pothole.street_address),
						status: pothole.status
					});

				}

			});

			var areaName = '';

			for(var i=0; i<communities.data.length; ++i ) {
				if(req.body.areas == communities.data[i].area_num) {
					areaName = communities.data[i].community;
					break;
				}
			}

			res.render('searchPost', {
				title: 'Pothole Requests Search Results',
				ward: req.body.ward,
				street: totitlecase(req.body.street),
				potholes: potholesFound,
				area: totitlecase(areaName),
				status: req.body.status
			});

		}

	});

});

/* GET search page. */
router.get('/', function (req, res) {
	for(var i=0; i<communities.data.length; ++i ) {
		communities.data[i].community_titlecase = totitlecase(communities.data[i].community);
	}

	for(var i=0; i<wards.data.length; ++i) {
		wards.data[i].alderman_titlecase = totitlecase(wards.data[i].alderman);
	}

	res.render('search', {title: 'Search for Pothole Requests', areas: communities.data, wards: wards.data});
});

module.exports = router;