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

					var CreateDate = new Date(pothole.creation_date);
					var createMonth = CreateDate.getMonth() + 1;
					if(createMonth.toString().length === 1) {
						createMonth = '0'+createMonth.toString();
					}
					var createDate = CreateDate.getDate().toString();
					if(createDate.length === 1)
					{
						createDate = '0'+createDate;
					}

					if(pothole.completion_date) {
						var CompleteDate = new Date(pothole.completion_date);
						var completeMonth = CompleteDate.getMonth() + 1;
						if (completeMonth.toString().length === 1) {
							completeMonth = '0' + completeMonth.toString();
						}
						var completeDate = CompleteDate.getDate().toString();
						if (completeDate.length === 1) {
							completeDate = '0' + completeDate;
						}

						potholesFound.push({
							creation_date: CreateDate.getFullYear() + '-' + createMonth + '-' + createDate,
							completion_date: CompleteDate.getFullYear() + '-' + completeMonth + '-' + completeDate,
							service_request_number: pothole.service_request_number,
							street_address: totitlecase(pothole.street_address),
							status: pothole.status
						});
					}
					else{
						potholesFound.push({
							creation_date: CreateDate.getFullYear() + '-' + createMonth + '-' + createDate,
							completion_date: '',
							service_request_number: pothole.service_request_number,
							street_address: totitlecase(pothole.street_address),
							status: pothole.status
						});
					}

				}

			});

			var areaName = '';

			for(var i=0; i<communities.data.length; ++i ) {
				if(req.body.areas == communities.data[i].area_num) {
					areaName = communities.data[i].community;
					break;
				}
			}

			res.render('indexPost', {
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

	res.render('index', {title: 'Search for Pothole Requests', areas: communities.data, wards: wards.data});
});

module.exports = router;
