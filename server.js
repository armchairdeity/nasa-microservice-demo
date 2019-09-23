var Express = require('express');
var BodyParser = require('body-parser');
var NasaReq = require('request-promise');
var Moment = require('moment');
var _ = require('lodash');

// this needs to be in an environment variable but for quick demo purposes it's being kept here
// properly, it would be accessed using process.env.NASA_API_KEY
var apiKey = 'bJVsa6GiWn1f1Wqc9BozZEe73hJ0Eb9EPljbCF2x';

var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));

// just a quick test to verify Express config
app.get('/api/hello',(req,res) => {
	res.send('YES! I am alive!')
});

app.post(
	'/api/meteors/close-approach',
	(req,res) => {
		console.log(req.body);

		// snag the request data from the JSON body
		var startDate = req.body.dateStart;
		var endDate = req.body.dateEnd;
		var distance = req.body.within.value;

		console.log(`Input params are: dateStart ${startDate}, dateEnd ${endDate}, miss distance ${distance}`);
		
		// quick validate the dates
		console.log(`Difference between start and end dates: ${Moment(endDate).diff(Moment(startDate),'day')}`);
		if ( Moment(endDate).diff(Moment(startDate),'day') < 0 ) {
			console.log(`Date error. Start date ${startDate} must NOT be earlier than ${endDate}.`);
			res.send({error: true});
			return;
		}

		// prep the response array
		var respData = [];

		// setup the request for data from JPL
		var options = {
			uri: 'https://api.nasa.gov/neo/rest/v1/feed',
			qs: {
				start_date: startDate,
				end_date: endDate,
				api_key: apiKey
			},
			json: true
		};

		// Promise-based URI request... fire away! NASA! GIVE ME INFO!
		NasaReq(options)
			.then(
				function (meteorData) {
					// meteor data is returned by date
					// loop the dates, checking each object for distance
					// if an object hits, check the response array to make sure it's not already there
					// if it's not there, add it

					// returned data quick-ref:
					// NEO name: meteorData.near_earth_objects['2019-07-01][0].name
					// near miss distance: meteorData.near_earth_objects['2019-07-01][0].close_approach_data.miss_distance.miles
					_.each(
						// this is a name/value set of dates and NEOs
						meteorData.near_earth_objects,
						(neoData, neoDate) => {

							// this is our array of actual NEOs for that day
							_.each(
								neoData,
								(neo) => {
									// here is where we really do the all the stuffs
									var nearMissDist = neo.close_approach_data[0].miss_distance.miles;
									
									console.log(`name: ${neo.name}, miss_distance: ${nearMissDist}, reportable, ${(nearMissDist <= distance)? 'true' : 'false' }`);
									
									if (nearMissDist <= distance && _.indexOf(respData,neo.name) == -1) {
										respData.push(neo.name);
									}
								}
								);
								
							}
							);
							
					console.log(respData);
					res.send( respData );
				}
			)
			.catch(
				function (err){
					// the requirements say "just return error:true", but at least a console log will give up some troubleshooting info
					// THIS IS NO REPLACEMENT FOR PROPER LOGGING
					console.log(err);
					res.send({error: true});
				}
			);
			

	}
)

var port = process.env.PORT || 3000;

app.listen(port, function() {
   console.log('Server started on port: ' + port);
});