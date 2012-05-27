var redis = require('redis').createClient()
  , password = require('password')
  , querystring = require('querystring')
  , twitter = require('./twitter');

var REDIS_PASSPHRASE_PREFIX = "passphrase_"
  , PASSPHRASE_LENGTH = 2; // # of words

var user = {};

/**
 * Initializes a new user. Creates a passphrase, inserts it into Redis, and DM's
 * it to the user.
 */
user.new_user = function(user_id, screen_name) {
	// Generate a new passphrase for the user and remove spaces.
    var passphrase = user.generate_passphrase();

    // Insert the passphrase into redis
    user.set_passphrase(user_id, passphrase);

    // DM the hash to the user
    twitter.send_dm(screen_name, 'Passphrase: ' + passphrase, 
        function(err) { // eb
            console.log('Unable to send passphrase DM to user: ' + screen_name +
                '. Error: ' + JSON.stringify(err));
        },
        function() { // cb
            console.log('Successfully sent passphrase DM to user: ' +
                screen_name);
        })
}

/**
 * Generates a new passphrase. Does not persist it (if you want to save it, @see set_passphrase).
 * @return String new passphrase
 */
user.generate_passphrase = function() {
	return password(PASSPHRASE_LENGTH).replace(/ /g, '');
}

/**
 * @param user_id to fetch stored token for
 * @param cb (optional) callback from redis, passed (err, reply)
 */
user.get_passphrase = function(user_id, cb) {
	if (cb === undefined) cb = redis.print;
	redis.get(id_to_redis_key(user_id), cb);
}

/**
 * @param user_id to fetch stored token for
 * @param passphrase passphrase to store for the user
 * @param cb (optional) callback from redis, passed (err, reply)
 */
user.set_passphrase = function(user_id, passphrase, cb) {
	if (cb === undefined) cb = redis.print;
	redis.set(id_to_redis_key(user_id), passphrase, cb);
}

var id_to_redis_key = function(user_id) {
	return REDIS_PASSPHRASE_PREFIX + user_id;
}

module.exports = user;
