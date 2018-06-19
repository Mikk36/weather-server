const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("compression");
const path = require("path");

// require("console-stamp")(console, {
//   pattern: "d dddd HH:MM:ss.l"
// });
const debug = require("debug")("server");

const config = require("./config");
const Mongo = require("./mongo");

const api = require("./routes/api");

/**
 * @type {Data[]}
 */
const latestData = [];
app.set("latestData", latestData);

const state = {
  latestDataAvailable: false
};

app.set("state", state);
app.set("config", config);
app.set("mongo", new Mongo(app));
app.set("io", io);
http.listen(config.httpPort, "0.0.0.0");
http.on("listening", () => {
  debug("Server listening");
});

app.use(express.static(path.join(__dirname, "public")));
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use("/api", api);

io.on("connection", (/** Socket */ socket) => {
  debug(`New IO connection, id: ${socket.id}`);

  socket.emit("hello");

  if(state.latestDataAvailable) {
    const latest = app.get("latestData");
    socket.emit("newData", latest[1]);
  }

  socket.on("disconnect", () => {
    debug(`IO connection closed, id: ${socket.id}`);
  });
});

