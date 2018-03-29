'use strict';

const request = require('request');

module.exports = (Service, Characteristic) => {
  return class {
    constructor(log, config) {
      this.log = log;
      this.url = {
        temp: config['tempUrl'],
        hum: config['humUrl']
      };
      this.cache = {};
      this.intervalSec = {
        temp: config['tempIntervalSec'],
        hum: config['humIntervalSec']
      };
      this.lastUpdateSec = {};
    }

    getServices() {
      const informationService = new Service.AccessoryInformation();
      informationService
        .setCharacteristic(Characteristic.Manufacturer, 'Generic')
        .setCharacteristic(Characteristic.Model, 'DHT11')
        .setCharacteristic(Characteristic.SerialNumber, '000-0000-011');

      const tempService = new Service.TemperatureSensor('Temperature');
      tempService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .setProps({ minValue: 0 })
        .setProps({ maxValue: 40 })
        .on('get', this.fetchTemp.bind(this));

      const humService = new Service.HumiditySensor('Humidity');
      humService
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .setProps({ minValue: 0 })
        .setProps({ maxValue: 100 })
        .on('get', this.fetchHum.bind(this));

      return [informationService, tempService, humService];
    }

    fetchTemp(next) {
      this.fetch('temp', next);
    }

    fetchHum(next) {
      this.fetch('hum', next);
    }

    fetch(param, next) {
      const unixTimeSec = new Date().getTime() / 1000;
      const intervalPassed = this.lastUpdateSec[param] + this.intervalSec[param] > unixTimeSec;

      if (this.cache[param] && !intervalPassed) {
        this.log(`Returning cached ${param}`, this.cache[param]);
      } else {
        this.log(`Requesting ${param} from`, this.url[param]);

        request(this.url[param], (err, response, body) => {
          if (err) {
            this.log(err);
          } else {
            const bodyObj = (response && response.statusCode === 200) && JSON.parse(body);

            this.cache[param] = bodyObj ? bodyObj.value : null;
            this.lastUpdateSec[param] = unixTimeSec;

            this.log(`Caching ${param}`, this.cache[param]);
          }
        });
      }

      next(null, this.cache[param]);
    }

  };
};

// Optional Characteristics
// this.addOptionalCharacteristic(Characteristic.StatusActive);
// this.addOptionalCharacteristic(Characteristic.StatusFault);
// this.addOptionalCharacteristic(Characteristic.StatusTampered);
// this.addOptionalCharacteristic(Characteristic.StatusLowBattery);
// this.addOptionalCharacteristic(Characteristic.Name);