require('dotenv').config();
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

if (!process.env.MONGODB_URI) {
  console.error('The environment variable MONGODB_URI needs to be set (e.g. mongodb://localhost:27017)');
  process.exit(-1);
}
if (!process.env.PASSCODE) {
  console.error('The environment variable PASSCODE needs to be set (e.g. primaria)');
  process.exit(-1);
}

let mongodb_uri = process.env.MONGODB_URI || '';
let passcode = process.env.PASSCODE||'';

console.info('Connecting to database...');
MongoClient.connect(mongodb_uri, {
  useNewUrlParser: true
}, function(err, client) {
  if (err) {
    console.error('Error connecting to database: ' + err.message);
    process.exit(-1);
    return;
  }

  let db=client.db('primaryprogram');

  let app = express();
  app.set('json spaces', 4); // when we respond with json, this is how it will be formatted
  app.use(express.json());
  app.set('port', (process.env.PORT || 8482));
  app.get('/get/records', function(req, res) {
    if (req.query.passcode!=passcode) {
    	res.json({error:'Invalid passcode.'});
    	return;
    }
    get_records(db,function(err,stats) {
    	if (err) {
    		res.json({error:err.message});
    		return;
    	}
    	res.json(stats);
    });
    
  });
  app.post('/set/record', function(req, res) {
  	let obj = req.body || {};
  	if (typeof(obj) != 'object') {
      res.json({error:'Unexpected request body type.'});
      return;
    }
    if (!obj.record) {
    	res.json({error:'Missing field: record'});
      return;	
    }
    if (!obj.browser_id) {
    	res.json({error:'Missing field: browser_id'});
    	return;
    }
  	set_record(db,obj.browser_id,obj.record,function(err) {
  		if (err) {
  			res.json({error:err.message});
  			return;
  		}
  		res.json({success:true});
  	});
  });
  app.use(express.static(__dirname + '/web'));

  app.listen(app.get('port'), function() {
    console.info('primaryprogram is running on port:: ' + app.get('port'), {
      port: app.get('port')
    });
  });
});

function get_records(db,callback) {
	let C=db.collection('records');
	C.find({}).toArray(function(err,documents) {
		if (err) {
			callback(err);
			return;
		}
		callback(null,{records:documents});
	});
}

function set_record(db,browser_id,record,callback) {
	let C=db.collection('records');
	C.save({
		_id:browser_id,
		record:record
	},function(err) {
		callback(err);
	});
}
