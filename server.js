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

var model = require("./models");
// Establishing port
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

// web scraping process for the oceannews website
app.get("/scraped", function(req, res) {
    axios.get("https://www.oceannews.com/news/science-technology/")
    .then(function(articles) {
        var $ = cheerio.load(articles.data);
        var results = {};

        $("h2[itemprop='headline']").each(function(i, element) {
            results.title = $(element)
            .text();
            results.link = $(element)
            .children("a")
            .attr("href");
        
            model.Article.create(results)
                .then(function(dbArticle) {
                // View the added result in the console
                    console.log(dbArticle);
                    })
                    .catch(function(err) {
                    // If an error occurred, log it
                    console.log(err);
                    });
        })
    })
    res.send("Scrape complete");
})

// GET route for /newsfeed route to find all articles in the database
app.get("/newsfeed", function(req, res) {
    model.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    })
})

// Listening on port 3000
app.listen(PORT, function() {
    console.log("App running on port 3000!");
})

// set up server code below here!
