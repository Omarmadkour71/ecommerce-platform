const express = require("express");

// app configuration
const app = express();

// MIDDLEWARES
// body parser
app.use(express.json());

module.exports = app;
