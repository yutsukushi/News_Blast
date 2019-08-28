// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

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

// Setting up handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set("view engine", "handlebars");

// Heroku deployed DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsBlastDb";

mongoose.connect(MONGODB_URI);

// Connect mongojs config to db variable
var db = mongojs(databaseURL, collection);
db.on("error", function(error) {
    console.log("Database Error:", error);
})
app.get("/", (req, res) => {
    res.render("home");
})

// web scraping process for the oceannews website
app.get("/scraped", function(req, res) {
    var headlines =[];
    console.log("inside the scrape get route")
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
            results.summary = $(element).parent().parent()
            .text(); //TODO

            headlines.push(results);
           
        })
        console.log("headlines: " +JSON.stringify(headlines));
        model.Article.create(headlines)
            .then(function(dbArticle) {
                // View the added result in the console
                    console.log(dbArticle);
                    res.render("home", {db_headlines: dbArticle});
            })
            .catch(function(err) {
                    // If an error occurred, log it
                    console.log(err);
            });
        
    });
})

// GET route for /newsfeed route to find all articles in the database
// app.get("/newsfeed", function(req, res) {
//     model.Article.find({})
//     .then(function(dbArticle) {
//         res.json(dbArticle);
//     })
//     .catch(function(err) {
//         res.json(err);
//     })
// })

// save articles process
// app.get("/savedarticles").then(function(data){
// //     model.Article.findOne({}).then(function(req,res) {
// //       res.render("")
// // })
// })

// app.get("/savedarticles/:id").then(function(res) {
//     // post comment on specifical article
//     model.Note.create(req.body)
//         .then(function(dbNote){
//         return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//         // If we were able to successfully update an Article, send it back to the client
//         res.json(dbArticle);
//       })
//       .catch(function(err) {
//         // If an error occurred, send it to the client
//         res.json(err);
//       });
// })

// Listening on port 3000
app.listen(PORT, function() {
    console.log("App running on port 3000!");
})

// set up server code below here!
