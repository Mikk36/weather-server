const express = require('express');
const router = express.Router();
const debug = require("debug")("api");

router.post('/reportData', function (req, res) {
  const data = req.body;
  if (data.sensorId !== undefined) {
    req.app.get("mongo").logWeather(
        data.sensorId,
        data.temperature,
        data.humidity,
        data.pressure,
        data.co2
    );
  } else {
    debug("No Data");
  }
  res.end();
});

module.exports = router;