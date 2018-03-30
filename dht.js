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
      this.log(`Requesting ${param} from`, this.url[param]);

      request(this.url[param], (err, response, body) => {
        if (err) {
          this.log(err);
        } else {
          const bodyObj = (response && response.statusCode === 200) && JSON.parse(body);

          const value = bodyObj ? bodyObj.value : null;

          this.log(`Returning ${param}`, value);

          next(null, value);
        }
      });
    }

  };
};

// Optional Characteristics
// this.addOptionalCharacteristic(Characteristic.StatusActive);
// this.addOptionalCharacteristic(Characteristic.StatusFault);
// this.addOptionalCharacteristic(Characteristic.StatusTampered);
// this.addOptionalCharacteristic(Characteristic.StatusLowBattery);
// this.addOptionalCharacteristic(Characteristic.Name);