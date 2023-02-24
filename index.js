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

    const element3History = client.db("test").collection("Element3History");


    //Render submission form
    // app.get('/', (req, res) => {

    //     res.redirect("/individualLeaderboard")
    // })

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



            res.render("teamLeaderboard", {
                title: "Team Leaderboard",
                result: result
            });
        });;



    })

    //Leaderboard filtered by individuals
    app.get('/', (req, res) => {


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

            for (let i = 0; i < result.length; i++) {
                let currentSchool = result[i].team[0];

                let abbreviation = (currentSchool.indexOf('('));
                let abbreviation2 = (currentSchool).indexOf(')');

                schoolAbbreviations[i] = currentSchool.substring((abbreviation + 1), abbreviation2);
            }


            res.render("individualLeaderboard", {
                title: "Leaderboard",
                result: result,
                schoolAbbreviations,
            });


        });


    });



    //Leaderboard displaying specific team
    app.get('/team/:team', (req, res) => {

        const team = req.params.team;

        let searchCriteria = {
            team: team
        };

        element3History.find(searchCriteria).sort({ points: -1 }).toArray(function (err, result) {



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


});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Sever started on port " + PORT);
});