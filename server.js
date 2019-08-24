// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// MongoDB config
var databaseURL = "newsBlastDb";
var collection = ["newsData"]

// Configure middleware
var PORT = process.env.PORT || 3000

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Heroku deployed DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsBlastDb";

mongoose.connect(MONGODB_URI);

// Connect mongojs config to db variable
var db = mongojs(databaseURL, collection);
db.on("error", function(error) {
    console.log("Database Error:", error);
})

// Main route/Landing page
app.get("/", function(req, res) {
    console.log("test");
    // res.send("Hello world!"); //Temporary content
})

// Listening on port 3000
app.listen(PORT, function() {
    console.log("App running on port 3000!");
})

// set up server code below here!
