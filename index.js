var express = require('express');

var app = express();
app.set('port', (process.env.PORT || 8482));
app.use(express.static(__dirname+'/web'));

app.listen(app.get('port'), function() {
        console.info('primaryprogram is running on port:: '+app.get('port'), {port:app.get('port')});
});
