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


    //Render submission form
    app.get('/', (req, res) => {


        let schools = [
            "Auburn University (AU)", "Clemson University (Clemson)", "Emory University (Emory)", "Florida Atlantic University (FAU)", "Florida State University (FSU)", "Georgia Institute of Technology (GT) ",
            "Georgia State University (GSU)", "Kennesaw State University (KSU)", "Mercer University (Mercer)", "University of Alabama at Birmingham (UAB)", "University of Central Florida (UCF)", "University of Florida (UF)", "University of Georgia (UGA)",
            "University of North Carolina at Charlotte (UNCC)", "University of North Carolina at Greensboro (UNCG)", "University of Memphis (UM)",
            "University of South Carolina (USC)", "University of South Florida (USF)", "University of West Florida (UWF)",
        ];

        res.render("home", {
            title: "Home",
            schools,
        });
    })

    //Leaderboard displaying all teams
    app.get('/teamLeaderboard', (req, res) => {

        element3History.aggregate([{
            $group: {
                _id: "$team",
                points: {
                    $sum: "$points"
                },
               
            }
        },
      
        ]).sort({ points: -1 }).toArray(function (err, result) { 
            console.log(71, result);


            res.render("teamLeaderboard", {
                title: "Team Leaderboard",
                result: result
            });
        });;

     
      
    })

     //Leaderboard filtered by individuals
    app.get('/individualLeaderboard', (req, res) => {


        element3History.aggregate([{
            $group: {
                _id: "$name",
                points: {
                    $sum: "$points"
                },
                team: {
                    $addToSet: "$team"
                }
            }
        },
        {
            $project: {
                points: 1,
                team: 1
            }
        }
        ]).sort({ points: -1 }).toArray(function (err, result) {

           

            let schoolAbbreviations = [

            ];

            for(let i = 0; i < result.length; i++) {
                let currentSchool = result[i].team[0];
                console.log(95, currentSchool);
                let abbreviation = (currentSchool.indexOf('('));
                let abbreviation2 = (currentSchool).indexOf(')');
                console.log(97, abbreviation);
                console.log(97, abbreviation2);
                console.log(currentSchool.substring((abbreviation+1), abbreviation2));
                schoolAbbreviations[i] = currentSchool.substring((abbreviation+1), abbreviation2);
            }


            res.render("individualLeaderboard", {
                title: "Leaderboard",
                result: result,
                schoolAbbreviations,
            });


        });


    });

    //History page to display info about submissions 
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

    //Leaderboard displaying specific team
    app.get('/team/:team', (req, res) => {

        const team = req.params.team;

        let searchCriteria = {
            team: team
        };

        element3History.find(searchCriteria).sort({points: -1}).toArray(function (err, result) {



            res.render("history", {
                title: "School",
                result: result
            });
        });
    });

    //Leaderboard displaying specific individual
    app.get('/individual/:individual', (req, res) => {

        const individual = req.params.individual;

        let searchCriteria = {
            name: individual
        };

        element3History.find(searchCriteria).toArray(function (err, result) {



            res.render("history", {
                title: "Individual",
                result: result
            });
        });
    });



    //Submit points into system
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

        let tempDate = new Date().toString();

        let finalDate = tempDate.substring(0, 25);

        let history = {
            name: name,
            game: game,
            points: points,
            team: teamName,
            date: finalDate,
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

    //Save history into system 
    app.post('/saveHistory', (req, res) => {



        let history = {
            name: "Billy",
            game: "TFT",
            points: 50,
            date: new Date(),
        }

        console.log(240, history);
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