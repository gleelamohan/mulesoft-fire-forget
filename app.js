const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

var q = 'tasks';
var url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
var open = require('amqplib').connect(url);
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Serve static files
app.use(express.static(__dirname + '/public'));

function listenForMessages() {
	open
		.then(function (conn) {
			var ok = conn.createChannel();
			ok = ok.then(function (ch) {
				ch.assertQueue(q);
				ch.consume(q, function (msg) {
					if (msg !== null) {
            console.log('Received Message!!');
						console.log(msg.content.toString());
						ch.ack(msg);
            //res.send(msg.content.toString());
          }
				});
			});
			return ok;
		})
		.then(null, console.warn);
  }

  

app.post('/publish', function (req, res) {
  console.log(req.body);
	open
		.then(function (conn) {
			var ok = conn.createChannel(); 
			ok = ok.then(function (ch) {
				ch.assertQueue(q);
        ch.sendToQueue(q, new Buffer(JSON.stringify(req.body)));
        console.log('Message Sent!!');
        //ch.close(function() {conn.close()})
        res.send({success: true, sent: req.body});
			});
		})
		.then(null, console.warn);
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`listening on port ${port}!`)); 

listenForMessages();