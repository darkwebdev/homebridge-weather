'use strict';

const dhtFactory = require('./dht');

module.exports = function (homebridge) {
  console.log('homebridge API version: ' + homebridge.version);

  homebridge.registerAccessory('homebridge-dht', 'DHT11@TvRoom', dhtFactory(
    homebridge.hap.Service,
    homebridge.hap.Characteristic
  ));
};
