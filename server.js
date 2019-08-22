// Dependencies
var express = require("express");
var mongojs = require("mongojs");

var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// MongoDB config
var databaseURL = "newsBlastDb";
var collection = ["newsData"]

// Heroku deployed DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// mongoose.connect(MONGODB_URI);

if (process.env.MONGODB_URI) { 
    mongoose.connect(MONGODB_URI);
} else { 
    var databaseURL = "newsBlastDb";
    var collection = ["newsData"]
}

// Connect mongojs config to db variable
var db = mongojs(databaseURL, collection);
db.on("error", function(error) {
    console.log("Database Error:", error);
})

// Main route/Landing page
app.get("/", function(req, res) {
    res.send("Hello world!"); //Temporary content
})

// Listening on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
})

// set up server code below here!
