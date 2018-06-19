const express = require('express');
const router = express.Router();
const debug = require("debug")("api");

router.post('/reportData', function (req, res) {
  /**
   * @type {Data}
   */
  const data = req.body;
  if (data.sensorId !== undefined) {
    data.time = new Date();
    req.app.get("mongo").logWeather(data);
    req.app.get("latestData")[data.sensorId] = data;

    /** @type Server */
    const io = req.app.get("io");

    data.time = new Date();
    io.sockets.emit("newData", data);
  } else {
    debug("No Data");
  }
  res.end();
});

/**
 *
 * @typedef {Object} Data
 * @property {Date} time
 * @property {number} sensorId
 * @property {number} temperature
 * @property {number} humidity
 * @property {number} pressure
 * @property {number} co2
 */

module.exports = router;