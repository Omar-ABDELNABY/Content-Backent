const logger = require('./logger/logger');
const app = require('./app');
const config = require('config');

require('./prod')(app);

const port = process.env.PORT || "3000";

if(!config.get('jwtPrivateKey')){
    console.log("FATAL ERROR: jwtPrivateKey is not defined");
    console.log('To set it run: $env:content_jwtPrivateKey="value"');
    process.exit(1);
}
app.listen(port, () => logger.log('info', 'Listening on port ' + port));
