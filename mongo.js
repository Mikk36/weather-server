const MongoClient = require("mongodb").MongoClient;
const debug = require("debug")("mongo");
require("console-stamp")(console, {
  pattern: "d dddd HH:MM:ss.l"
});

class Mongo {
  constructor(app) {
    this.app = app;

    const config = this.app.get("config");

    MongoClient
        .connect(`${config.mongoDB}/${config.mongoDBDatabase}`)
        .then((client) => {
          debug("MongoDB connected");
          this.db = client.db(config.mongoDBDatabase);
          this.fetchLatestData();
        });
  }

  async fetchLatestData() {
    const collection = this.db.collection("dataLog");
    const sensorId = 1;
    const hourData = await collection.findOne(
        {
          sensorId
        },
        {
          sort: [["time", -1]]
        }
    );

    const lastEntry = hourData.entries[hourData.entryCount - 1];
    lastEntry.sensorId = sensorId;
    const latestData = this.app.get("latestData");
    latestData[sensorId] = lastEntry;

    this.app.get("state").latestDataAvailable = true;
  }

  /**
   * @param {Data} data
   */
  logWeather({time, sensorId, temperature, humidity, pressure, co2}) {
    debug(`ID: ${sensorId}, temperature: ${temperature}, humidity: ${humidity}, pressure: ${pressure}, co2: ${co2}`);
    const collection = this.db.collection("dataLog");
    const timeHour = new Date(time);
    timeHour.setMinutes(0, 0, 0);

    const setObject = {
      sensorId: sensorId,
      time: timeHour
    };

    collection.updateOne({
      sensorId: sensorId,
      time: timeHour
    }, {
      $set: setObject,
      $inc: {
        entryCount: 1,
        temperatureSum: temperature,
        humiditySum: humidity,
        pressureSum: pressure,
        co2Sum: co2
      },
      $push: {
        entries: {
          time,
          temperature,
          humidity,
          pressure,
          co2
        }
      }
    }, {
      upsert: true
    })
  }
}

module.exports = Mongo;