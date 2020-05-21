const express = require('express');
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
var expressLayouts = require('express-ejs-layouts');
const app = express();
var ObjectID = require("mongodb").ObjectID;


const uri = process.env.connection;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const axios = require('axios');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");



client.connect(err => {
    const collection = client.db("test").collection("Element3");
    const element3History = client.db("test").collection("Element3History");

    app.get('/', (req, res) => {

        res.render("home", {
            title: "Home"
        });
    })

    app.get('/scanner', (req, res) => {
        res.render("scanner", {
            title: "QR Code Scanner"
        });
    });


    app.get('/teamLeaderboard', (req, res) => {

        
        collection.find({}).sort({points: -1}).toArray(function (err, result) {



            res.render("teamLeaderboard", {
                title: "Team Leaderboard",
                result: result
            });
        });
    });

    app.get('/individualLeaderboard', (req, res) => {

       
        element3History.aggregate([ { 
            $group: { 
                _id: "$name", 
                points: { 
                    $sum: "$points" 
                } 
            } 
        } ] ).sort({points: -1}).toArray(function (err, result) {
         
            console.log(68, result); 
            res.render("individualLeaderboard", {
                title: "Leaderboard",
                result: result
            });

           
        });


    });
    app.get('/history', (req, res) => {

        let searchCriteria = {

        };

        element3History.find(searchCriteria).toArray(function (err, result) {



            res.render("history", {
                title: "history",
                result: result
            });
        });
    });

    app.get('/team/:team', (req, res) => {

        const team = req.params.team;

        let searchCriteria = {
            team: team
        };

        element3History.find(searchCriteria).toArray(function (err, result) {



            res.render("history", {
                title: "history",
                result: result
            });
        });
    });


    
    app.get('/individual/:individual', (req, res) => {

        const individual = req.params.individual;

        let searchCriteria = {
            name: individual
        };

        element3History.find(searchCriteria).toArray(function (err, result) {



            res.render("history", {
                title: "history",
                result: result
            });
        });
    });

    


    app.get('/saveImage', (req, res) => {

        axios.get('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example')
            .then(function (response) {

                console.log(response);
                require("fs").writeFile("out.png", response.data, function (err) {
                    console.log(err);
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })


    });




    app.post('/increasePoints', (req, res) => {

        const personID = req.params.id;
        const points = parseInt(req.body.points);
        const teamName = req.body.teamName;

        const name = req.body.player;
        const game = req.body.game;

        console.log(80, teamName);
        console.log(81, points);

        //const attendeeID = { _id: new ObjectID(personID) };
        const teamIdentifier = {
            name: teamName
        };


        let teamPoints = {
            $inc: {
                points: points
            }
        }

        let history = {
            name: name,
            game: game,
            points: points,
            team: teamName,
        }


        collection.updateOne(teamIdentifier, teamPoints, (err, item) => {
            if (err) {
                res.send({ "104 Error is ": + err });
            }
            else {

                console.log("Added " + points + " points to " + teamName);

            }
        });
        element3History.insertOne(history, (err, item) => {
            if (err) {
                console.log(131, err);
                res.send({ "131 Error is ": + err });
            }
            else {
                console.log("Saved history successfully");
            }
        });





        res.redirect("/");
    });

    app.post('/saveHistory', (req, res) => {



        let history = {
            name: "Billy",
            game: "TFT",
            points: 50
        }


        element3History.insertOne(history, (err, item) => {
            if (err) {
                console.log(131, err);
                res.send({ "131 Error is ": + err });
            }
            else {
                console.log("Saved history successfully");
            }
        });
        console.log("History saved successfully");
        res.redirect("/");

    });







});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Sever started on port " + PORT);
});