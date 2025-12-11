const mongoose = require("mongoose");
const bodyParse = require("body-parser");
const app = require("express")();
const moment = require("moment");

// Live Reload configuration
// Make livereload optional/configurable via environment variables so local dev
// and containerized runs don't conflict on the same host ports.
// Enable livereload only when LIVERELOAD is explicitly set to 'true' and
// NODE_ENV is not 'production'. This avoids attempting to require dev-only
// modules in production images unless the env explicitly enables them.
const ENABLE_LIVERELOAD =
  String(process.env.LIVERELOAD).toLowerCase() === "true" &&
  process.env.NODE_ENV !== "production";
const LIVERELOAD_PORT = process.env.LIVERELOAD_PORT
  ? Number(process.env.LIVERELOAD_PORT)
  : 35729;

let liveReloadServer;
let connectLiveReload;
if (ENABLE_LIVERELOAD) {
  // require live reload modules only when enabled so production images that
  // omit devDependencies won't fail at module resolution time.
  const livereload = require("livereload");
  connectLiveReload = require("connect-livereload");

  liveReloadServer = livereload.createServer({ port: LIVERELOAD_PORT });
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });
}

// Fontend route
const FrontRouter = require("./routes/front");

// Set ejs template engine
app.set("view engine", "ejs");

// Only use the connect-livereload middleware when live reload is enabled.
if (ENABLE_LIVERELOAD && connectLiveReload) {
  app.use(connectLiveReload({ port: LIVERELOAD_PORT }));
}

app.use(bodyParse.urlencoded({ extended: false }));
app.locals.moment = moment;

// Export the Express app for testing/runtime control
app.use(FrontRouter);

// Only connect to the database and start the server when this file is
// executed directly (not when required by tests).
if (require.main === module) {
  // Database connection
  const db = require("./config/keys").mongoProdURI;
  mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log(`Mongodb Connected`))
    .catch((error) => console.log(error));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
