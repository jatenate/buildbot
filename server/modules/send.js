var redis = require('redis').createClient()
  , user = require('./user')
  , twitter = require('./twitter');

var s = {};

s.send_endpoint = function(req, res) {
	var text = req.param('text');
	var to  = req.param('to');
	var token = req.param('token');

	if (!(text && to && token)) {
		res.json('Must supply text, to, and token.');
	    return;
	}

	var err_handler = get_err_handler(res);

	twitter.username_to_id(to, err_handler, function(id) {
		console.log("user_id: " + id);
		user.get_passphrase(id, function(err, stored_token) {
			if (err) {
				err_handler(err)
			} else {
				// check that they passed in the correct token
				if (stored_token === token) {
					twitter.send_dm(to, text, err_handler, function() {
						res.json('Successfully sent dm');
					});
				} else {
					console.log('Expected token: ' + stored_token);
					err_handler('Invalid token');
				}
			}
		})
	});
}

var get_err_handler = function(res) {
	return function(err, status_code) {
		// Parse err if it is a JSON object from the Twitter API.
		//if (typeof err == "object") {
		//	err = JSON.parse(err.data).error;
		//	status_code = JSON.parse(err.data).statusCode;
		//}
		console.log(err)
		res.json(err, status_code || 500);
	}
}

module.exports = s;
