var OAuth = require('oauth').OAuth
  , querystring = require('querystring')
  , crypto = require('crypto');

var API_URI = 'https://api.twitter.com/1'
  , USER_STREAM_URI = 'https://userstream.twitter.com/2/user.json'
  , CONSUMER_KEY = 'YOUR_CONSUMER_KEY' 		 // REPLACE THESE WITH
  , CONSUMER_SECRET = 'YOUR_CONSUMER_SECRET' // YOUR TWITTER API
  , ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'		 // TOKENS
  , ACCESS_SECRET = 'YOUR_ACCESS_SECRET';

// The twitter api doesn't let you send the same message more than once.
// When a send fails because it's a repeat message, prepend a random hex
// strength of length RANDOM_MESSAGE_LENGTH.
var RANDOM_MESSAGE_LENGTH = 12;

var oauth = new OAuth(API_URI + '/oauth/request_token'
                    , API_URI + '/oauth/access_token'
                    , CONSUMER_KEY, CONSUMER_SECRET
                    , '1.0', null, 'HMAC-SHA1');

var twitter = {};

/**
 * @param screen_name twitter screen_name to send the dm to
 * @param text		body to send in the dm
 * @param eb		errorback called if sending the dm fails
 * @param cb		called (w/ no params) on successful send
 */
twitter.send_dm = function(screen_name, text, eb, cb) {
	// Truncate the message if it is too long.
	if (text.length > 140) {
		text = text.substring(0, 137) + '...';
	}
	var body = {screen_name: screen_name, text: text};
	oauth.post( API_URI + '/direct_messages/new.json'
			  , ACCESS_TOKEN, ACCESS_SECRET
			  , body, 'application/json'
			  , function (err) {
					if (err) {
						// If the send fails because we have sent it before,
						// prepend a random number.
						if (err.data && err.data.indexOf("You already said that") != -1) {
							var prepend = '(' + crypto.randomBytes(RANDOM_MESSAGE_LENGTH / 2).toString('hex') + ') ';
							twitter.send_dm(screen_name, prepend + text, eb, cb);
						} else {
							eb(err);
						}
					} else {
						cb();
					}
				});
}

/**
 * @param to  username to map to an id
 * @param eb  errorback (see get_error_handker) called if looking up the user
 * 			  via twitter fails.
 * @param cb  gets the user_id
 */
twitter.username_to_id = function(to, eb, cb) {
	// Map username to user_id.
  	oauth.get(API_URI + '/users/lookup.json?' 
  			+ querystring.stringify({screen_name: to})
		  , ACCESS_TOKEN, ACCESS_SECRET
		  , function(err, data, res) {
				if (err) {
					eb(err);
				} else {
					console.log(data);
					cb(JSON.parse(data)[0].id)
				}
			});
}

twitter.user_stream = function(data_handler) {
	var request = oauth.post(USER_STREAM_URI, ACCESS_TOKEN, ACCESS_SECRET, null, null);

	request.on('response', function (res) {
	    res.on('data', function(chunk) {
	        data_handler(chunk);
	    });
	    res.on('error', function(err) {
	        console.log('User stream response had error: ' + err);
	    });
	});
	request.on('error', function(err) {
	   console.log('User stream request had error: ' + err);
	});

	request.end();
}

module.exports = twitter;
