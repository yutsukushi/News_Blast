// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Importing models folder
var db = require("./models");

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

// ROUTES 

app.get("/", (req, res) => {
    res.render("home");
})

// web scraping process for the oceannews website
app.get("/scraped", function(req, res) {
   
    console.log("inside the scrape get route")
    axios.get("https://www.oceannews.com/news/science-technology/")
    .then(function(articles) {
        var $ = cheerio.load(articles.data);
        var titleArray =[];
        $("h2[itemprop='headline']").each(function(i, element) {
            var results = {};
            results.title = $(element)
            .text()
            .trim();
            results.link = $(element)
            .children("a")
            .attr("href");
            results.summary = $(element)
            .parent()
            .parent()
            .text()
            .trim(); 
            
            console.log("article:" ,results)
            if(results.title !== "" && results.link !== ""){
                //check for duplicates
                if(titleArray.indexOf(results.title) == -1){
                    titleArray.push(results.title);
                    // console.log("title array: " +titleArray);
                    //only add the article if it is not saved
                    db.Article.countDocuments({title: results.title}, function(err, test){
                        // if test is 0, the entry is unique and good to save
                        console.log("test: " + test)
                        if(test === 0){
                            var entry = new db.Article(results);
                            console.log("entry: " + entry);
                            entry.save(function(err, doc){
                                if(err){
                                    console.log(err);
                                }
                            })
                        }
                    })
                }
            }
        })
        db.Article.find({})
        .then(function(dbArticle) {
            var article = {db_headlines: dbArticle};
            res.render('home', article);
        })
        .catch(function(err) {
            res.json(err);
        })
        })     
})

// PSEUDOCODE

// article property, "saved", to be updated to true
// on the /savedarticles page, find all articles with "saved": true
// create a note on the article with the unique ID
 

// save articles
// app.put("/savedarticles", function(res){
//     // set clicked article property of saved to true,
//     db.Article.update({$set: { "saved": true }})
//     .then(function(savedArticle) {
//        res.json(savedArticle);
//     })
//     .catch(function(err) {
//         res.json(err);
//     })
// })

// // render the saved article in /savedarticles route
// app.get("/savedarticles", function(res) {
//     db.Article.find({ "saved": true })
//         .then(function(savedArticle) {
//             var article = { dbSaved: savedArticle };
//             res.render("saved", article);
//             // res.json(dbArticle);
//         })
//         .catch(function(err) {
//             res.json(err);
//         })
// })
    
// // post comments on specific article
// app.get("/savedarticles/:id", function(res) {
//     Note.create(req.body)
//     .then(function(dbNote){
//     return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//         // If we were able to successfully update an Article, send it back to the client
//         res.render("home", dbArticle)
//       .catch(function(err) {
//         // If an error occurred, send it to the client
//         res.json(err);
//       });
//     })
// })

// app.delete("/delete/:id", function(req, res) {
//     db.Note.remove({ note: res._id })
//     .then(function(deleteComment) {
//         res.render("saved", deleteComment);
//     })
// })

// Listening on port 3000
app.listen(PORT, function() {
    console.log("App running on port 3000!");
})

