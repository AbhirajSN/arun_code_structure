'use strict';

var config = require('./config')('dev'),
    express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    path = require('path'),
    figlet = require('figlet'),
    chalk = require('chalk');

figlet('DEMO APP', function (err, data) {
    if (err) {
        console.log('Something went wrong...', err);
        return;
    }
    console.log(chalk.blue(data));
});

var app = express();
app.config = config;
let mongo_id = require('mongoose').Types.ObjectId;

var validator = require('express-validator');
app.use(validator({
    customValidators: {
        isArray: function (value) {
            return Array.isArray(value);
        },

        eachIsMongoId: function (values) {
            console.log('values', values);
            if (!Array.isArray(values) || !values.length) {
                return false;
            }
            return values.every(function (val) {
                return mongo_id.isValid(val);
            });
        },

        eachIsEmpty: function (values, prop) {
            console.log('values', values);
            console.log('prop', prop);
            return values.every(function (val) {
            });
        }
    }
})
);

let file_name = path.basename(__filename);
var eventemitter = require('events').EventEmitter;
app.EventEmitter = eventemitter;
app.utility = require('./utility/');

// Setup Redis connection
var redis = require("redis");
app.redis_client = redis.createClient({ host: config.redis.host, port: config.redis.port });
app.redis_client.on("error", function (err) {
    console.log("[  Redis Connection Error ]", err);
    process.exit(1);
});

//setup mongoose
mongoose.Promise = global.Promise;
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', function (err) {
    console.log("[ Mongo DB Connection Error ]", err);
    process.exit(1);
})

app.db.once('open', function () {
    //and... we have a data store
    console.log(1, "Mongo DB Connected Successfully", null, file_name, null, null);
    //config data models
    require('./models')(app, mongoose);

    //settings
    app.disable('x-powered-by');
    app.set('port', config.port);

    app.use(require('serve-static')(path.join(__dirname, 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    //setup routes
    require('./routes')(app);

    //listen up
    app.listen(app.config.port, function () {
        //and... we're live
        console.log(' Server is running on port ' + ' ' + config.port, file_name, "");
    });
});