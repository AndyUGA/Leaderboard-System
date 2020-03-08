const express = require('express');
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
var expressLayouts = require('express-ejs-layouts');
const app = express();
var ObjectID = require("mongodb").ObjectID;


const uri = "mongodb+srv://andy:test123@cluster0-iuoam.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const axios = require('axios');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");



client.connect(err => {
    const collection = client.db("test").collection("element3");


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


    app.get('/leaderboard', (req, res) => {

        collection.find({}).toArray(function (err, result) {
            console.log(result);


            res.render("leaderboard", {
                title: "Leaderboard",
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

    app.post('/increasePoints/:id', (req, res) => {

        const personID = req.params.id;
        console.log(75, personID);

        const attendeeID = { _id: new ObjectID(personID) };

        let attendeePoints = {
            $set: {
                points: 50
            }
        }


        collection.updateOne(attendeeID, attendeePoints, (err, item) => {
            if (err) {
                res.send({ "Error is ": + err });
            }
            else {
                console.log("Points updated!");
            }
        })
    });


});




app.listen(3000, () => {
    console.log("Sever started on port " + 3000);
});