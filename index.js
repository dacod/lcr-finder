
var dingDong = require('ding-dong');
var Joi = require('joi');
var mongoose = require('mongoose');

//var lcrWeb = require('lcr-web');

var ConfigSchema = require('./lib/configSchema');
var Handler = require('./lib/handler');
var Logger = require('./lib/logger');
var Finder = require('./lib/finder');
var ResourceSchema = require('./lib/resource');

var Server = function (config) {

    var logger;

    var log = function (text, object) {
        if (logger) {
            logger.info(text, object);
        } else {
            console.log(text, object);
        }
    };

    var validate = function (callback) {
        Joi.validate(config, ConfigSchema, callback);
    };

    var init = function () {

        var Resource = mongoose.model(
          'Resource', new ResourceSchema(config.mongo.collection)
        );

        mongoose.connect(config.mongo.connectionString);

        var handler = new Handler(new Finder(Resource), config);

        if (config['logger']) {
            logger = new Logger(config['logger']);
            handler.setLogger(logger);
        };

        dingDong
            .createServer(handler.handle)
            .listen(config.agi['port']);

        /*
            var voicerWeb = new VoicerWeb(source, config['web']);
            voicerWeb.start();
        */
        
        log('server started');
    };

    this.start = function () {
        validate(function (err, value) {
            if (err) {
                log('config.js have errors', err);
            } else {
                log('config.js validated successfully!');
                init();    
            }
        });
    };
};

module.exports = Server;