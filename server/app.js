var express = require('express')
  , app = module.exports = express.createServer();

app.use(express.bodyParser());

// Configuration

app.configure(function(){
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
	app.set('view options', {
		layout : false
	});
});

app.get('/send', function(req, res) {
  require('./modules/send').send_endpoint(req, res);
});

// Start listening for new followers.
require('./modules/listen');

app.listen(3000);

console.log("Express server listening on port %d", app.address().port);