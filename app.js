const express = require("express");
const app = express();
const { API_VERSION } = require ('./config'); 
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const releaseRoutes = require('./routes/release');
const likeRoutes = require('./routes/like');
const followRoutes = require('./routes/follow');
const notificationRoutes = require('./routes/notification');
const sponsorRoutes = require('./routes/sponsor');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
  });

app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, releaseRoutes);
app.use(`/api/${API_VERSION}`, likeRoutes);
app.use(`/api/${API_VERSION}`, followRoutes);
app.use(`/api/${API_VERSION}`, notificationRoutes);
app.use(`/api/${API_VERSION}`, sponsorRoutes);

// Exportar app
module.exports = app;


