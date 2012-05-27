var user = require('./user')
  , twitter = require('./twitter');

var SEPERATOR = '\r\n' // Used to split streaming chunks.
  , SEPERATOR_LENGTH = SEPERATOR.length;

var received = '';

twitter.user_stream(function(chunk) {
    received += chunk.toString('utf8');
    var index, json;
    while ((index = received.indexOf(SEPERATOR)) > -1) {
        json = received.slice(0, index);
        received = received.slice(index + SEPERATOR_LENGTH);
        if (json.length > 0) {
            try {
                json = JSON.parse(json);
                console.log("update: " + JSON.stringify(json));
                if (json.event === 'follow') {
                    user.new_user(json.source.id, json.source.screen_name);
                }
            } catch (error) {
                received = ''; // Something is wrong, reset received.
                console.log('Unable to parse JSON from user stream: ' + error);
            }
        }
    }
});
