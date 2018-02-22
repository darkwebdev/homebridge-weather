const request = require('request');
const url = require('url');

let Service;
let Characteristic;
let logger;
let getUrl;
let temp;
let lastUpdateSec = 0;

module.exports = function (homebridge) {
    console.log("homebridge API version: " + homebridge.version);

    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('weather-plugin', 'Weather', Weather);
};

class Weather {
    constructor(log, config) {
        logger = log;
        getUrl = url.parse(config['getUrl']);
        // postUrl = url.parse(config['postUrl']);
    }

    getServices() {
        const informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "tim")
            .setCharacteristic(Characteristic.Model, "model")
            .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

        const tempService = new Service.TemperatureSensor("Temp");
        tempService
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({minValue: 0})
            .setProps({maxValue: 40})
            .on('get', fetchTemp);

        return [informationService, tempService];
    }
}

function fetchTemp(next) {
    const unixTimeSec = new Date().getTime() / 1000;
    const intervalPassed = lastUpdateSec + 60 > unixTimeSec;

    if (temp && intervalPassed) {
        next(null, temp);
    }

    temp = 20;
    //next(error)

    logger('Returning cached temp', temp);

    next(null, temp);
}

function logged(error, response) {
    response && logger('STATUS: ' + response.statusCode);
    logger(error.message);

    return error;
}