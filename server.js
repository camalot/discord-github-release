"use strict";

const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const reload = require("reload");
const watch = require("watch");
const flash = require("connect-flash");
const session = require("express-session");
const config = require("./config");
const app = express();
//const cookieSession = require("cookie-session");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// require("./lib/hbs/xif");
require("./lib/hbs/sections");
// require("./lib/hbs/partials");

app.use(favicon(path.join(__dirname, "public/images", "favicon.ico")));
app.use("/assets", express.static(path.join(__dirname, "public")));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "aikems93ja032~39@ajawkkdugfldeiwkql23",
    resave: true,
    saveUninitialized: true
  })
);
// app.use(cookieSession({
// 	name: 'session',
// 	keys: ['aikems93ja032~39@ajawkkdugfldeiwkql23'],

// 	// Cookie Options
// 	maxAge: 24 * 60 * 60 * 1000 // 24 hours
// }))


// console.log(config.isProduction);
// console.log(`http://${config.isProduction ? config.site.hostName : "localhost:3000"}/auth/twitch/callback`);

// this should be after the passport session
// app.use(require("./lib/middleware/subscriber"));
// app.use(require("./lib/middleware/user"));
// app.use(require("./lib/middleware/site"));
// app.use(require("./lib/middleware/perks"));
//app.use(require("./lib/middleware/badges"));

app.use(flash());

// let reloader = reload(app, { port: 9856 });
// watch.watchTree(config.slPath, {
// 	interval: 60,
// 	ignoreDotFiles: true
// }, function (f, curr, prev) {
// 	reloader.reload();
// });

require("./routes")(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error("Page Not Found");
  err.status = 404;
  res.status(404);
  res.locals.message = err.message;
  res.render("404", { title: err.status || 404 });
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", { title: "Error: " + err.status || 500 });
});

module.exports = app;
